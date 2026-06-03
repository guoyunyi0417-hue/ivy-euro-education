const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { URL } = require("url");

const rootDir = __dirname;
const initialPort = Number(process.env.PORT || 8000);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendText(res, statusCode, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
  });
  res.end(text);
}

function normalizeText(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, " ");
}

function scoreSource(question, source, mode) {
  const normalized = normalizeText(question);
  let score = 0;

  if (mode?.preferredSources?.includes(source.id)) {
    score += 3;
  }

  source.keywords?.forEach((keyword) => {
    if (normalized.includes(normalizeText(keyword).trim())) {
      score += 2;
    }
  });

  return score;
}

function getTopSources(question, knowledgeBase, mode) {
  const sources = Array.isArray(knowledgeBase?.sources) ? knowledgeBase.sources : [];
  const scored = sources
    .map((source) => ({ source, score: scoreSource(question, source, mode) }))
    .sort((a, b) => b.score - a.score);

  const top = scored.filter(({ score }) => score > 0).slice(0, 3).map(({ source }) => source);
  return top.length ? top : sources.slice(0, 3);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wordTokens(value) {
  return normalizeText(value).split(/\s+/).filter(Boolean);
}

function buildPronunciationFallback(referenceText, transcriptText) {
  const refWords = wordTokens(referenceText);
  const trWords = wordTokens(transcriptText);
  const matched = refWords.filter((word) => trWords.includes(word));
  const overlap = refWords.length ? matched.length / refWords.length : 0;
  const extraWords = Math.max(0, trWords.length - refWords.length);
  const missingWords = Math.max(0, refWords.length - matched.length);
  const punctuationBonus = /[.?!]/.test(transcriptText) ? 6 : 0;

  const accuracy = clamp(Math.round(58 + overlap * 42 - extraWords * 2), 40, 100);
  const completeness = clamp(Math.round(overlap * 100), 35, 100);
  const fluency = clamp(Math.round(72 - Math.abs(trWords.length - refWords.length) * 3 + punctuationBonus), 35, 100);
  const prosody = clamp(Math.round(66 + (referenceText.length > 18 ? 8 : 4) - missingWords * 2), 35, 100);
  const pronunciation = Math.round((accuracy * 0.4) + (fluency * 0.25) + (completeness * 0.2) + (prosody * 0.15));

  const weakPoints = [];
  if (accuracy < 85) weakPoints.push("部分单词发音还可以更清楚");
  if (fluency < 85) weakPoints.push("句子节奏可以再连贯一点");
  if (completeness < 85) weakPoints.push("有几个关键词还没完整读到");
  if (prosody < 85) weakPoints.push("重音和语调可以再跟着标准句练一次");

  return {
    pronunciation,
    accuracy,
    fluency,
    completeness,
    prosody,
    transcriptText: transcriptText || "",
    referenceText,
    feedback: weakPoints.length ? weakPoints : ["读得很稳定，可以进入下一句。"],
    nextStep: pronunciation >= 85 ? "继续挑战更长一句，加入问答练习。" : "再跟读一次，重点放在重音和停顿。",
    mode: "local",
  };
}

function buildLocalReply(payload) {
  const question = payload.question || "";
  const mode = payload.mode || { id: "dialogue", label: "对话", title: "对话" };
  const knowledgeBase = payload.knowledgeBase || {};
  const topSources = payload.topSources?.length ? payload.topSources : getTopSources(question, knowledgeBase, mode);
  const sourceNames = topSources.map((source) => source.name || source.id).join("、");
  const defaults = payload.defaults || {};

  return {
    title: `${payload.tutorName || "IvyEuro Tutor"}已调用：${sourceNames || "知识库"}`,
    body: [
      `${mode.title || mode.label || "对话"}：我先从知识库里检索到了相关条目，然后按课堂逻辑组织回答。`,
      `当前功能：${mode.label || "对话"}`,
      `当前问题更适合的处理方式是：${defaults.focus || "先检索知识库，再给出示范和练习"}`,
      `示范句可以先用：${defaults.example || "先从一句短句开始"} `,
      `下一步：${defaults.nextStep || "先做示范，再让学生复练"}`,
      defaults.extra || "你可以继续追问：请给我一个更简单的版本。",
    ],
    sources: topSources,
  };
}

async function callOpenAICompatibleAPI(payload) {
  const baseUrl = process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL;
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  const model = process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!baseUrl || !apiKey) {
    return null;
  }

  const mode = payload.mode || { label: "对话", title: "对话" };
  const topSourceNames = (payload.topSources || []).map((source) => source.name || source.id).join("、");

  const systemPrompt = [
    `You are ${payload.tutorName || "an education tutor"} for a bilingual school.`,
    "Answer in concise Chinese unless the mode or question clearly asks for another language.",
    "Use the provided knowledge base first.",
    "Return JSON only with keys: title, body, sources.",
    "body must be an array of 4 to 6 short strings.",
    "sources must be an array of objects with id and name.",
  ].join(" ");

  const userPrompt = JSON.stringify({
    question: payload.question || "",
    mode,
    knowledgeBaseSources: Array.isArray(payload.knowledgeBase?.sources)
      ? payload.knowledgeBase.sources.map((source) => ({
          id: source.id,
          name: source.name,
          summary: source.summary,
          focus: source.focus,
          keywords: source.keywords,
        }))
      : [],
    topSourceNames,
    defaults: payload.defaults || {},
  });

  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(content);
    return {
      title: parsed.title || `${payload.tutorName || "IvyEuro Tutor"}已调用知识库`,
      body: Array.isArray(parsed.body) ? parsed.body : [String(parsed.body || content)],
      sources: Array.isArray(parsed.sources) && parsed.sources.length ? parsed.sources : payload.topSources || [],
    };
  } catch {
    return {
      title: `${payload.tutorName || "IvyEuro Tutor"}已调用知识库`,
      body: content
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 6),
      sources: payload.topSources || [],
    };
  }
}

async function handleTutorAsk(payload) {
  const localReply = buildLocalReply(payload);

  try {
    const remoteReply = await callOpenAICompatibleAPI(payload);
    if (remoteReply) {
      return remoteReply;
    }
  } catch (error) {
    console.warn("LLM proxy failed, falling back to local reply.", error);
  }

  return localReply;
}

async function handleTutorSearch(payload) {
  const question = payload.question || "";
  const knowledgeBase = payload.knowledgeBase || {};
  const mode = payload.mode || { label: "对话", title: "对话", preferredSources: [] };
  const topSources = payload.topSources?.length ? payload.topSources : getTopSources(question, knowledgeBase, mode);
  return {
    question,
    sources: topSources,
  };
}

async function handlePronunciationToken() {
  const key = process.env.AZURE_SPEECH_KEY || process.env.SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || process.env.SPEECH_REGION;
  const language = process.env.AZURE_SPEECH_LANGUAGE || "en-US";

  if (!key || !region) {
    return {
      enabled: false,
      message: "Azure Speech is not configured.",
      region: region || "",
      language,
    };
  }

  const endpoint = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
    },
  });

  if (!response.ok) {
    throw new Error(`Azure token request failed with ${response.status}`);
  }

  const token = await response.text();
  return {
    enabled: true,
    token,
    region,
    language,
    expiresIn: 9 * 60,
  };
}

async function handlePronunciationAssess(payload) {
  const referenceText = payload.referenceText || "Can you say that again?";
  const transcriptText = payload.transcriptText || "";
  return buildPronunciationFallback(referenceText, transcriptText || referenceText);
}

async function readJson(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function safeJoin(requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const normalized = path.posix.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  const withoutLeadingSlash = normalized.replace(/^\/+/, "");
  return path.join(rootDir, withoutLeadingSlash || "index.html");
}

async function serveStatic(req, res, pathname) {
  let filePath = safeJoin(pathname);

  try {
    const stat = await fs.stat(filePath).catch(() => null);
    if (stat?.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(content);
  } catch {
    sendText(res, 404, "Not Found");
  }
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      res.end();
      return;
    }

    if (pathname === "/api/health") {
      sendJson(res, 200, { ok: true, service: "ivy-tutor-engine" });
      return;
    }

    if (pathname === "/api/tutor/ask" && req.method === "POST") {
      try {
        const payload = await readJson(req);
        const reply = await handleTutorAsk(payload);
        sendJson(res, 200, { reply });
      } catch (error) {
        sendJson(res, 400, { error: error.message || "Bad Request" });
      }
      return;
    }

    if (pathname === "/api/tutor/chat" && req.method === "POST") {
      try {
        const payload = await readJson(req);
        const reply = await handleTutorAsk(payload);
        sendJson(res, 200, { reply });
      } catch (error) {
        sendJson(res, 400, { error: error.message || "Bad Request" });
      }
      return;
    }

    if (pathname === "/api/tutor/search" && req.method === "POST") {
      try {
        const payload = await readJson(req);
        const result = await handleTutorSearch(payload);
        sendJson(res, 200, result);
      } catch (error) {
        sendJson(res, 400, { error: error.message || "Bad Request" });
      }
      return;
    }

  if (pathname === "/api/tutor/feedback" && req.method === "POST") {
      try {
        const payload = await readJson(req);
        sendJson(res, 200, {
          ok: true,
          received: {
            modeId: payload.modeId || null,
            rating: payload.rating || null,
            note: payload.note || "",
          },
        });
      } catch (error) {
        sendJson(res, 400, { error: error.message || "Bad Request" });
      }
    return;
  }

  if (pathname === "/api/speech/token" && req.method === "POST") {
    try {
      const result = await handlePronunciationToken();
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 400, { enabled: false, error: error.message || "Bad Request" });
    }
    return;
  }

  if (pathname === "/api/pronunciation/assess" && req.method === "POST") {
    try {
      const payload = await readJson(req);
      const result = await handlePronunciationAssess(payload);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 400, { error: error.message || "Bad Request" });
    }
    return;
  }

  if (pathname === "/") {
      await serveStatic(req, res, "/index.html");
      return;
    }

    await serveStatic(req, res, pathname);
  });
}

function startServer(port) {
  const instance = createServer();

  instance.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy, retrying on ${nextPort}...`);
      instance.close(() => startServer(nextPort));
      return;
    }

    throw error;
  });

  instance.listen(port, () => {
    console.log(`IvyEuro static server running at http://127.0.0.1:${port}`);
  });

  return instance;
}

startServer(initialPort);
