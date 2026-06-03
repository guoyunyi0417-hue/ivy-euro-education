function createKnowledgeTutor(config) {
  const fallbackKnowledgeBase = config.fallbackKnowledgeBase;
  const selectors = config.selectors;
  const cardAttr = config.cardAttr || "data-tutor-card";
  const remoteApiEnabled = config.remoteApiEnabled !== false;
  const apiEndpoint = config.apiEndpoint || "/api/tutor/ask";

  const state = {
    knowledgeBase: fallbackKnowledgeBase,
    activeModeId: config.defaultModeId || fallbackKnowledgeBase.modes?.[0]?.id || "dialogue",
    isLoading: false,
    lastQuestion: "",
  };

  const questionField = document.querySelector(selectors.questionField);
  const answerBox = document.querySelector(selectors.answerBox);
  const sourceRow = document.querySelector(selectors.sourceRow);
  const kbList = document.querySelector(selectors.kbList);
  const askButton = document.querySelector(selectors.askButton);
  const resetButton = document.querySelector(selectors.resetButton);
  const activeModeName = document.querySelector(selectors.activeModeName);
  const activeModeHint = document.querySelector(selectors.activeModeHint);
  const tutorModeButtons = document.querySelectorAll(selectors.modeButtons);
  const functionCards = document.querySelectorAll(selectors.functionCards);

  function normalizeText(value) {
    return (value || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, " ");
  }

  function getMode(modeId) {
    return (
      state.knowledgeBase.modes?.find((mode) => mode.id === modeId) ||
      fallbackKnowledgeBase.modes.find((mode) => mode.id === modeId) ||
      fallbackKnowledgeBase.modes[0]
    );
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

    config.sourceScoring?.forEach(({ pattern, sourceId, bonus }) => {
      if (new RegExp(pattern).test(normalized) && source.id === sourceId) {
        score += bonus;
      }
    });

    return score;
  }

  function getTopSources(question, mode) {
    const scored = state.knowledgeBase.sources
      .map((source) => ({ source, score: scoreSource(question, source, mode) }))
      .sort((a, b) => b.score - a.score);

    const top = scored.filter(({ score }) => score > 0).slice(0, 3).map(({ source }) => source);
    return top.length ? top : state.knowledgeBase.sources.slice(0, 3);
  }

  function buildLocalReply(question, sources, mode) {
    const normalized = normalizeText(question);
    const sourceNames = sources.map((source) => source.name).join("、");
    const modeLabel = mode?.label || "对话";
    const modeTitle = mode?.title || modeLabel;

    let focus = config.defaultFocus;
    let nextStep = config.defaultNextStep;
    let example = config.defaultExample;
    let extra = config.defaultExtra;
    let modeLabelLine = `当前功能：${modeLabel}`;

    const overrides = config.modeOverrides || {};
    const modeOverride = overrides[mode?.id];
    if (modeOverride) {
      focus = modeOverride.focus || focus;
      nextStep = modeOverride.nextStep || nextStep;
      example = modeOverride.example || example;
      extra = modeOverride.extra || extra;
      modeLabelLine = modeOverride.modeLabelLine || modeLabelLine;
    } else {
      config.fallbackMatchers?.forEach(({ pattern, targetModeId, focus: matchFocus, nextStep: matchNextStep, example: matchExample, extra: matchExtra, modeLabelLine: matchLabel }) => {
        if (new RegExp(pattern).test(normalized) && mode?.id === targetModeId) {
          focus = matchFocus || focus;
          nextStep = matchNextStep || nextStep;
          example = matchExample || example;
          extra = matchExtra || extra;
          modeLabelLine = matchLabel || modeLabelLine;
        }
      });
    }

    return {
      title: `${config.tutorName}已调用：${sourceNames}`,
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

  function normalizeRemoteReply(payload, fallbackReply) {
    if (!payload) return null;

    const reply = payload.reply || payload.result || payload.data || payload;
    const body = Array.isArray(reply.body)
      ? reply.body
      : typeof reply.body === "string"
        ? reply.body.split(/\n+/).map((line) => line.trim()).filter(Boolean)
        : typeof reply.text === "string"
          ? reply.text.split(/\n+/).map((line) => line.trim()).filter(Boolean)
          : fallbackReply.body;

    const sources = Array.isArray(reply.sources) && reply.sources.length
      ? reply.sources
      : fallbackReply.sources;

    return {
      title: reply.title || fallbackReply.title,
      body: body.length ? body : fallbackReply.body,
      sources,
    };
  }

  function renderReply(reply, mode) {
    if (answerBox) {
      answerBox.innerHTML = `
        <strong>${reply.title}</strong>
        ${reply.body.map((line) => `<p>${line}</p>`).join("")}
      `;
    }

    if (sourceRow) {
      sourceRow.innerHTML = (reply.sources || [])
        .map((source) => `<span class="tutor-source-chip">${source.name || source.id}</span>`)
        .join("");
    }

    if (activeModeName) {
      activeModeName.textContent = `当前功能：${mode.label}`;
    }

    if (activeModeHint) {
      activeModeHint.textContent = mode.promptHint;
    }

    tutorModeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute(config.modeAttr) === mode.id);
    });

    functionCards.forEach((card) => {
      card.classList.toggle("is-active", card.getAttribute(cardAttr) === mode.id);
    });

    if (questionField && mode.sampleQuestions?.length && !questionField.value.trim()) {
      questionField.placeholder = mode.sampleQuestions[0];
    }
  }

  function renderLoading(message) {
    if (!answerBox) return;
    answerBox.innerHTML = `<strong>${config.tutorName}</strong><p>${message}</p>`;
    answerBox.classList.add("is-loading");
  }

  function clearLoading() {
    answerBox?.classList.remove("is-loading");
  }

  function renderKnowledgeBase() {
    if (!kbList) {
      return;
    }

    kbList.innerHTML = state.knowledgeBase.sources
      .map((source) => {
        const keywordList = (source.keywords || [])
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

  function wireSampleButtons() {
    document.querySelectorAll(config.sampleSelector).forEach((button) => {
      button.addEventListener("click", () => {
        const query = button.getAttribute(config.sampleAttr) || "";
        if (questionField) {
          questionField.value = query;
        }
        renderAnswer(query);
      });
    });
  }

  function wireModeButtons() {
    document.querySelectorAll(config.modeButtons).forEach((button) => {
      button.addEventListener("click", () => {
        const modeId = button.getAttribute(config.modeAttr);
        if (!modeId) {
          return;
        }

        state.activeModeId = modeId;
        const mode = getMode(modeId);
        const suggestion = mode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions?.[0] || "";

        if (questionField && !questionField.value.trim()) {
          questionField.value = suggestion;
        }

        renderAnswer(questionField?.value.trim() || suggestion);
      });
    });
  }

  function buildApiPayload(question, mode) {
    const sources = getTopSources(question, mode);
    return {
      tutorName: config.tutorName,
      question,
      mode: {
        id: mode.id,
        label: mode.label,
        title: mode.title,
        promptHint: mode.promptHint,
        outputStyle: mode.outputStyle,
      },
      knowledgeBase: state.knowledgeBase,
      topSources: sources,
      defaults: {
        focus: config.defaultFocus,
        nextStep: config.defaultNextStep,
        example: config.defaultExample,
        extra: config.defaultExtra,
      },
    };
  }

  async function fetchRemoteReply(question, mode) {
    if (!remoteApiEnabled || !apiEndpoint) {
      return null;
    }

    const fallbackReply = buildLocalReply(question, getTopSources(question, mode), mode);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildApiPayload(question, mode)),
      });

      if (!response.ok) {
        throw new Error(`API request failed with ${response.status}`);
      }

      const data = await response.json();
      return normalizeRemoteReply(data, fallbackReply);
    } catch (error) {
      console.warn(`Using local tutor reply for ${config.tutorName}.`, error);
      return null;
    }
  }

  async function renderAnswer(question) {
    const mode = getMode(state.activeModeId);
    const cleanedQuestion = question?.trim() || mode.sampleQuestions?.[0] || state.knowledgeBase.demoQuestions?.[0] || config.defaultQuestion;

    state.lastQuestion = cleanedQuestion;
    renderLoading("正在检索知识库并生成回答...");

    const localReply = buildLocalReply(cleanedQuestion, getTopSources(cleanedQuestion, mode), mode);
    const remoteReply = await fetchRemoteReply(cleanedQuestion, mode);

    clearLoading();
    renderReply(remoteReply || localReply, mode);
  }

  async function loadKnowledgeBase() {
    if (config.knowledgeBaseUrl) {
      try {
        const response = await fetch(config.knowledgeBaseUrl, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load knowledge base: ${response.status}`);
        }

        const data = await response.json();
        if (data?.sources?.length) {
          state.knowledgeBase = data;
        }
      } catch (error) {
        console.warn(`Using fallback knowledge base for ${config.tutorName}.`, error);
      }
    }

    renderKnowledgeBase();
    wireSampleButtons();
    wireModeButtons();

    const defaultMode = getMode(state.activeModeId);
    const initialQuestion =
      questionField?.value?.trim() ||
      defaultMode.sampleQuestions?.[0] ||
      state.knowledgeBase.demoQuestions?.[0] ||
      config.defaultQuestion;

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

    await renderAnswer(initialQuestion);
  }

  askButton?.addEventListener("click", () => {
    const mode = getMode(state.activeModeId);
    const question =
      questionField?.value.trim() ||
      mode.sampleQuestions?.[0] ||
      state.knowledgeBase.demoQuestions?.[0] ||
      config.defaultQuestion;
    renderAnswer(question);
  });

  resetButton?.addEventListener("click", () => {
    const mode = getMode(state.activeModeId);
    const pool = mode.sampleQuestions?.length ? mode.sampleQuestions : state.knowledgeBase.demoQuestions;
    const question = pool[Math.floor(Math.random() * pool.length)];

    if (questionField) {
      questionField.value = question;
    }

    renderAnswer(question);
  });

  loadKnowledgeBase();
}

window.IvyTutorBoot = createKnowledgeTutor;
