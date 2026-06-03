function injectFrenchTutorSection() {
  if (document.querySelector("#french-ai-question")) return;

  const main = document.querySelector("main");
  if (!main) return;

  const anchor = document.querySelector(".page-footer");
  const section = document.createElement("section");
  section.className = "section ai-studio";
  section.innerHTML = `
    <div class="section-heading">
      <div>
        <span class="section-kicker">AI 互动练习</span>
        <h2>把法语练习接到知识库驱动的课堂工作台</h2>
        <p>学生可以在这里进行对话、发音、纠错和考试复练，系统先检索知识库，再生成课堂示范和复练建议。</p>
      </div>
      <div class="studio-status" aria-label="课堂状态">
        <span>Pronunciation</span>
        <span>Dialogue</span>
        <span>Exam Prep</span>
      </div>
    </div>

    <div class="tutor-grid">
      <article class="info-card tutor-chat-card">
        <div class="card-head">
          <span class="card-tag">Knowledge Ask</span>
          <h3>输入问题，AI 法语老师自动调用知识库</h3>
        </div>
        <div class="tutor-active-mode">
          <strong id="french-active-mode-title">当前功能：对话</strong>
          <span id="french-active-mode-hint">先做情景问答，再输出示范句和追问。</span>
        </div>
        <label class="tutor-label" for="french-ai-question">你可以直接问：</label>
        <textarea id="french-ai-question" class="tutor-input" placeholder="例如：怎么帮学生练法语发音和考试复练？"></textarea>
        <div class="prompt-sample-row" aria-label="示例问题">
          <button class="prompt-sample" type="button" data-french-sample="怎么帮学生练法语发音和考试复练？">发音 + 复练</button>
          <button class="prompt-sample" type="button" data-french-sample="这句话有表达问题，帮我纠正">表达纠错</button>
          <button class="prompt-sample" type="button" data-french-sample="请示范一句法语标准发音">发音示范</button>
        </div>
        <div class="tutor-mode-row tutor-mode-row-inline" aria-label="功能切换">
          <button class="tutor-mode is-active" type="button" data-french-mode="dialogue">对话</button>
          <button class="tutor-mode" type="button" data-french-mode="correction">纠错</button>
          <button class="tutor-mode" type="button" data-french-mode="pronunciation">发音</button>
          <button class="tutor-mode" type="button" data-french-mode="essay">作文</button>
          <button class="tutor-mode" type="button" data-french-mode="reading">阅读</button>
          <button class="tutor-mode" type="button" data-french-mode="plain-text">Plain text</button>
        </div>
        <div class="tutor-actions">
          <button class="button button-primary" type="button" data-french-ask>调用知识库回答</button>
          <button class="button button-secondary" type="button" data-french-reset>换一个示例</button>
        </div>
        <div class="tutor-answer" id="french-ai-answer" aria-live="polite"></div>
        <div class="tutor-source-row" id="french-ai-sources" aria-label="命中的知识库来源"></div>
      </article>

      <aside class="info-card tutor-kb-card">
        <div class="card-head">
          <span class="card-tag">Knowledge Base</span>
          <h3>已整理的来源条目</h3>
        </div>
        <p>这些来源已经被结构化，优先参与 AI 法语老师的回答生成和课堂示范。</p>
        <div class="knowledge-list" id="french-kb-list"></div>
      </aside>
    </div>

    <section class="section tutor-function-bank">
      <div class="section-heading">
        <div>
          <span class="section-kicker">功能矩阵</span>
          <h2>六个功能切换，覆盖对话、纠错、发音、作文和阅读</h2>
          <p>这套功能先从知识库里找条目，再按课堂场景组织输出，适合法语入门、发音训练和分级考试准备。</p>
        </div>
      </div>
      <div class="function-grid">
        <article class="function-card is-active" data-tutor-card="dialogue"><span>01</span><h3>对话</h3><p>日常表达、学校场景、问答练习。</p></article>
        <article class="function-card" data-tutor-card="correction"><span>02</span><h3>纠错</h3><p>语序、词汇和句式的表达修正。</p></article>
        <article class="function-card" data-tutor-card="pronunciation"><span>03</span><h3>发音</h3><p>音节、连读、重音和语调示范。</p></article>
        <article class="function-card" data-tutor-card="essay"><span>04</span><h3>作文</h3><p>短文表达、分级考试和段落润色。</p></article>
        <article class="function-card" data-tutor-card="reading"><span>05</span><h3>阅读</h3><p>词汇理解、段落分析和题目训练。</p></article>
        <article class="function-card" data-tutor-card="plain-text"><span>06</span><h3>Plain text</h3><p>导入讲义、作业和课堂文本。</p></article>
      </div>
    </section>
  `;

  if (anchor && anchor.parentNode === main) main.insertBefore(section, anchor);
  else main.appendChild(section);
}

window.addEventListener("DOMContentLoaded", () => {
  injectFrenchTutorSection();
  window.IvyTutorBoot({
    tutorName: "IvyEuro AI 法语老师",
    knowledgeBaseUrl: "data/french-knowledge-base.json",
    fallbackKnowledgeBase: {
      tutor: {
        name: "IvyEuro AI French Tutor",
        role: "先检索知识库，再组织成对话、纠错、发音和考试复练的答案。",
        principles: [
          "先找来源，再生成回答",
          "优先使用可开口、可复练的短句",
          "根据年级和考试要求调整表达",
          "回答后给出下一步练习",
        ],
      },
      sources: [
        { id: "plain-text", name: "Plain text", summary: "可直接导入讲义、作业、示范文本和课堂纠错记录。", focus: "自定义内容、课堂文本、练习材料", keywords: ["自定义", "讲义", "作业", "练习", "文本", "纠错", "课堂"] },
        { id: "dialogue-book", name: "Dialogue book", summary: "适合口语练习、问答和日常表达。", focus: "口语、对话、日常表达", keywords: ["口语", "对话", "说", "表达", "conversation", "dialogue", "parler"] },
        { id: "pronunciation", name: "Pronunciation guide", summary: "适合发音、连读、节奏和重音训练。", focus: "发音、连读、节奏、重音", keywords: ["发音", "连读", "节奏", "重音", "pronunciation", "accent", "intonation"] },
        { id: "exam-prep", name: "Exam prep", summary: "适合分级考试、题型训练和阶段复练。", focus: "考试准备、题型、复练", keywords: ["考试", "分级", "复练", "题型", "exam", "DELF", "DALF"] },
        { id: "reading-writing", name: "Reading & writing", summary: "适合阅读理解、短文写作和表达拓展。", focus: "阅读理解、短文写作、表达拓展", keywords: ["阅读", "写作", "短文", "表达", "reading", "writing"] },
      ],
      modes: [
        { id: "plain-text", label: "Plain text", title: "导入文本", summary: "把讲义、作业和示范文本变成可直接讲解的内容。", promptHint: "适合上传讲义、作业、示范句或自定义文本。", preferredSources: ["plain-text"], sampleQuestions: ["把这段讲义整理成课堂要点", "把这份作业变成三步练习", "把这段示范句总结成 5 个重点"], outputStyle: "摘要 + 可讲解要点 + 下一步" },
        { id: "dialogue", label: "对话", title: "情景对话", summary: "围绕学校、生活和考试场景进行问答与追问。", promptHint: "适合练习口头表达和完整句输出。", preferredSources: ["dialogue-book", "plain-text"], sampleQuestions: ["请和学生做一个校园问答", "请模拟老师和学生的自我介绍", "请练习一个问路的对话"], outputStyle: "对白 + 追问 + 复述" },
        { id: "correction", label: "纠错", title: "表达纠错", summary: "把学生输入修正成更自然、更准确的法语表达。", promptHint: "适合批改句子、语序和表达问题。", preferredSources: ["reading-writing", "plain-text"], sampleQuestions: ["这句话有表达问题，帮我纠正", "我昨天去公园和朋友，帮我改", "这句不自然，帮我润色"], outputStyle: "原句 + 修改句 + 错误说明" },
        { id: "pronunciation", label: "发音", title: "发音示范", summary: "聚焦发音、连读、语调和停顿。", promptHint: "适合练发音、朗读和句子节奏。", preferredSources: ["pronunciation", "dialogue-book"], sampleQuestions: ["请示范这句话的发音和停顿", "我想练这句的朗读", "请帮我纠正这句的语调"], outputStyle: "发音提示 + 停顿建议 + 跟读句" },
        { id: "essay", label: "作文", title: "写作批改", summary: "从结构、表达、连接到完整段落输出。", promptHint: "适合写段落、写短文、做提纲和润色。", preferredSources: ["reading-writing", "plain-text"], sampleQuestions: ["写一段关于学校生活的短文", "帮我把这篇作文改得更有逻辑", "给我一个旅行段落提纲"], outputStyle: "提纲 + 示例段落 + 连接词" },
        { id: "reading", label: "阅读", title: "阅读理解", summary: "帮助学生抓主旨、找细节、理解词句关系。", promptHint: "适合阅读理解、词汇拓展和短文分析。", preferredSources: ["reading-writing", "exam-prep"], sampleQuestions: ["帮我分析这篇阅读的主旨", "这篇文章里有哪些关键词", "给我一个阅读理解训练"], outputStyle: "主旨 + 关键词 + 题目" },
      ],
      demoQuestions: ["怎么帮学生练法语口语和发音？", "这句话有表达问题，帮我纠正", "怎样把法语课文和考试复练串起来？"],
    },
    selectors: {
      questionField: "#french-ai-question",
      answerBox: "#french-ai-answer",
      sourceRow: "#french-ai-sources",
      kbList: "#french-kb-list",
      askButton: "[data-french-ask]",
      resetButton: "[data-french-reset]",
      activeModeName: "#french-active-mode-title",
      activeModeHint: "#french-active-mode-hint",
      modeButtons: "[data-french-mode]",
      functionCards: "[data-tutor-card]",
    },
    modeAttr: "data-french-mode",
    sampleAttr: "data-french-sample",
    sampleSelector: "[data-french-sample]",
    defaultModeId: "dialogue",
    defaultQuestion: "怎么帮学生练法语发音和考试复练？",
    defaultFocus: "先用知识库中的标准文本示范，再让学生跟读和复练。",
    defaultNextStep: "建议先从一句短句开始，确认发音后再进入问答。",
    defaultExample: "Je voudrais pratiquer le français.",
    defaultExtra: "你可以继续追问：请给我一个更简单的版本。",
    sourceScoring: [
      { pattern: "口语|说|conversation|parler", sourceId: "dialogue-book", bonus: 2 },
      { pattern: "发音|pronunciation|读音", sourceId: "pronunciation", bonus: 2 },
      { pattern: "考试|exam|DELF|DALF", sourceId: "exam-prep", bonus: 2 },
      { pattern: "阅读|reading|写作|writing", sourceId: "reading-writing", bonus: 2 },
    ],
    modeOverrides: {
      "plain-text": { focus: "先把输入文本拆成主题、关键词、示范句和复练任务。", nextStep: "先整理成三段：讲解、练习、复习。", example: "主题：校园生活；关键词：表达、练习、复读。", extra: "你可以继续追问：把这段讲义变成 3 个课堂任务。" },
      dialogue: { focus: "先给学生完整对话框架，再让他按角色接话和追问。", nextStep: "先练两轮问答，再切换场景继续。", example: "A: Je voudrais pratiquer le français. B: Bien sûr, allons-y.", extra: "你可以继续追问：再给我一个更适合小学生的对话。" },
      correction: { focus: "先展示修改后的正确句，再解释错误点。", nextStep: "让学生把改正句重复说一遍，确认掌握。", example: "Je voudrais pratiquer le français.", extra: "建议一次只改 1 句，方便学生看到前后差异。", modeLabelLine: "当前功能：纠错 · 已识别到一句需要纠正的句子" },
      pronunciation: { focus: "先拆分发音、连读和语调，再提供朗读提示。", nextStep: "先跟读标准句，再把句子放进短文里练。", example: "Je voudrais / pratiquer / le / français.", extra: "如果你读得慢一点，系统会先示范，再让你跟读。", modeLabelLine: "当前功能：发音 · 优先做朗读与停顿" },
      essay: { focus: "先给写作提纲，再补连接词和示范段落。", nextStep: "先写三句，再扩成一段，再做润色。", example: "主题：学校生活；结构：开头 - 经过 - 感受。", extra: "你可以继续追问：帮我把这一段写得更像作文。" },
      reading: { focus: "先抓主旨和关键词，再做细节理解与题目训练。", nextStep: "先读标题和首尾句，再回答 3 个理解题。", example: "主旨：这篇文章讲的是学校作业和复练。", extra: "阅读模式会优先给主旨、词句和题目框架。", modeLabelLine: "当前功能：阅读 · 优先做主旨和细节理解" },
    },
    fallbackMatchers: [
      { pattern: "阅读|read|reading", targetModeId: "reading", focus: "先从短文和词句理解入手，再做段落复述与问题回答。", nextStep: "先让学生找关键词，再用完整句子回答问题。", example: "Cette article parle de la vie scolaire." },
      { pattern: "口语|说|问答|parler", targetModeId: "dialogue", focus: "先给学生一个完整回答框架，再让他用自己的话说出来。", nextStep: "把问题拆成开头句、核心句和结尾句来练。", example: "Je voudrais pratiquer le français." },
      { pattern: "发音|pronunciation|读音", targetModeId: "pronunciation", focus: "先看标准示范，再做发音、停顿和语感纠正。", nextStep: "先跟读标准句，再把语感和停顿再练一遍。", example: "Je voudrais / pratiquer / le / français." },
      { pattern: "考试|exam|DELF|DALF", targetModeId: "reading", focus: "先和考试要求对齐，再把题型和表达串起来。", nextStep: "先确认题型，再给学生一个复练任务。", example: "这一题重点是理解主旨和关键词。" },
    ],
  });
});
