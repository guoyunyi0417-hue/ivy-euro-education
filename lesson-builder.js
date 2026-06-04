(function () {
  const form = document.querySelector("[data-lesson-form]");
  const output = document.querySelector("#lesson-output");
  const status = document.querySelector("#lesson-builder-status");
  const title = document.querySelector("#lesson-output-title");
  const copyButton = document.querySelector("[data-copy-lesson]");
  let lastMarkdown = "";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getFormData() {
    const formData = new FormData(form);
    return {
      age: formData.get("age"),
      grade: formData.get("grade"),
      subject: formData.get("subject"),
      topic: formData.get("topic"),
      duration: formData.get("duration"),
      curriculum: formData.get("curriculum"),
      level: formData.get("level"),
      objective: formData.get("objective"),
      outputTypes: formData.getAll("outputTypes"),
    };
  }

  function list(items, renderItem) {
    if (!Array.isArray(items) || !items.length) return "";
    return `<ol>${items.map(renderItem).join("")}</ol>`;
  }

  function section(label, html) {
    if (!html) return "";
    return `<article class="lesson-result-section"><h3>${label}</h3>${html}</article>`;
  }

  function renderResult(data) {
    const result = data.result || data;
    const meta = result.meta || {};
    title.textContent = meta.title || "课程包已生成";

    const blocks = [
      section("课程概览", `
        <dl class="lesson-meta">
          <div><dt>Age</dt><dd>${escapeHtml(meta.age)}</dd></div>
          <div><dt>Grade</dt><dd>${escapeHtml(meta.grade)}</dd></div>
          <div><dt>Duration</dt><dd>${escapeHtml(meta.duration)}</dd></div>
          <div><dt>Curriculum</dt><dd>${escapeHtml(meta.curriculum)}</dd></div>
          <div><dt>Level</dt><dd>${escapeHtml(meta.level)}</dd></div>
          <div><dt>Objective</dt><dd>${escapeHtml(meta.objective)}</dd></div>
        </dl>
      `),
      section("Lesson Plan", list(result.lessonPlan, (item) => `
        <li><strong>${escapeHtml(item.time)} · ${escapeHtml(item.stage)}</strong><p>${escapeHtml(item.teacherAction)}</p><p>${escapeHtml(item.studentAction)}</p><small>${escapeHtml(item.output)}</small></li>
      `)),
      section("Slides", list(result.slides, (slide) => `
        <li><strong>${escapeHtml(slide.title)}</strong><p>${escapeHtml((slide.bullets || []).join(" · "))}</p></li>
      `)),
      section("Quiz", list(result.quiz, (item) => `
        <li><strong>${escapeHtml(item.question)}</strong><p>${escapeHtml(item.answer)}</p></li>
      `)),
      section("Homework", list(result.homework, (item) => `<li>${escapeHtml(item)}</li>`)),
      section("Rubric", list(result.rubric, (item) => `
        <li><strong>${escapeHtml(item.criterion)}</strong><p>Excellent: ${escapeHtml(item.excellent)}</p><p>Developing: ${escapeHtml(item.developing)}</p></li>
      `)),
      section("Audio Script", result.audio ? `<p>${escapeHtml(result.audio.script)}</p>` : ""),
    ];

    output.innerHTML = blocks.join("");
    status.textContent = data.mode === "llm" ? "已使用模型生成。" : "已使用本地课程生成逻辑。配置 LLM 后会自动升级。";
    lastMarkdown = toMarkdown(result);
  }

  function toMarkdown(result) {
    const chunks = [`# ${result.meta?.title || "Lesson Package"}`];
    if (result.meta) {
      chunks.push(`Age: ${result.meta.age}\nGrade: ${result.meta.grade}\nDuration: ${result.meta.duration}\nCurriculum: ${result.meta.curriculum}\nObjective: ${result.meta.objective}`);
    }
    if (result.lessonPlan) {
      chunks.push("## Lesson Plan");
      result.lessonPlan.forEach((item) => chunks.push(`- ${item.time} ${item.stage}: ${item.teacherAction} / ${item.studentAction}`));
    }
    if (result.slides) {
      chunks.push("## Slides");
      result.slides.forEach((item) => chunks.push(`- ${item.title}: ${(item.bullets || []).join("; ")}`));
    }
    if (result.quiz) {
      chunks.push("## Quiz");
      result.quiz.forEach((item) => chunks.push(`- Q: ${item.question}\n  A: ${item.answer}`));
    }
    if (result.homework) chunks.push(`## Homework\n${result.homework.map((item) => `- ${item}`).join("\n")}`);
    if (result.rubric) {
      chunks.push("## Rubric");
      result.rubric.forEach((item) => chunks.push(`- ${item.criterion}: ${item.excellent} / ${item.developing}`));
    }
    if (result.audio) chunks.push(`## Audio Script\n${result.audio.script}`);
    return chunks.join("\n\n");
  }

  async function generateLesson(event) {
    event.preventDefault();
    status.textContent = "正在生成课程包...";
    output.innerHTML = "";

    try {
      const response = await fetch("/api/lesson-builder/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(getFormData()),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Lesson Builder request failed");
      }
      renderResult(data);
    } catch (error) {
      status.textContent = "生成失败，请确认本地服务已经启动。";
      output.innerHTML = `<article class="lesson-result-section"><h3>错误</h3><p>${escapeHtml(error.message)}</p></article>`;
    }
  }

  form?.addEventListener("submit", generateLesson);
  copyButton?.addEventListener("click", async () => {
    if (!lastMarkdown) return;
    await navigator.clipboard?.writeText(lastMarkdown);
    status.textContent = "课程包 Markdown 已复制。";
  });
})();
