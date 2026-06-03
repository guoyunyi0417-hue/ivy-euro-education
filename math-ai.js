const fallbackKnowledgeBase = {
  tutor: {
    name: "IvyEuro AI Math Tutor",
    role: "先检索知识库，再组织成讲题、拆题、纠错和追问练习的答案。",
    principles: [
      "先找来源，再生成回答",
      "优先使用可拆解、可复练的步骤",
      "根据年级和水平调整讲法",
      "回答后给出下一步练习",
    ],
  },
  sources: [
    { id: "plain-text", name: "Plain text", summary: "可直接导入讲义、题目、练习文本和课堂纠错记录。", focus: "自定义内容、课堂文本、练习材料", keywords: ["自定义", "讲义", "练习", "文本", "纠错", "课堂", "题目", "步骤"] },
    { id: "textbook", name: "数学教材", summary: "适合学校同步、基础巩固和分阶段训练。", focus: "课内同步、基础巩固、阶段训练", keywords: ["教材", "同步", "数学", "计算", "方程", "几何", "应用题"] },
    { id: "problem-bank", name: "题库", summary: "适合应用题、分层题和能力题训练。", focus: "应用题、分层题、能力题", keywords: ["题库", "应用题", "分层", "能力题", "练习", "题目"] },
    { id: "error-book", name: "错题本", summary: "适合错因分析、步骤修复和回练素材。", focus: "错因分析、步骤修复、回练", keywords: ["错题", "错因", "复练", "回练", "步骤", "错误"] },
    { id: "explanations", name: "讲题范例", summary: "适合解题步骤、表达方式和示范过程。", focus: "解题步骤、表达方式、示范过程", keywords: ["讲题", "示范", "步骤", "解法", "过程", "讲解"] },
  ],
  modes: [
    { id: "plain-text", label: "Plain text", title: "导入文本", summary: "把讲义、题目和练习变成可直接讲解的内容。", promptHint: "适合上传讲义、题目、练习或自定义文本。", preferredSources: ["plain-text"], sampleQuestions: ["把这道题整理成课堂要点", "把这份练习变成三步练习", "把这段讲义总结成 5 个重点"], outputStyle: "摘要 + 可讲解要点 + 下一步" },
    { id: "dialogue", label: "对话", title: "解题问答", summary: "围绕审题、思路和追问进行问答与解释。", promptHint: "适合练习口头讲题和完整思路输出。", preferredSources: ["textbook", "plain-text"], sampleQuestions: ["请和学生做一个解题问答", "请模拟老师和学生讲这道题", "请练习一个方程追问"], outputStyle: "对白 + 追问 + 复述" },
    { id: "correction", label: "纠错", title: "步骤纠错", summary: "把学生输入修正成更完整、更准确的数学步骤。", promptHint: "适合批改步骤、找逻辑问题、改计算错误。", preferredSources: ["error-book", "plain-text"], sampleQuestions: ["这道题步骤有问题，帮我纠正", "我的列式错了，帮我改", "这一步写错了，帮我解释"], outputStyle: "原步骤 + 修改步骤 + 错误说明" },
    { id: "pronunciation", label: "讲解", title: "讲题示范", summary: "聚焦讲题节奏、步骤顺序和表达清晰度。", promptHint: "适合练讲题、口头表达和步骤顺序。", preferredSources: ["explanations", "textbook"], sampleQuestions: ["请示范这道方程的讲题步骤", "我想练这道应用题的表达", "请帮我检查讲题顺序"], outputStyle: "步骤提示 + 讲解建议 + 跟练题" },
    { id: "essay", label: "作文", title: "解题表达", summary: "从思路、结构、符号到完整解答输出。", promptHint: "适合写解题过程、总结方法和润色表达。", preferredSources: ["plain-text", "explanations"], sampleQuestions: ["写一段这道题的解题过程", "帮我把这题讲得更有逻辑", "给我一个数学证明的提纲"], outputStyle: "提纲 + 示例过程 + 连接词" },
    { id: "reading", label: "阅读", title: "应用题阅读", summary: "帮助学生抓条件、找关系、理解题目结构。", promptHint: "适合应用题理解、条件分析和结构拆解。", preferredSources: ["problem-bank", "textbook"], sampleQuestions: ["帮我分析这道应用题的条件", "这道题里有哪些关键数据", "给我一个应用题训练"], outputStyle: "条件 + 关系 + 题目" },
  ],
  demoQuestions: ["怎么帮五年级学生练应用题？", "这道题步骤有问题，帮我纠错", "给我一个方程讲题示范"],
};

const questionField = document.querySelector("#math-ai-question");
const answerBox = document.querySelector("#math-ai-answer");
const sourceRow = document.querySelector("#math-ai-sources");
const kbList = document.querySelector("#math-kb-list");
const askButton = document.querySelector("[data-math-ask]");
const resetButton = document.querySelector("[data-math-reset]");
const activeModeName = document.querySelector("#math-active-mode-title");
const activeModeHint = document.querySelector("#math-active-mode-hint");
const tutorModeButtons = document.querySelectorAll("[data-math-mode]");
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
  if (/应用题|题目|条件/.test(normalized) && source.id === "problem-bank") score += 2;
  if (/错题|步骤|纠错/.test(normalized) && source.id === "error-book") score += 2;
  if (/方程|讲题|示范|解法/.test(normalized) && source.id === "explanations") score += 2;
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
  const modeTitle = mode?.title || "解题问答";
  let focus = "先用知识库中的标准步骤示范，再让学生复练。";
  let nextStep = "建议先从一道简单题开始，确认步骤后再进入追问。";
  let example = "3x + 5 = 20";
  let extra = "你可以继续追问：请给我一个同类题。";
  let modeLabelLine = `当前功能：${modeLabel}`;
  if (mode?.id === "plain-text") { focus = "先把输入文本拆成题型、条件、步骤和练习任务。"; nextStep = "先整理成三段：讲解、练习、复习。"; example = "主题：方程；关键词：等式、变形、验算。"; extra = "你可以继续追问：把这份讲义变成 3 个课堂任务。"; }
  else if (mode?.id === "dialogue") { focus = "先给学生完整解题框架，再让他按步骤接话和追问。"; nextStep = "先练两轮问答，再切换题型继续。"; example = "A: 你先看到了什么条件？ B: 已知 3x + 5 = 20。"; extra = "你可以继续追问：再给我一个更适合小学生的讲题问答。"; }
  else if (mode?.id === "correction") { focus = "先展示修改后的正确步骤，再解释错因。"; nextStep = "让学生把改正后的步骤重复写一遍，确认掌握。"; example = "先减 5，再除以 3。"; extra = "建议一次只改 1 步，方便学生看到前后差异。"; modeLabelLine = `当前功能：${modeLabel} · 已识别到一步需要纠正的内容`; }
  else if (mode?.id === "pronunciation") { focus = "先拆分讲题顺序、关键术语和表达节奏，再提供讲解提示。"; nextStep = "先跟读标准讲解，再把步骤放进完整题目里练。"; example = "先减 5，再除以 3。"; extra = "如果你讲得慢一点，系统会先示范，再让你复讲。"; modeLabelLine = `当前功能：${modeLabel} · 优先做讲题示范`; }
  else if (mode?.id === "essay") { focus = "先给解题提纲，再补关键步骤和示范过程。"; nextStep = "先写三步，再扩成完整过程，再做润色。"; example = "步骤：读题 / 列式 / 计算 / 验算。"; extra = "你可以继续追问：帮我把这一段写得更像标准答案。"; }
  else if (mode?.id === "reading") { focus = "先抓条件和关系，再做应用题结构拆解。"; nextStep = "先读题目和关键数据，再回答 3 个理解问题。"; example = "条件：已知总价和单价；要求：求数量。"; extra = "阅读模式会优先给条件、关系和题目框架。"; modeLabelLine = `当前功能：${modeLabel} · 优先做应用题阅读`; }
  else if (/应用题|题目|条件/.test(normalized)) { focus = "先从条件和关系入手，再做步骤拆解与答案验证。"; nextStep = "先让学生找关键词，再用完整步骤回答。"; example = "已知 3x + 5 = 20，先减 5 再除以 3。"; }
  return { title: `IvyEuro AI 数学老师已调用：${sourceNames}`, body: [`${modeTitle}：我先从知识库里检索到了相关条目，然后按课堂逻辑组织回答。`, modeLabelLine, `当前问题更适合的处理方式是：${focus}`, `示范句可以先用：${example}`, `下一步：${nextStep}`, extra], sources };
}
function renderAnswer(question) {
  const mode = getMode(state.activeModeId);
  const sources = getTopSources(question, mode);
  const reply = buildTutorReply(question, sources, mode);
  if (answerBox) answerBox.innerHTML = `<strong>${reply.title}</strong><p>${reply.body[0]}</p><p>${reply.body[1]}</p><p>${reply.body[2]}</p><p>${reply.body[3]}</p><p>${reply.body[4]}</p><p>${reply.body[5]}</p>`;
  if (sourceRow) sourceRow.innerHTML = sources.map((source) => `<span class="tutor-source-chip">${source.name}</span>`).join("");
  if (activeModeName) activeModeName.textContent = `当前功能：${mode.label}`;
  if (activeModeHint) activeModeHint.textContent = mode.promptHint;
  tutorModeButtons.forEach((button) => button.classList.toggle("is-active", button.getAttribute("data-math-mode") === mode.id));
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
  document.querySelectorAll("[data-math-sample]").forEach((button) => button.addEventListener("click", () => {
    const query = button.getAttribute("data-math-sample") || "";
    if (questionField) questionField.value = query;
    renderAnswer(query);
  }));
}
function wireModeButtons() {
  document.querySelectorAll("[data-math-mode]").forEach((button) => button.addEventListener("click", () => {
    const modeId = button.getAttribute("data-math-mode");
    if (!modeId) return;
    state.activeModeId = modeId;
    const mode = getMode(modeId);
    if (questionField && !questionField.value.trim()) questionField.value = mode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions[0];
    renderAnswer(questionField?.value.trim() || mode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions[0]);
  }));
}
async function loadKnowledgeBase() {
  try {
    const response = await fetch("data/math-knowledge-base.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load knowledge base: ${response.status}`);
    const data = await response.json();
    if (data?.sources?.length) state.knowledgeBase = data;
  } catch (error) {
    console.warn("Using fallback Math knowledge base.", error);
  }
  renderKnowledgeBase();
  wireDemoQuestions();
  wireModeButtons();
  const defaultMode = getMode(state.activeModeId);
  const initialQuestion = questionField?.value?.trim() || defaultMode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions?.[0] || "怎么帮学生练数学？";
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
