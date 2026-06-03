function injectProgrammingTutorSection() {
  if (document.querySelector("#programming-ai-question")) {
    return;
  }

  const main = document.querySelector("main");
  if (!main) {
    return;
  }

  const anchor = document.querySelector(".page-footer");
  const section = document.createElement("section");
  section.className = "section ai-studio";
  section.innerHTML = `
    <div class="section-heading">
      <div>
        <span class="section-kicker">AI 互动练习</span>
        <h2>把编程练习接到知识库驱动的项目工作台</h2>
        <p>学生可以在这里进行需求对话、代码纠错、项目拆解和复盘，系统先检索知识库，再生成项目示范和迭代建议。</p>
      </div>
      <div class="studio-status" aria-label="课堂状态">
        <span>Project Flow</span>
        <span>Code Check</span>
        <span>Review Loop</span>
      </div>
    </div>

    <div class="tutor-grid">
      <article class="info-card tutor-chat-card">
        <div class="card-head">
          <span class="card-tag">Knowledge Ask</span>
          <h3>输入问题，AI 编程教练自动调用知识库</h3>
        </div>
        <div class="tutor-active-mode">
          <strong id="programming-active-mode-title">当前功能：对话</strong>
          <span id="programming-active-mode-hint">先做需求问答，再输出项目步骤和追问。</span>
        </div>
        <label class="tutor-label" for="programming-ai-question">你可以直接问：</label>
        <textarea id="programming-ai-question" class="tutor-input" placeholder="例如：怎么帮学生拆解一个 todo app 项目？"></textarea>
        <div class="prompt-sample-row" aria-label="示例问题">
          <button class="prompt-sample" type="button" data-programming-sample="怎么帮学生拆解一个 todo app 项目？">项目拆解</button>
          <button class="prompt-sample" type="button" data-programming-sample="这段代码有问题，帮我纠正">代码纠错</button>
          <button class="prompt-sample" type="button" data-programming-sample="请示范一个 Python 入门项目">项目示范</button>
        </div>
        <div class="tutor-mode-row tutor-mode-row-inline" aria-label="功能切换">
          <button class="tutor-mode is-active" type="button" data-programming-mode="dialogue">对话</button>
          <button class="tutor-mode" type="button" data-programming-mode="correction">纠错</button>
          <button class="tutor-mode" type="button" data-programming-mode="pronunciation">讲解</button>
          <button class="tutor-mode" type="button" data-programming-mode="essay">项目</button>
          <button class="tutor-mode" type="button" data-programming-mode="reading">阅读</button>
          <button class="tutor-mode" type="button" data-programming-mode="plain-text">Plain text</button>
        </div>
        <div class="tutor-actions">
          <button class="button button-primary" type="button" data-programming-ask>调用知识库回答</button>
          <button class="button button-secondary" type="button" data-programming-reset>换一个示例</button>
        </div>
        <div class="tutor-answer" id="programming-ai-answer" aria-live="polite"></div>
        <div class="tutor-source-row" id="programming-ai-sources" aria-label="命中的知识库来源"></div>
      </article>

      <aside class="info-card tutor-kb-card">
        <div class="card-head">
          <span class="card-tag">Knowledge Base</span>
          <h3>已整理的来源条目</h3>
        </div>
        <p>这些来源已经被结构化，优先参与 AI 编程教练的回答生成和课堂示范。</p>
        <div class="knowledge-list" id="programming-kb-list"></div>
      </aside>
    </div>

    <section class="section tutor-function-bank">
      <div class="section-heading">
        <div>
          <span class="section-kicker">功能矩阵</span>
          <h2>六个功能切换，覆盖需求、纠错、讲解、项目和代码阅读</h2>
          <p>这套功能先从知识库里找条目，再按项目场景组织输出，适合 Python、项目实践和 AI 工具训练。</p>
        </div>
      </div>
      <div class="function-grid">
        <article class="function-card is-active" data-tutor-card="dialogue"><span>01</span><h3>对话</h3><p>需求沟通、项目启动和问题拆解。</p></article>
        <article class="function-card" data-tutor-card="correction"><span>02</span><h3>纠错</h3><p>代码语法、逻辑和实现问题修正。</p></article>
        <article class="function-card" data-tutor-card="pronunciation"><span>03</span><h3>讲解</h3><p>项目步骤、思路和代码示范。</p></article>
        <article class="function-card" data-tutor-card="essay"><span>04</span><h3>项目</h3><p>项目设计、功能清单和结构规划。</p></article>
        <article class="function-card" data-tutor-card="reading"><span>05</span><h3>阅读</h3><p>代码阅读、文档理解和结构分析。</p></article>
        <article class="function-card" data-tutor-card="plain-text"><span>06</span><h3>Plain text</h3><p>导入需求、讲义和代码说明。</p></article>
      </div>
    </section>
  `;

  if (anchor && anchor.parentNode === main) {
    main.insertBefore(section, anchor);
  } else {
    main.appendChild(section);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  injectProgrammingTutorSection();
  window.IvyTutorBoot({
    tutorName: "IvyEuro AI 编程教练",
    knowledgeBaseUrl: "data/programming-knowledge-base.json",
    fallbackKnowledgeBase: {
      tutor: {
        name: "IvyEuro AI Programming Tutor",
        role: "先检索知识库，再组织成项目拆解、代码讲解、纠错和复盘的答案。",
        principles: [
          "先找来源，再生成回答",
          "优先使用可拆解、可复练的步骤",
          "根据年级和项目复杂度调整表达",
          "回答后给出下一步练习",
        ],
      },
      sources: [
        { id: "plain-text", name: "Plain text", summary: "可直接导入讲义、需求说明、代码片段和课堂记录。", focus: "自定义内容、课堂文本、练习材料", keywords: ["自定义", "讲义", "练习", "文本", "课堂", "代码", "需求"] },
        { id: "project-notes", name: "Project notes", summary: "适合项目目标、功能列表和任务拆解。", focus: "项目目标、任务拆解、功能列表", keywords: ["项目", "功能", "目标", "拆解", "任务", "计划"] },
        { id: "code-samples", name: "Code samples", summary: "适合代码讲解、语法示范和修复建议。", focus: "代码讲解、语法示范、修复建议", keywords: ["代码", "语法", "示范", "修复", "错误", "function", "class"] },
        { id: "tooling", name: "AI tools", summary: "适合工具使用、Prompt 设计和流程效率。", focus: "AI 工具、Prompt、流程效率", keywords: ["工具", "AI", "prompt", "流程", "效率", "copilot", "chatgpt"] },
        { id: "review", name: "Review notes", summary: "适合复盘、优化建议和迭代清单。", focus: "复盘、优化建议、迭代清单", keywords: ["复盘", "review", "优化", "迭代", "检查", "改进"] },
      ],
      modes: [
        { id: "plain-text", label: "Plain text", title: "导入文本", summary: "把需求、讲义和代码片段变成可直接讲解的内容。", promptHint: "适合上传需求文档、讲义、代码片段或自定义文本。", preferredSources: ["plain-text"], sampleQuestions: ["把这段需求整理成项目要点", "把这份笔记变成三步练习", "把这段代码总结成 5 个重点"], outputStyle: "摘要 + 可讲解要点 + 下一步" },
        { id: "dialogue", label: "对话", title: "需求对话", summary: "围绕需求、目标和功能进行问答与追问。", promptHint: "适合练习需求描述、功能拆解和沟通表达。", preferredSources: ["project-notes", "plain-text"], sampleQuestions: ["请和学生做一个需求问答", "请模拟老师和学生讨论功能拆解", "请练习一个项目启动对话"], outputStyle: "对白 + 追问 + 复述" },
        { id: "correction", label: "纠错", title: "代码纠错", summary: "把学生输入修正成更完整、更准确的代码或步骤。", promptHint: "适合批改代码、找逻辑问题和改实现错误。", preferredSources: ["code-samples", "plain-text"], sampleQuestions: ["这段代码有问题，帮我纠正", "我的循环写错了，帮我改", "这一步逻辑不对，帮我解释"], outputStyle: "原代码 + 修改版 + 错误说明" },
        { id: "pronunciation", label: "讲解", title: "讲解示范", summary: "聚焦项目讲解、步骤顺序和表达清晰度。", promptHint: "适合练项目讲解、口头表达和步骤顺序。", preferredSources: ["project-notes", "review"], sampleQuestions: ["请示范这段项目讲解", "我想练这道代码题的表达", "请帮我检查讲解顺序"], outputStyle: "步骤提示 + 讲解建议 + 跟练题" },
        { id: "essay", label: "项目", title: "项目设计", summary: "从思路、结构、功能到完整项目输出。", promptHint: "适合写项目计划、做功能清单和润色表达。", preferredSources: ["project-notes", "tooling"], sampleQuestions: ["写一段这个项目的设计思路", "帮我把这个项目改得更有逻辑", "给我一个 TODO 应用的提纲"], outputStyle: "提纲 + 示例过程 + 连接词" },
        { id: "reading", label: "阅读", title: "代码阅读", summary: "帮助学生抓结构、找重点、理解代码关系。", promptHint: "适合代码阅读、结构分析和功能拆解。", preferredSources: ["code-samples", "review"], sampleQuestions: ["帮我分析这段代码的主旨", "这段代码里有哪些关键函数", "给我一个代码阅读训练"], outputStyle: "主旨 + 关键词 + 题目" },
      ],
      demoQuestions: ["怎么帮学生练项目拆解和 Python 基础？", "这段代码有问题，帮我纠正", "怎样把一个项目需求串成完整流程？"],
    },
    selectors: {
      questionField: "#programming-ai-question",
      answerBox: "#programming-ai-answer",
      sourceRow: "#programming-ai-sources",
      kbList: "#programming-kb-list",
      askButton: "[data-programming-ask]",
      resetButton: "[data-programming-reset]",
      activeModeName: "#programming-active-mode-title",
      activeModeHint: "#programming-active-mode-hint",
      modeButtons: "[data-programming-mode]",
      functionCards: "[data-tutor-card]",
    },
    modeAttr: "data-programming-mode",
    sampleAttr: "data-programming-sample",
    sampleSelector: "[data-programming-sample]",
    defaultModeId: "dialogue",
    defaultQuestion: "怎么帮学生练项目拆解和 Python 基础？",
    defaultFocus: "先用知识库中的标准步骤示范，再让学生复练。",
    defaultNextStep: "建议先从一个小项目开始，确认步骤后再进入追问。",
    defaultExample: "先做添加任务，再做删除任务。",
    defaultExtra: "你可以继续追问：请给我一个更简单的版本。",
    sourceScoring: [
      { pattern: "项目|功能|目标|拆解", sourceId: "project-notes", bonus: 2 },
      { pattern: "代码|语法|错误|class|function", sourceId: "code-samples", bonus: 2 },
      { pattern: "工具|prompt|AI", sourceId: "tooling", bonus: 2 },
      { pattern: "复盘|review|优化|迭代", sourceId: "review", bonus: 2 },
    ],
    modeOverrides: {
      "plain-text": { focus: "先把输入文本拆成主题、关键词、示范句和复练任务。", nextStep: "先整理成三段：讲解、练习、复习。", example: "主题：项目思维；关键词：功能、步骤、迭代。", extra: "你可以继续追问：把这段讲义变成 3 个课堂任务。" },
      dialogue: { focus: "先给学生完整需求框架，再让他按步骤接话和追问。", nextStep: "先练两轮问答，再切换场景继续。", example: "A: 这个项目要做什么？ B: 一个可以添加任务的 todo app。", extra: "你可以继续追问：再给我一个更适合初学者的项目对话。" },
      correction: { focus: "先展示修改后的正确代码，再解释错误点。", nextStep: "让学生把改正后的代码重复写一遍，确认掌握。", example: "先写列表，再绑定点击事件。", extra: "建议一次只改 1 处，方便学生看到前后差异。", modeLabelLine: "当前功能：纠错 · 已识别到一段需要修正的代码" },
      pronunciation: { focus: "先拆分项目顺序、关键术语和表达节奏，再提供讲解提示。", nextStep: "先跟读标准讲解，再把步骤放进完整项目里练。", example: "先拆需求，再写功能，再检查运行结果。", extra: "如果你讲得慢一点，系统会先示范，再让你复讲。", modeLabelLine: "当前功能：讲解 · 优先做项目示范" },
      essay: { focus: "先给项目提纲，再补关键步骤和示范过程。", nextStep: "先写三步，再扩成完整过程，再做润色。", example: "步骤：需求 / 功能 / 实现 / 复盘。", extra: "你可以继续追问：帮我把这一段写得更像标准答案。" },
      reading: { focus: "先抓条件和关系，再做代码结构拆解。", nextStep: "先读题目和关键数据，再回答 3 个理解问题。", example: "条件：已知功能列表；要求：实现基础版本。", extra: "阅读模式会优先给条件、关系和题目框架。", modeLabelLine: "当前功能：阅读 · 优先做代码阅读" },
    },
    fallbackMatchers: [
      { pattern: "项目|功能|目标|拆解", targetModeId: "reading", focus: "先从需求和功能入手，再做步骤拆解与验证。", nextStep: "先让学生找关键词，再用完整步骤回答。", example: "先把 todo app 拆成添加、删除、保存三步。" },
      { pattern: "代码|语法|错误|class|function", targetModeId: "correction", focus: "先纠正错误代码，再解释为什么这样改。", nextStep: "先把错因说清楚，再让学生重写一遍。", example: "先写列表，再绑定点击事件。" },
      { pattern: "工具|prompt|AI", targetModeId: "essay", focus: "先和工具使用目标对齐，再把流程和提示串起来。", nextStep: "先确认工具场景，再给学生一个复练任务。", example: "这一题重点是拆需求、写 prompt 和检查结果。" },
    ],
  });
});
