function injectSpanishTutorSection() {
  if (document.querySelector("#spanish-ai-question")) return;

  const main = document.querySelector("main");
  if (!main) return;

  const anchor = document.querySelector(".page-footer");
  const section = document.createElement("section");
  section.className = "section ai-studio";
  section.innerHTML = `
    <div class="section-heading">
      <div>
        <span class="section-kicker">AI 互动练习</span>
        <h2>把西语 / 加泰练习接到知识库驱动的课堂工作台</h2>
        <p>学生可以在这里进行对话、纠错、发音和作业跟进，系统先检索知识库，再生成课堂示范和复练建议。</p>
      </div>
      <div class="studio-status" aria-label="课堂状态">
        <span>Conversation</span>
        <span>Homework</span>
        <span>School Sync</span>
      </div>
    </div>

    <div class="tutor-grid">
      <article class="info-card tutor-chat-card">
        <div class="card-head">
          <span class="card-tag">Knowledge Ask</span>
          <h3>输入问题，AI 西语 / 加泰老师自动调用知识库</h3>
        </div>
        <div class="tutor-active-mode">
          <strong id="spanish-active-mode-title">当前功能：对话</strong>
          <span id="spanish-active-mode-hint">先做情景问答，再输出示范句和追问。</span>
        </div>
        <label class="tutor-label" for="spanish-ai-question">你可以直接问：</label>
        <textarea id="spanish-ai-question" class="tutor-input" placeholder="例如：怎么帮学生练西语口语和作业同步？"></textarea>
        <div class="prompt-sample-row" aria-label="示例问题">
          <button class="prompt-sample" type="button" data-spanish-sample="怎么帮学生练西语口语和作业同步？">口语 + 作业</button>
          <button class="prompt-sample" type="button" data-spanish-sample="这句话有表达问题，帮我纠正">表达纠错</button>
          <button class="prompt-sample" type="button" data-spanish-sample="请示范一句本地语言发音">发音示范</button>
        </div>
        <div class="tutor-mode-row tutor-mode-row-inline" aria-label="功能切换">
          <button class="tutor-mode is-active" type="button" data-spanish-mode="dialogue">对话</button>
          <button class="tutor-mode" type="button" data-spanish-mode="correction">纠错</button>
          <button class="tutor-mode" type="button" data-spanish-mode="pronunciation">发音</button>
          <button class="tutor-mode" type="button" data-spanish-mode="essay">作文</button>
          <button class="tutor-mode" type="button" data-spanish-mode="reading">阅读</button>
          <button class="tutor-mode" type="button" data-spanish-mode="plain-text">Plain text</button>
        </div>
        <div class="tutor-actions">
          <button class="button button-primary" type="button" data-spanish-ask>调用知识库回答</button>
          <button class="button button-secondary" type="button" data-spanish-reset>换一个示例</button>
        </div>
        <div class="tutor-answer" id="spanish-ai-answer" aria-live="polite"></div>
        <div class="tutor-source-row" id="spanish-ai-sources" aria-label="命中的知识库来源"></div>
      </article>

      <aside class="info-card tutor-kb-card">
        <div class="card-head">
          <span class="card-tag">Knowledge Base</span>
          <h3>已整理的来源条目</h3>
        </div>
        <p>这些来源已经被结构化，优先参与 AI 西语 / 加泰老师的回答生成和课堂示范。</p>
        <div class="knowledge-list" id="spanish-kb-list"></div>
      </aside>
    </div>

    <section class="section tutor-function-bank">
      <div class="section-heading">
        <div>
          <span class="section-kicker">功能矩阵</span>
          <h2>六个功能切换，覆盖对话、纠错、发音、作业和阅读</h2>
          <p>这套功能会先从知识库里找条目，再按课堂场景组织输出，适合学校同步、家庭复练和本地语言支持。</p>
        </div>
      </div>
      <div class="function-grid">
        <article class="function-card is-active" data-tutor-card="dialogue"><span>01</span><h3>对话</h3><p>日常表达、校园问答、本地场景练习。</p></article>
        <article class="function-card" data-tutor-card="correction"><span>02</span><h3>纠错</h3><p>语序、词汇和句式的表达修正。</p></article>
        <article class="function-card" data-tutor-card="pronunciation"><span>03</span><h3>发音</h3><p>停顿、语调、连读和标准示范。</p></article>
        <article class="function-card" data-tutor-card="essay"><span>04</span><h3>作文</h3><p>短文表达、作业跟进和段落润色。</p></article>
        <article class="function-card" data-tutor-card="reading"><span>05</span><h3>阅读</h3><p>词汇理解、段落分析和题目训练。</p></article>
        <article class="function-card" data-tutor-card="plain-text"><span>06</span><h3>Plain text</h3><p>导入讲义、作业和课堂文本。</p></article>
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
  injectSpanishTutorSection();

  window.IvyTutorBoot({
    tutorName: "IvyEuro AI 西语 / 加泰老师",
    knowledgeBaseUrl: "data/spanish-catalan-knowledge-base.json",
    fallbackKnowledgeBase: {
      tutor: {
        name: "IvyEuro AI Spanish / Catalan Tutor",
        role: "先检索知识库，再组织成对话、纠错、发音和作业跟进的答案。",
        principles: [
          "先找来源，再生成回答",
          "优先使用可开口、可复练的短句",
          "根据年级和学校要求调整表达",
          "回答后给出下一步练习",
        ],
      },
      sources: [
        { id: "plain-text", name: "Plain text", summary: "可直接导入讲义、作业、纠错记录和课堂示范文本。", focus: "自定义内容、课堂文本、练习材料", keywords: ["自定义", "讲义", "作业", "练习", "文本", "纠错", "课堂"] },
        { id: "school-sync", name: "School sync", summary: "适合跟进学校作业、课堂节奏和本地课程要求。", focus: "学校同步、课堂节奏、本地要求", keywords: ["school", "sync", "学校", "作业", "课堂", "本地", "同步"] },
        { id: "speaking", name: "Speaking", summary: "适合口语练习、问答和日常表达。", focus: "口语、对话、日常表达", keywords: ["口语", "对话", "说", "表达", "speaking", "conversation", "hablar"] },
        { id: "homework", name: "Homework", summary: "适合作业检查、错题提示和复练建议。", focus: "作业检查、复练、错因提示", keywords: ["作业", "homework", "检查", "复练", "错因", "检查作业"] },
        { id: "reading", name: "Reading", summary: "适合阅读理解、词汇拓展和段落分析。", focus: "阅读理解、词汇拓展、段落分析", keywords: ["阅读", "reading", "文章", "词汇", "段落", "理解"] },
      ],
      modes: [
        { id: "plain-text", label: "Plain text", title: "导入文本", summary: "把讲义、作业和示范文本变成可直接讲解的内容。", promptHint: "适合上传讲义、作业、示范句或自定义文本。", preferredSources: ["plain-text"], sampleQuestions: ["把这段讲义整理成课堂要点", "把这份作业变成三步练习", "把这段示范句总结成 5 个重点"], outputStyle: "摘要 + 可讲解要点 + 下一步" },
        { id: "dialogue", label: "对话", title: "情景对话", summary: "围绕学校、生活和本地场景进行问答与追问。", promptHint: "适合练习口头表达和完整句输出。", preferredSources: ["school-sync", "speaking", "plain-text"], sampleQuestions: ["请和学生做一个校园问答", "请模拟家长和孩子的自我介绍", "请练习一个去超市的对话"], outputStyle: "对白 + 追问 + 复述" },
        { id: "correction", label: "纠错", title: "表达纠错", summary: "把学生输入修正成更自然、更准确的西语 / 加泰表达。", promptHint: "适合批改句子、语序和表达问题。", preferredSources: ["school-sync", "plain-text", "homework"], sampleQuestions: ["这句话有表达问题，帮我纠正", "我昨天去公园和朋友，帮我改", "这句不自然，帮我润色"], outputStyle: "原句 + 修改句 + 错误说明" },
        { id: "pronunciation", label: "发音", title: "发音示范", summary: "聚焦发音、连读、语调和停顿。", promptHint: "适合练发音、朗读和句子节奏。", preferredSources: ["speaking", "school-sync"], sampleQuestions: ["请示范这句话的发音和停顿", "我想练这句的朗读", "请帮我纠正这句的语调"], outputStyle: "发音提示 + 停顿建议 + 跟读句" },
        { id: "essay", label: "作文", title: "写作批改", summary: "从结构、表达、连接到完整段落输出。", promptHint: "适合写段落、写短文、做提纲和润色。", preferredSources: ["homework", "plain-text"], sampleQuestions: ["写一段关于学校生活的短文", "帮我把这篇作文改得更有逻辑", "给我一个旅行段落提纲"], outputStyle: "提纲 + 示例段落 + 连接词" },
        { id: "reading", label: "阅读", title: "阅读理解", summary: "帮助学生抓主旨、找细节、理解词句关系。", promptHint: "适合阅读理解、词汇拓展和短文分析。", preferredSources: ["reading", "school-sync"], sampleQuestions: ["帮我分析这篇阅读的主旨", "这篇文章里有哪些关键词", "给我一个阅读理解训练"], outputStyle: "主旨 + 关键词 + 题目" },
      ],
      demoQuestions: ["怎么帮学生练西语口语和作业同步？", "这句话有表达问题，帮我纠正", "怎样把学校里的西语课文和课后练习串起来？"],
    },
    selectors: {
      questionField: "#spanish-ai-question",
      answerBox: "#spanish-ai-answer",
      sourceRow: "#spanish-ai-sources",
      kbList: "#spanish-kb-list",
      askButton: "[data-spanish-ask]",
      resetButton: "[data-spanish-reset]",
      activeModeName: "#spanish-active-mode-title",
      activeModeHint: "#spanish-active-mode-hint",
      modeButtons: "[data-spanish-mode]",
      functionCards: "[data-tutor-card]",
    },
    modeAttr: "data-spanish-mode",
    sampleAttr: "data-spanish-sample",
    sampleSelector: "[data-spanish-sample]",
    defaultModeId: "dialogue",
    defaultQuestion: "怎么帮学生练西语口语和作业同步？",
    defaultFocus: "先用知识库中的标准文本示范，再让学生跟读和复练。",
    defaultNextStep: "建议先从一句短句开始，确认发音后再进入问答。",
    defaultExample: "¿Podemos repasar la tarea?",
    defaultExtra: "你可以继续追问：请给我一个更简单的版本。",
    sourceScoring: [
      { pattern: "口语|说|conversation|hablar", sourceId: "speaking", bonus: 2 },
      { pattern: "作业|homework|检查", sourceId: "homework", bonus: 2 },
      { pattern: "阅读|reading|文章", sourceId: "reading", bonus: 2 },
    ],
    modeOverrides: {
      "plain-text": {
        focus: "先把输入文本拆成主题、关键词、示范句和复练任务。",
        nextStep: "先整理成三段：讲解、练习、复习。",
        example: "主题：校园生活；关键词：表达、练习、复读。",
        extra: "你可以继续追问：把这段讲义变成 3 个课堂任务。",
      },
      dialogue: {
        focus: "先给学生完整对话框架，再让他按角色接话和追问。",
        nextStep: "先练两轮问答，再切换场景继续。",
        example: "A: ¿Podemos repasar la tarea? B: Sí, claro.",
        extra: "你可以继续追问：再给我一个更适合小学生的对话。",
      },
      correction: {
        focus: "先展示修改后的正确句，再解释错误点。",
        nextStep: "让学生把改正句重复说一遍，确认掌握。",
        example: "¿Podemos repasar la tarea?",
        extra: "建议一次只改 1 句，方便学生看到前后差异。",
        modeLabelLine: "当前功能：纠错 · 已识别到一句需要纠正的句子",
      },
      pronunciation: {
        focus: "先拆分发音、停顿和语调，再提供朗读提示。",
        nextStep: "先跟读标准句，再把句子放进短文里练。",
        example: "¿Podemos / repasar / la / tarea?",
        extra: "如果你读得慢一点，系统会先示范，再让你跟读。",
        modeLabelLine: "当前功能：发音 · 优先做朗读与停顿",
      },
      essay: {
        focus: "先给写作提纲，再补连接词和示范段落。",
        nextStep: "先写三句，再扩成一段，再做润色。",
        example: "主题：学校生活；结构：开头 - 经过 - 感受。",
        extra: "你可以继续追问：帮我把这一段写得更像作文。",
      },
      reading: {
        focus: "先抓主旨和关键词，再做细节理解与题目训练。",
        nextStep: "先读标题和首尾句，再回答 3 个理解题。",
        example: "主旨：这篇文章讲的是学校作业和复练。",
        extra: "阅读模式会优先给主旨、词句和题目框架。",
        modeLabelLine: "当前功能：阅读 · 优先做主旨和细节理解",
      },
    },
    fallbackMatchers: [
      { pattern: "阅读|读|文章", targetModeId: "reading", focus: "先从短文和词句理解入手，再做段落复述与问题回答。", nextStep: "先让学生找关键词，再用完整句子回答问题。", example: "这篇文章讲的是学校生活。" },
      { pattern: "口语|说|问答|hablar", targetModeId: "dialogue", focus: "先给学生一个完整回答框架，再让他用自己的话说出来。", nextStep: "把问题拆成开头句、核心句和结尾句来练。", example: "¿Podemos repasar la tarea?" },
      { pattern: "发音|pronunciation|读音", targetModeId: "pronunciation", focus: "先看标准示范，再做发音、停顿和语感纠正。", nextStep: "先跟读标准句，再把语感和停顿再练一遍。", example: "¿Podemos / repasar / la / tarea?" },
      { pattern: "作业|homework|同步", targetModeId: "essay", focus: "先和学校作业对齐，再把练习和表达串起来。", nextStep: "先确认作业要求，再给学生一个复练任务。", example: "这一课重点是表达、练习和复读。" },
    ],
  });
});
