const fallbackKnowledgeBase = {
  tutor: {
    name: "IvyEuro AI Chinese Tutor",
    role: "先检索知识库，再组织成识字、朗读、纠错和表达练习的答案。",
    principles: [
      "先找来源，再生成回答",
      "优先使用可朗读、可练习的短句",
      "根据年级和水平调整语气和复杂度",
      "回答后给出下一步练习",
    ],
  },
  sources: [
    { id: "plain-text", name: "Plain text", summary: "可直接导入讲义、课文、练习文本和课堂纠错记录。", focus: "自定义内容、课堂文本、练习材料", keywords: ["自定义", "讲义", "练习", "文本", "纠错", "课堂", "课文", "读写"] },
    { id: "textbook", name: "部编版语文教材", summary: "适合学校同步、基础积累和分阶段训练。", focus: "课内同步、基础积累、阶段训练", keywords: ["教材", "课文", "同步", "语文", "拼音", "识字", "朗读", "字词"] },
    { id: "reading", name: "课外阅读", summary: "适合阅读理解、段落分析和词句拓展。", focus: "阅读理解、段落分析、词句拓展", keywords: ["阅读", "理解", "段落", "词句", "拓展", "故事", "文章"] },
    { id: "pinyin", name: "拼音朗读材料", summary: "适合读音、停顿和语感训练。", focus: "拼音、朗读、节奏", keywords: ["拼音", "朗读", "读音", "停顿", "语感", "发音"] },
    { id: "writing", name: "作文范文", summary: "适合结构、表达和润色示范。", focus: "结构、表达、润色", keywords: ["作文", "范文", "表达", "结构", "润色", "写作"] },
  ],
  modes: [
    { id: "plain-text", label: "Plain text", title: "导入文本", summary: "把课文、讲义和练习变成可直接讲解的内容。", promptHint: "适合上传讲义、课文、练习或自定义文本。", preferredSources: ["plain-text"], sampleQuestions: ["把这段课文整理成课堂要点", "把这份练习变成三步练习", "把这篇文章总结成 5 个重点"], outputStyle: "摘要 + 可讲解要点 + 下一步" },
    { id: "dialogue", label: "对话", title: "情景对话", summary: "围绕校园、生活和日常场景进行问答与追问。", promptHint: "适合练习口头表达和完整句输出。", preferredSources: ["textbook", "plain-text"], sampleQuestions: ["请和学生做一个校园问答", "请模拟老师和学生的自我介绍", "请练习一个去图书馆的对话"], outputStyle: "对白 + 追问 + 复述" },
    { id: "correction", label: "纠错", title: "病句纠错", summary: "把学生输入修正成更自然、更准确的中文。", promptHint: "适合批改病句、语序和用词问题。", preferredSources: ["textbook", "plain-text"], sampleQuestions: ["这句话有病句，帮我纠正", "我昨天去公园玩和朋友，帮我改", "这句表达不顺，帮我润色"], outputStyle: "原句 + 修改句 + 错误说明" },
    { id: "pronunciation", label: "发音", title: "拼音与朗读", summary: "聚焦拼音、声调、停顿和语感。", promptHint: "适合练拼音、朗读和句子节奏。", preferredSources: ["pinyin", "textbook"], sampleQuestions: ["请示范这句话的拼音和停顿", "我想练‘我们一起去公园’的朗读", "请帮我纠正这句的声调"], outputStyle: "拼音提示 + 停顿建议 + 跟读句" },
    { id: "essay", label: "作文", title: "写作批改", summary: "从立意、结构、连接到完整段落输出。", promptHint: "适合写段落、写短文、做作文提纲和润色。", preferredSources: ["writing", "plain-text"], sampleQuestions: ["写一段关于学校生活的作文", "帮我把这篇作文改得更有逻辑", "给我一个关于旅行的段落提纲"], outputStyle: "提纲 + 示例段落 + 连接词" },
    { id: "reading", label: "阅读", title: "阅读理解", summary: "帮助学生抓主旨、找细节、理解词句关系。", promptHint: "适合阅读理解、词句拓展和短文分析。", preferredSources: ["reading", "textbook"], sampleQuestions: ["帮我分析这篇阅读的主旨", "这篇文章里有哪些关键词", "给我一个阅读理解训练"], outputStyle: "主旨 + 关键词 + 题目" },
  ],
  demoQuestions: ["怎么帮小学二年级学生练识字和朗读？", "这句话有病句，帮我纠正", "怎样把学校里的语文课文和课后练习串起来？"],
};

const questionField = document.querySelector("#chinese-ai-question");
const answerBox = document.querySelector("#chinese-ai-answer");
const sourceRow = document.querySelector("#chinese-ai-sources");
const kbList = document.querySelector("#chinese-kb-list");
const askButton = document.querySelector("[data-chinese-ask]");
const resetButton = document.querySelector("[data-chinese-reset]");
const activeModeName = document.querySelector("#chinese-active-mode-title");
const activeModeHint = document.querySelector("#chinese-active-mode-hint");
const tutorModeButtons = document.querySelectorAll("[data-chinese-mode]");
const functionCards = document.querySelectorAll("[data-tutor-card]");

const state = { knowledgeBase: fallbackKnowledgeBase, activeModeId: "dialogue" };

function normalizeText(value) {
  return (value || "").toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, " ");
}
function getMode(modeId) {
  return state.knowledgeBase.modes?.find((mode) => mode.id === modeId) || fallbackKnowledgeBase.modes.find((mode) => mode.id === modeId) || fallbackKnowledgeBase.modes[1];
}
function scoreSource(question, source, mode) {
  const normalized = normalizeText(question);
  let score = 0;
  if (mode?.preferredSources?.includes(source.id)) score += 3;
  source.keywords.forEach((keyword) => { if (normalized.includes(normalizeText(keyword).trim())) score += 2; });
  if (/阅读|读|文章/.test(normalized) && source.id === "reading") score += 2;
  if (/拼音|朗读|声调|读音/.test(normalized) && source.id === "pinyin") score += 2;
  if (/作文|写作|段落/.test(normalized) && source.id === "writing") score += 2;
  if (/病句|纠错|修改|语序/.test(normalized) && source.id === "textbook") score += 2;
  return score;
}
function getTopSources(question, mode) {
  const scored = state.knowledgeBase.sources.map((source) => ({ source, score: scoreSource(question, source, mode) })).sort((a, b) => b.score - a.score);
  const top = scored.filter(({ score }) => score > 0).slice(0, 3).map(({ source }) => source);
  return top.length ? top : state.knowledgeBase.sources.slice(0, 3);
}
function buildTutorReply(question, sources, mode) {
  const normalized = normalizeText(question);
  const sourceNames = sources.map((source) => source.name).join("、");
  const modeLabel = mode?.label || "对话";
  const modeTitle = mode?.title || "情景对话";
  let focus = "先用知识库中的标准文本示范，再让学生跟读和复练。";
  let nextStep = "建议先从一句短句开始，确认发音后再进入问答。";
  let example = "我们一起去公园。";
  let extra = "你可以继续追问：请给我一个更简单的版本。";
  let modeLabelLine = `当前功能：${modeLabel}`;
  if (mode?.id === "plain-text") { focus = "先把输入文本拆成主题、关键词、示范句和复练任务。"; nextStep = "先整理成三段：讲解、练习、复习。"; example = "主题：校园生活；关键词：认真、练习、朗读。"; extra = "你可以继续追问：把这段讲义变成 3 个课堂任务。"; }
  else if (mode?.id === "dialogue") { focus = "先给学生完整对话框架，再让他按角色接话和追问。"; nextStep = "先练两轮问答，再切换场景继续。"; example = "A: 你今天学了什么？ B: 我学了识字和朗读。"; extra = "你可以继续追问：再给我一个更适合小学生的对话。"; }
  else if (mode?.id === "correction") { focus = "先展示修改后的正确句，再解释错误点。"; nextStep = "让学生把改正句重复说一遍，确认掌握。"; example = "我昨天去公园和朋友玩。"; extra = "建议一次只改 1 句，方便学生看到前后差异。"; modeLabelLine = `当前功能：${modeLabel} · 已识别到一句需要纠正的句子`; }
  else if (mode?.id === "pronunciation") { focus = "先拆分拼音、声调和停顿，再提供朗读提示。"; nextStep = "先跟读标准句，再把句子放进短文里练。"; example = "我们 / 一起 / 去 / 公园。"; extra = "如果你读得慢一点，系统会先示范，再让你跟读。"; modeLabelLine = `当前功能：${modeLabel} · 优先做拼音与朗读`; }
  else if (mode?.id === "essay") { focus = "先给写作提纲，再补连接词和示范段落。"; nextStep = "先写三句，再扩成一段，再做润色。"; example = "开头：介绍校园；中间：描述活动；结尾：表达感受。"; extra = "你可以继续追问：帮我把这一段写得更像作文。"; }
  else if (mode?.id === "reading") { focus = "先抓主旨和关键词，再做细节理解与题目训练。"; nextStep = "先读标题和首尾句，再回答 3 个理解题。"; example = "主旨：这篇文章讲的是校园里的阅读习惯。"; extra = "阅读模式会优先给主旨、词句和题目框架。"; modeLabelLine = `当前功能：${modeLabel} · 优先做主旨和细节理解`; }
  else if (/阅读|读|文章/.test(normalized)) { focus = "先从短文和词句理解入手，再做段落复述与问题回答。"; nextStep = "先让学生找关键词，再用完整句子回答问题。"; example = "这篇文章讲的是校园生活。"; }
  return { title: `IvyEuro AI 中文老师已调用：${sourceNames}`, body: [`${modeTitle}：我先从知识库里检索到了相关条目，然后按课堂逻辑组织回答。`, modeLabelLine, `当前问题更适合的处理方式是：${focus}`, `示范句可以先用：${example}`, `下一步：${nextStep}`, extra], sources };
}
function renderAnswer(question) {
  const mode = getMode(state.activeModeId);
  const sources = getTopSources(question, mode);
  const reply = buildTutorReply(question, sources, mode);
  if (answerBox) answerBox.innerHTML = `<strong>${reply.title}</strong><p>${reply.body[0]}</p><p>${reply.body[1]}</p><p>${reply.body[2]}</p><p>${reply.body[3]}</p><p>${reply.body[4]}</p><p>${reply.body[5]}</p>`;
  if (sourceRow) sourceRow.innerHTML = sources.map((source) => `<span class="tutor-source-chip">${source.name}</span>`).join("");
  if (activeModeName) activeModeName.textContent = `当前功能：${mode.label}`;
  if (activeModeHint) activeModeHint.textContent = mode.promptHint;
  tutorModeButtons.forEach((button) => button.classList.toggle("is-active", button.getAttribute("data-chinese-mode") === mode.id));
  functionCards.forEach((card) => card.classList.toggle("is-active", card.getAttribute("data-tutor-card") === mode.id));
}
function renderKnowledgeBase() {
  if (!kbList) return;
  kbList.innerHTML = state.knowledgeBase.sources.map((source) => {
    const keywordList = source.keywords.slice(0, 4).map((keyword) => `<span class="knowledge-tag">${keyword}</span>`).join("");
    return `<article class="knowledge-item"><strong>${source.name}</strong><p>${source.summary}</p><div class="knowledge-tags">${keywordList}</div><div class="knowledge-focus">检索用途：${source.focus}</div></article>`;
  }).join("");
}
function wireDemoQuestions() {
  document.querySelectorAll("[data-chinese-sample]").forEach((button) => button.addEventListener("click", () => {
    const query = button.getAttribute("data-chinese-sample") || "";
    if (questionField) questionField.value = query;
    renderAnswer(query);
  }));
}
function wireModeButtons() {
  document.querySelectorAll("[data-chinese-mode]").forEach((button) => button.addEventListener("click", () => {
    const modeId = button.getAttribute("data-chinese-mode");
    if (!modeId) return;
    state.activeModeId = modeId;
    const mode = getMode(modeId);
    if (questionField && !questionField.value.trim()) questionField.value = mode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions[0];
    renderAnswer(questionField?.value.trim() || mode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions[0]);
  }));
}
async function loadKnowledgeBase() {
  try {
    const response = await fetch("data/chinese-knowledge-base.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load knowledge base: ${response.status}`);
    const data = await response.json();
    if (data?.sources?.length) state.knowledgeBase = data;
  } catch (error) {
    console.warn("Using fallback Chinese knowledge base.", error);
  }
  renderKnowledgeBase();
  wireDemoQuestions();
  wireModeButtons();
  const defaultMode = getMode(state.activeModeId);
  const initialQuestion = questionField?.value?.trim() || defaultMode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions?.[0] || "怎么帮学生练中文？";
  if (questionField && !questionField.value.trim()) questionField.value = initialQuestion;
  if (activeModeName) activeModeName.textContent = `当前功能：${defaultMode.label}`;
  if (activeModeHint) activeModeHint.textContent = defaultMode.promptHint;
  renderAnswer(initialQuestion);
}
askButton?.addEventListener("click", () => {
  const mode = getMode(state.activeModeId);
  const question = questionField?.value.trim() || mode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions[0];
  renderAnswer(question);
});
resetButton?.addEventListener("click", () => {
  const mode = getMode(state.activeModeId);
  const pool = mode.sampleQuestions?.length ? mode.sampleQuestions : state.knowledgeBase.demoQuestions;
  const question = pool[Math.floor(Math.random() * pool.length)];
  if (questionField) questionField.value = question;
  renderAnswer(question);
});
loadKnowledgeBase();
