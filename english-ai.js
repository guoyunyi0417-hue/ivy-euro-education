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
  modes: [
    {
      id: "plain-text",
      label: "Plain text",
      title: "导入文本",
      summary: "把教材、讲义、练习变成可直接讲解和复练的内容。",
      promptHint: "适合上传讲义、课文、练习或自定义文本，让 AI 先整理再讲解。",
      preferredSources: ["plain-text"],
      sampleQuestions: [
        "把这段讲义整理成课堂要点",
        "把这份练习变成三步练习",
        "把这段教材总结成 5 个词汇",
      ],
      outputStyle: "摘要 + 可讲解要点 + 下一步",
    },
    {
      id: "dialogue",
      label: "对话",
      title: "情景对话",
      summary: "围绕课堂、生活和学校场景进行问答与追问。",
      promptHint: "适合练习问答、角色扮演和完整句输出。",
      preferredSources: ["us-textbook", "plain-text"],
      sampleQuestions: [
        "请和学生做一个校园点餐对话",
        "请模拟老师和学生的自我介绍",
        "请练习一个去图书馆的对话",
      ],
      outputStyle: "角色对白 + 追问 + 复述",
    },
    {
      id: "correction",
      label: "纠错",
      title: "语法纠错",
      summary: "把学生输入修正成更自然、更准确的英语。",
      promptHint: "适合批改句子、找语法问题、改表达。",
      preferredSources: ["cambridge", "plain-text"],
      sampleQuestions: [
        "I go school yesterday. 帮我纠错",
        "He don't like apples. 帮我改正",
        "This sentence has grammar mistakes, please fix it",
      ],
      outputStyle: "原句 + 修改句 + 错误说明",
    },
    {
      id: "pronunciation",
      label: "发音",
      title: "发音示范",
      summary: "聚焦音节、重音、连读和语调，让学生听完就能跟。",
      promptHint: "适合练发音、口型、重音和句子节奏。",
      preferredSources: ["cambridge", "us-textbook"],
      sampleQuestions: [
        "how do you pronounce 'th'?",
        "请示范 better 和 butter 的区别",
        "我想练 this, think, these 的发音",
      ],
      outputStyle: "发音提示 + 口型建议 + 跟读句",
    },
    {
      id: "essay",
      label: "作文",
      title: "作文批改",
      summary: "从立意、结构、连接词到完整段落输出。",
      promptHint: "适合写段落、写短文、做作文提纲和润色。",
      preferredSources: ["reach-higher", "plain-text"],
      sampleQuestions: [
        "写一段关于我学校的英语作文",
        "帮我把这篇作文改得更有逻辑",
        "给我一个关于旅行的段落提纲",
      ],
      outputStyle: "提纲 + 示例段落 + 连接词",
    },
    {
      id: "reading",
      label: "阅读",
      title: "阅读理解",
      summary: "帮助学生抓主旨、找细节、理解词汇和句子关系。",
      promptHint: "适合阅读理解、词汇拓展和短文分析。",
      preferredSources: ["oxford", "cambridge", "reach-higher"],
      sampleQuestions: [
        "帮我分析这篇阅读的主旨",
        "这篇文章里有哪些关键词",
        "给我一个阅读理解训练",
      ],
      outputStyle: "主旨 + 关键词 + 题目",
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
const activeModeName = document.querySelector("#english-active-mode strong");
const activeModeHint = document.querySelector("#english-active-mode span");
const tutorModeButtons = document.querySelectorAll("[data-tutor-mode]");
const functionCards = document.querySelectorAll("[data-tutor-card]");

const state = {
  knowledgeBase: fallbackKnowledgeBase,
  activeModeId: "dialogue",
};

function normalizeText(value) {
  return (value || "").toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, " ");
}

function getMode(modeId) {
  return (
    state.knowledgeBase.modes?.find((mode) => mode.id === modeId) ||
    fallbackKnowledgeBase.modes.find((mode) => mode.id === modeId) ||
    fallbackKnowledgeBase.modes[1]
  );
}

function scoreSource(question, source, mode) {
  const normalized = normalizeText(question);
  let score = 0;

  if (mode?.preferredSources?.includes(source.id)) {
    score += 3;
  }

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

function getTopSources(question, mode) {
  const scored = state.knowledgeBase.sources
    .map((source) => ({ source, score: scoreSource(question, source, mode) }))
    .sort((a, b) => b.score - a.score);

  const top = scored.filter(({ score }) => score > 0).slice(0, 3).map(({ source }) => source);

  if (top.length) {
    return top;
  }

  return state.knowledgeBase.sources.slice(0, 3);
}

function parseSimpleCorrections(text) {
  const candidates = [
    {
      pattern: /\bI go school yesterday\b/i,
      corrected: "I went to school yesterday.",
      note: "过去时应该用 went，并加上 to。",
    },
    {
      pattern: /\bHe don't like apples\b/i,
      corrected: "He doesn't like apples.",
      note: "第三人称单数要用 doesn't。",
    },
    {
      pattern: /\bI am agree\b/i,
      corrected: "I agree.",
      note: "agree 是动词，不需要 am。",
    },
  ];

  const matched = candidates.find((item) => item.pattern.test(text));
  return matched || null;
}

function buildTutorReply(question, sources, mode) {
  const normalized = normalizeText(question);
  const sourceNames = sources.map((source) => source.name).join("、");
  const modeLabel = mode?.label || "对话";
  const modeTitle = mode?.title || "情景对话";

  let focus = "先用知识库中的标准文本示范，再让学生跟读和复练。";
  let nextStep = "建议先从一句短句开始，确认发音后再进入问答。";
  let example = "Can you say that again?";
  let extra = "你可以继续追问：请给我一个更简单的版本。";
  let modeLabelLine = `当前模式：${modeLabel}`;

  if (mode?.id === "plain-text") {
    focus = "先把输入文本拆成主题、关键词、示范句和复练任务。";
    nextStep = "先整理成三段：讲解、练习、复习。";
    example = "Main idea: classroom communication. Keywords: ask, repeat, slow.";
    extra = "你可以继续追问：把这份讲义变成 3 个课堂任务。";
  } else if (mode?.id === "dialogue") {
    focus = "先给学生完整对话框架，再让他按角色接话和追问。";
    nextStep = "先练两轮问答，再切换场景继续。";
    example = "A: Could I have a glass of water? B: Sure. Here you are.";
    extra = "你可以继续追问：再给我一个更适合小学生的对话。";
  } else if (mode?.id === "correction") {
    const correction = parseSimpleCorrections(question);
    if (correction) {
      focus = "先展示修改后的正确句，再解释错误点。";
      nextStep = "让学生把改正句重复说一遍，确认掌握。";
      example = correction.corrected;
      extra = correction.note;
      modeLabelLine = `当前模式：${modeLabel} · 已识别到一句需要纠正的句子`;
    } else {
      focus = "先找出语法、时态、单复数或搭配问题，再给出修改版本。";
      nextStep = "把原句发给老师，逐句纠正后再复述。";
      example = "Please write the sentence you want to fix.";
      extra = "建议一次只改 1 句，方便学生看到前后差异。";
    }
  } else if (mode?.id === "pronunciation") {
    const focusWord = question.match(/[A-Za-z']+/)?.[0] || "this";
    focus = "先拆分音节、重音和连读，再提供口型提示。";
    nextStep = "先跟读单词，再把单词放进句子里练。";
    example = `${focusWord} /ðɪs/ → 注意舌尖轻触牙齿，声音不要太重。`;
    extra = "如果你读得慢一点，系统会先示范，再让你跟读。";
    modeLabelLine = `当前模式：${modeLabel} · 优先做单词与短句发音`;
  } else if (mode?.id === "essay") {
    focus = "先给写作提纲，再补连接词和示范段落。";
    nextStep = "先写三句，再扩成一段，再做润色。";
    example = "Outline: topic sentence / two supporting ideas / conclusion.";
    extra = "你可以继续追问：帮我把这一段写得更像考试作文。";
  } else if (mode?.id === "reading") {
    focus = "先抓主旨和关键词，再做细节理解与题目训练。";
    nextStep = "先读标题和首尾句，再回答 3 个理解题。";
    example = "Main idea: the passage is about daily habits and routines.";
    extra = "阅读模式会优先给主旨、词汇和题目框架。";
    modeLabelLine = `当前模式：${modeLabel} · 优先做主旨和细节理解`;
  } else if (/阅读|read|reading/.test(normalized)) {
    focus = "先从短文和词汇理解入手，再做段落复述与问题回答。";
    nextStep = "先让学生读出关键词，再用完整句子回答一个阅读题。";
    example = "I think the main idea is about daily routines.";
    modeLabelLine = `当前模式：${modeLabel}`;
  } else if (/发音|pronunciation|跟读|repeat/.test(normalized)) {
    focus = "先看标准示范，再做音节、重音和语调纠正。";
    nextStep = "先跟读标准句，再把重音和尾音再练一遍。";
    example = "Could you repeat that more slowly?";
    modeLabelLine = `当前模式：${modeLabel}`;
  } else if (/口语|说|speak|speaking|问答/.test(normalized)) {
    focus = "先给学生一个完整回答框架，再让他用自己的话说出来。";
    nextStep = "把问题拆成开头句、核心句和结尾句来练。";
    example = "My favorite subject is English because I can talk with people.";
    modeLabelLine = `当前模式：${modeLabel}`;
  } else if (/写作|writing|作文/.test(normalized)) {
    focus = "先给写作结构，再补词汇和连接词，最后检查完整性。";
    nextStep = "先写三句，再扩成一段，最后润色表达。";
    example = "First, I describe the topic. Then, I add examples. Finally, I conclude.";
    modeLabelLine = `当前模式：${modeLabel}`;
  } else if (/教材|school|学校|同步/.test(normalized)) {
    focus = "先和学校教材对齐，再把课内词汇和课后练习串起来。";
    nextStep = "先确认课本单元，再给学生一个同步练习。";
    example = "This unit focuses on classroom language and daily interaction.";
    modeLabelLine = `当前模式：${modeLabel}`;
  }

  return {
    title: `IvyEuro AI 英语老师已调用：${sourceNames}`,
    body: [
      `${modeTitle}：我先从知识库里检索到了相关条目，然后按课堂逻辑组织回答。`,
      modeLabelLine,
      `当前问题更适合的处理方式是：${focus}`,
      `示范句可以先用：${example}`,
      `下一步：${nextStep}`,
      extra,
    ],
    sources,
  };
}

function renderAnswer(question) {
  const mode = getMode(state.activeModeId);
  const sources = getTopSources(question, mode);
  const reply = buildTutorReply(question, sources, mode);

  if (answerBox) {
    answerBox.innerHTML = `
      <strong>${reply.title}</strong>
      <p>${reply.body[0]}</p>
      <p>${reply.body[1]}</p>
      <p>${reply.body[2]}</p>
      <p>${reply.body[3]}</p>
      <p>${reply.body[4]}</p>
      <p>${reply.body[5]}</p>
    `;
  }

  if (sourceRow) {
    sourceRow.innerHTML = sources
      .map((source) => `<span class="tutor-source-chip">${source.name}</span>`)
      .join("");
  }

  if (activeModeName) {
    activeModeName.textContent = `当前功能：${mode.label}`;
  }

  if (activeModeHint) {
    activeModeHint.textContent = mode.promptHint;
  }

  tutorModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-tutor-mode") === mode.id);
  });

  functionCards.forEach((card) => {
    card.classList.toggle("is-active", card.getAttribute("data-tutor-card") === mode.id);
  });

  if (questionField && mode.sampleQuestions?.length && !questionField.value.trim()) {
    questionField.placeholder = mode.sampleQuestions[0];
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

function wireModeButtons() {
  document.querySelectorAll("[data-tutor-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const modeId = button.getAttribute("data-tutor-mode");
      if (!modeId) {
        return;
      }

      state.activeModeId = modeId;
      const mode = getMode(modeId);

      if (questionField) {
        questionField.placeholder = mode.sampleQuestions?.[0] || questionField.placeholder;
      }

      if (questionField && !questionField.value.trim()) {
        questionField.value = mode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions[0];
      }

      renderAnswer(questionField?.value.trim() || mode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions[0]);
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
  wireModeButtons();

  const defaultMode = getMode(state.activeModeId);
  const initialQuestion =
    questionField?.value?.trim() ||
    defaultMode.sampleQuestions?.[0] ||
    state.knowledgeBase.demoQuestions?.[0] ||
    "怎么帮学生练英语阅读和口语？";

  if (questionField && !questionField.value.trim()) {
    questionField.value = initialQuestion;
    questionField.placeholder = defaultMode.sampleQuestions?.[0] || questionField.placeholder;
  }

  if (activeModeName) {
    activeModeName.textContent = `当前功能：${defaultMode.label}`;
  }

  if (activeModeHint) {
    activeModeHint.textContent = defaultMode.promptHint;
  }

  renderAnswer(initialQuestion);
}

askButton?.addEventListener("click", () => {
  const mode = getMode(state.activeModeId);
  const question =
    questionField?.value.trim() ||
    mode.sampleQuestions?.[0] ||
    state.knowledgeBase.demoQuestions[0];
  renderAnswer(question);
});

resetButton?.addEventListener("click", () => {
  const mode = getMode(state.activeModeId);
  const pool = mode.sampleQuestions?.length ? mode.sampleQuestions : state.knowledgeBase.demoQuestions;
  const question =
    pool[Math.floor(Math.random() * pool.length)];

  if (questionField) {
    questionField.value = question;
  }

  renderAnswer(question);
});

loadKnowledgeBase();
