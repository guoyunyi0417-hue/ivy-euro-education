(function () {
  const CDN_SRC = "https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@latest/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js";

  const state = {
    running: false,
    sdkLoaded: false,
    referenceText: "",
  };

  const els = {};

  function $(selector) {
    return document.querySelector(selector);
  }

  function setStatus(message) {
    if (els.status) {
      els.status.textContent = message;
    }
  }

  function setJson(payload) {
    if (els.json) {
      els.json.textContent = JSON.stringify(payload, null, 2);
    }
  }

  function setScores(scores) {
    if (els.pronunciationScore) els.pronunciationScore.textContent = scores.pronunciation ?? "--";
    if (els.accuracyScore) els.accuracyScore.textContent = scores.accuracy ?? "--";
    if (els.fluencyScore) els.fluencyScore.textContent = scores.fluency ?? "--";
    if (els.completenessScore) els.completenessScore.textContent = scores.completeness ?? "--";
    if (els.prosodyScore) els.prosodyScore.textContent = scores.prosody ?? "--";
  }

  function normalizeText(value) {
    return (value || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, " ")
      .trim();
  }

  function wordTokens(value) {
    return normalizeText(value).split(/\s+/).filter(Boolean);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function heuristicAssess(referenceText, transcriptText) {
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

  async function loadSpeechSdk() {
    if (window.SpeechSDK) {
      state.sdkLoaded = true;
      return window.SpeechSDK;
    }

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = CDN_SRC;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    state.sdkLoaded = Boolean(window.SpeechSDK);
    return window.SpeechSDK;
  }

  async function fetchAzureToken() {
    const response = await fetch("/api/speech/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.enabled ? data : null;
  }

  async function runAzureAssessment(referenceText) {
    const SpeechSDK = await loadSpeechSdk();
    const tokenData = await fetchAzureToken();
    if (!tokenData?.token || !tokenData?.region) {
      return null;
    }

    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenData.token, tokenData.region);
    speechConfig.speechRecognitionLanguage = tokenData.language || "en-US";
    speechConfig.outputFormat = SpeechSDK.OutputFormat.Detailed;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
      referenceText,
      SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
      SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
      true
    );

    if (typeof pronunciationConfig.enableProsodyAssessment === "function") {
      pronunciationConfig.enableProsodyAssessment(true);
    } else {
      pronunciationConfig.enableProsodyAssessment = true;
    }

    pronunciationConfig.applyTo(recognizer);

    const result = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (recognitionResult) => resolve(recognitionResult),
        (error) => reject(error)
      );
    });

    recognizer.close();

    const assessment = SpeechSDK.PronunciationAssessmentResult.fromResult(result);

    return {
      pronunciation: Math.round(assessment.pronunciationScore || 0),
      accuracy: Math.round(assessment.accuracyScore || 0),
      fluency: Math.round(assessment.fluencyScore || 0),
      completeness: Math.round(assessment.completenessScore || 0),
      prosody: Math.round(assessment.prosodyScore || 0),
      transcriptText: result.text || "",
      referenceText,
      feedback: [
        `识别结果：${result.reason || "completed"}`,
        `建议重点：${assessment.pronunciationScore >= 85 ? "可以进入下一句" : "再练一次重音和连读"}`,
      ],
      nextStep: assessment.pronunciationScore >= 85 ? "继续挑战更长一句，加入问答练习。" : "再跟读一次，重点放在重音和停顿。",
      mode: "azure",
    };
  }

  async function assess(referenceText, transcriptText) {
    try {
      const azureResult = await runAzureAssessment(referenceText);
      if (azureResult) {
        return azureResult;
      }
    } catch (error) {
      console.warn("Azure pronunciation assessment unavailable, falling back locally.", error);
    }

    return heuristicAssess(referenceText, transcriptText);
  }

  function bindSampleButtons() {
    document.querySelectorAll("[data-pronunciation-sample]").forEach((button) => {
      button.addEventListener("click", () => {
        const sample = button.getAttribute("data-pronunciation-sample") || "";
        if (els.reference) {
          els.reference.value = sample;
        }
        setStatus("已切换参考句，准备开始评测。");
      });
    });
  }

  function bindControls() {
    els.start?.addEventListener("click", async () => {
      if (state.running) return;
      state.running = true;
      els.start.disabled = true;
      els.stop.disabled = false;

      const referenceText = els.reference?.value.trim() || "Can you say that again?";
      const transcriptText = els.transcript?.value.trim() || referenceText;
      state.referenceText = referenceText;

      setStatus("正在评测，请朗读参考句并等待结果...");
      setJson({ status: "running", referenceText });

      try {
        const result = await assess(referenceText, transcriptText);
        setScores(result);
        setStatus(result.mode === "azure" ? "Azure 评测完成。" : "本地评测完成。");
        if (els.feedback) {
          els.feedback.innerHTML = `
            <p><strong>重点反馈：</strong>${result.feedback.map((item) => item).join("；")}</p>
            <p><strong>下一步：</strong>${result.nextStep}</p>
          `;
        }
        setJson(result);
      } catch (error) {
        console.error(error);
        setStatus("评测失败，请再试一次。");
        setJson({ status: "error", message: error.message || String(error) });
      } finally {
        state.running = false;
        els.start.disabled = false;
        els.stop.disabled = true;
      }
    });

    els.stop?.addEventListener("click", () => {
      state.running = false;
      if (els.start) els.start.disabled = false;
      if (els.stop) els.stop.disabled = true;
      setStatus("已重置，等待开始评测。");
      setScores({});
      setJson({ status: "waiting" });
      if (els.feedback) {
        els.feedback.innerHTML = "<p>评测结果会显示在这里，告诉学生哪几个词错了、重音该落在哪里、下一步怎么再练。</p>";
      }
    });
  }

  function init() {
    els.reference = $("#pronunciation-reference");
    els.transcript = $("#pronunciation-transcript");
    els.start = document.querySelector("[data-pronunciation-start]");
    els.stop = document.querySelector("[data-pronunciation-stop]");
    els.status = document.querySelector("[data-pronunciation-status]");
    els.feedback = $("#pronunciation-feedback");
    els.json = $("#pronunciation-json");
    els.pronunciationScore = $("#pronunciation-score");
    els.accuracyScore = $("#accuracy-score");
    els.fluencyScore = $("#fluency-score");
    els.completenessScore = $("#completeness-score");
    els.prosodyScore = $("#prosody-score");

    if (!els.reference || !els.transcript || !els.start || !els.stop) {
      return;
    }

    els.stop.disabled = true;
    bindSampleButtons();
    bindControls();
    setScores({});
    setStatus("等待开始评测。");
  }

  window.addEventListener("DOMContentLoaded", init);
})();
