const fallbackKnowledgeBase = {
  tutor: {
    name: "IvyEuro AI English Tutor",
    role: "先检索知识库，再组织成课堂示范、跟读纠错和追问练习的答案。",
    principles: [
      "先找来源，再生成回答",
      "优先使用可教学、可复练的短句",
      "根据年龄和水平调整语气和复杂度",
      "回答后给出下一步练习",
    ],
  },
  sources: [
    {
      id: "plain-text",
      name: "Plain text",
      summary: "可直接导入自定义课程内容、讲义、练习文本和课堂纠错记录。",
      focus: "自定义内容、课堂文本、练习材料",
      keywords: ["自定义", "讲义", "练习", "文本", "纠错", "课堂", "worksheet", "lesson"],
    },
    {
      id: "oxford",
      name: "Oxford",
      summary: "适合英语阅读、词汇与表达的权威参考，便于构建稳定的词汇和阅读训练。",
      focus: "词汇、阅读、表达",
      keywords: ["oxford", "阅读", "词汇", "表达", "reading", "vocabulary", "词组"],
    },
    {
      id: "cambridge",
      name: "Cambridge",
      summary: "适合分级练习、题型训练和标准化输出，尤其适合测评和阶段提升。",
      focus: "分级、题型、标准化练习",
      keywords: ["cambridge", "分级", "题型", "测评", "考试", "标准化", "level", "exam"],
    },
    {
      id: "reach-higher",
      name: "Reach Higher",
      summary: "适合课堂体系、阅读写作与综合提升，能把知识点串成完整训练路径。",
      focus: "阅读、写作、综合提升",
      keywords: ["reach higher", "写作", "阅读", "综合", "提升", "课堂", "writing"],
    },
    {
      id: "us-textbook",
      name: "美国学校教材",
      summary: "适合本地化英语学习、学校同步与日常表达，便于贴近课堂场景。",
      focus: "学校同步、日常表达、课堂场景",
      keywords: ["美国", "学校", "教材", "同步", "课堂", "口语", "日常", "school", "textbook"],
    },
  ],
  demoQuestions: [
    "怎么帮小学三年级学生练英语阅读和口语？",
    "学生总是发音拖尾，应该怎么纠正？",
    "怎样把学校里的英语课本和课后练习串起来？",
  ],
};

const questionField = document.querySelector("#english-ai-question");
const answerBox = document.querySelector("#english-ai-answer");
const sourceRow = document.querySelector("#english-ai-sources");
const kbList = document.querySelector("#english-kb-list");
const askButton = document.querySelector("[data-english-ai-ask]");
const resetButton = document.querySelector("[data-english-ai-reset]");

const state = {
  knowledgeBase: fallbackKnowledgeBase,
};

function normalizeText(value) {
  return (value || "").toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, " ");
}

function scoreSource(question, source) {
  const normalized = normalizeText(question);
  let score = 0;

  source.keywords.forEach((keyword) => {
    if (normalized.includes(normalizeText(keyword).trim())) {
      score += 2;
    }
  });

  if (/阅读|read|reading/.test(normalized) && source.id === "oxford") score += 2;
  if (/口语|说|speak|speaking/.test(normalized) && source.id === "us-textbook") score += 1;
  if (/发音|pronunciation|跟读|repeat/.test(normalized) && source.id === "cambridge") score += 2;
  if (/写作|writing/.test(normalized) && source.id === "reach-higher") score += 2;
  if (/课堂|讲义|练习|自定义|worksheet|lesson/.test(normalized) && source.id === "plain-text") score += 2;

  return score;
}

function getTopSources(question) {
  const scored = state.knowledgeBase.sources
    .map((source) => ({ source, score: scoreSource(question, source) }))
    .sort((a, b) => b.score - a.score);

  const top = scored.filter(({ score }) => score > 0).slice(0, 3).map(({ source }) => source);

  if (top.length) {
    return top;
  }

  return state.knowledgeBase.sources.slice(0, 3);
}

function buildTutorReply(question, sources) {
  const normalized = normalizeText(question);
  const sourceNames = sources.map((source) => source.name).join("、");

  let focus = "先用知识库中的标准文本示范，再让学生跟读和复练。";
  let nextStep = "建议先从一句短句开始，确认发音后再进入问答。";
  let example = "Can you say that again?";

  if (/阅读|read|reading/.test(normalized)) {
    focus = "先从短文和词汇理解入手，再做段落复述与问题回答。";
    nextStep = "先让学生读出关键词，再用完整句子回答一个阅读题。";
    example = "I think the main idea is about daily routines.";
  } else if (/发音|pronunciation|跟读|repeat/.test(normalized)) {
    focus = "先看标准示范，再做音节、重音和语调纠正。";
    nextStep = "先跟读标准句，再把重音和尾音再练一遍。";
    example = "Could you repeat that more slowly?";
  } else if (/口语|说|speak|speaking|问答/.test(normalized)) {
    focus = "先给学生一个完整回答框架，再让他用自己的话说出来。";
    nextStep = "把问题拆成开头句、核心句和结尾句来练。";
    example = "My favorite subject is English because I can talk with people.";
  } else if (/写作|writing|作文/.test(normalized)) {
    focus = "先给写作结构，再补词汇和连接词，最后检查完整性。";
    nextStep = "先写三句，再扩成一段，最后润色表达。";
    example = "First, I describe the topic. Then, I add examples. Finally, I conclude.";
  } else if (/教材|school|学校|同步/.test(normalized)) {
    focus = "先和学校教材对齐，再把课内词汇和课后练习串起来。";
    nextStep = "先确认课本单元，再给学生一个同步练习。";
    example = "This unit focuses on classroom language and daily interaction.";
  }

  return {
    title: `IvyEuro AI 英语老师已调用：${sourceNames}`,
    body: [
      "我先从知识库里检索到了相关条目，然后按课堂逻辑组织回答。",
      `当前问题更适合的处理方式是：${focus}`,
      `示范句可以先用：${example}`,
      `下一步：${nextStep}`,
    ],
    sources,
  };
}

function renderAnswer(question) {
  const sources = getTopSources(question);
  const reply = buildTutorReply(question, sources);

  if (answerBox) {
    answerBox.innerHTML = `
      <strong>${reply.title}</strong>
      <p>${reply.body[0]}</p>
      <p>${reply.body[1]}</p>
      <p>${reply.body[2]}</p>
      <p>${reply.body[3]}</p>
    `;
  }

  if (sourceRow) {
    sourceRow.innerHTML = sources
      .map((source) => `<span class="tutor-source-chip">${source.name}</span>`)
      .join("");
  }
}

function renderKnowledgeBase() {
  if (!kbList) {
    return;
  }

  kbList.innerHTML = state.knowledgeBase.sources
    .map((source) => {
      const keywordList = source.keywords
        .slice(0, 4)
        .map((keyword) => `<span class="knowledge-tag">${keyword}</span>`)
        .join("");

      return `
        <article class="knowledge-item">
          <strong>${source.name}</strong>
          <p>${source.summary}</p>
          <div class="knowledge-tags">${keywordList}</div>
          <div class="knowledge-focus">检索用途：${source.focus}</div>
        </article>
      `;
    })
    .join("");
}

function wireDemoQuestions() {
  document.querySelectorAll("[data-sample-query]").forEach((button) => {
    button.addEventListener("click", () => {
      const query = button.getAttribute("data-sample-query") || "";
      if (questionField) {
        questionField.value = query;
      }
      renderAnswer(query);
    });
  });
}

async function loadKnowledgeBase() {
  try {
    const response = await fetch("data/english-knowledge-base.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load knowledge base: ${response.status}`);
    }

    const data = await response.json();
    if (data?.sources?.length) {
      state.knowledgeBase = data;
    }
  } catch (error) {
    console.warn("Using fallback English knowledge base.", error);
  }

  renderKnowledgeBase();
  wireDemoQuestions();

  const initialQuestion =
    questionField?.value?.trim() ||
    state.knowledgeBase.demoQuestions?.[0] ||
    "怎么帮学生练英语阅读和口语？";

  if (questionField && !questionField.value.trim()) {
    questionField.value = initialQuestion;
  }

  renderAnswer(initialQuestion);
}

askButton?.addEventListener("click", () => {
  const question = questionField?.value.trim() || state.knowledgeBase.demoQuestions[0];
  renderAnswer(question);
});

resetButton?.addEventListener("click", () => {
  const question =
    state.knowledgeBase.demoQuestions[Math.floor(Math.random() * state.knowledgeBase.demoQuestions.length)];

  if (questionField) {
    questionField.value = question;
  }

  renderAnswer(question);
});

loadKnowledgeBase();
