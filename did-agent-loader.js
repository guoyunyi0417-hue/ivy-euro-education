(function () {
  const SCRIPT_ID = "ivy-did-embed";
  const EMBED_SRC = "https://agent.d-id.com/v2/index.js";

  function getConfig() {
    return window.IVY_DID_CONFIG || {};
  }

  async function getRuntimeConfig() {
    try {
      const response = await fetch("/api/runtime-config", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        return {};
      }
      const data = await response.json();
      return data?.did || {};
    } catch {
      return {};
    }
  }

  function getContainer() {
    return document.querySelector("[data-did-agent-container]");
  }

  function setPlaceholder(container, title, description, tone = "info") {
    if (!container) return;
    container.innerHTML = `
      <div class="did-agent-placeholder did-agent-placeholder-${tone}">
        <strong>${title}</strong>
        <span>${description}</span>
      </div>
    `;
  }

  function mountEmbed(container, config) {
    if (!container) return;
    if (document.getElementById(SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "module";
    script.src = EMBED_SRC;
    script.dataset.mode = "full";
    script.dataset.targetId = config.targetId || container.id || "did-agent-container";
    script.dataset.clientKey = config.clientKey;
    script.dataset.agentId = config.agentId;
    script.dataset.autoConnect = "true";
    script.dataset.openMode = "expanded";
    script.dataset.showRestartButton = "false";
    script.dataset.showAgentName = "false";
    script.dataset.track = "false";

    container.innerHTML = "";
    container.classList.add("did-agent-frame-loading");
    script.addEventListener("load", () => {
      container.classList.remove("did-agent-frame-loading");
    });
    script.addEventListener("error", () => {
      container.classList.remove("did-agent-frame-loading");
      setPlaceholder(
        container,
        "D-ID 加载失败",
        "请检查网络、client key、agent id，以及 D-ID 官方脚本是否可访问。",
        "error"
      );
    });

    document.head.appendChild(script);
  }

  function speakDemo() {
    const config = getConfig();
    const phrase = config.greetingText || "Hello! Let's practice English together.";
    const api = window.DID_AGENTS_API || window.DID_AGENTS || null;

    if (api?.functions?.speak) {
      api.functions.speak(phrase);
      return true;
    }

    if (api?.speak) {
      api.speak(phrase);
      return true;
    }

    return false;
  }

  function requestFullscreen() {
    const container = getContainer();
    if (!container) return;
    if (container.requestFullscreen) {
      container.requestFullscreen().catch(() => {});
    }
  }

  function init() {
    const container = getContainer();
    if (!container) return;

    const initialConfig = getConfig();
    const hasInitialConfig = Boolean(initialConfig.clientKey && initialConfig.agentId);

    if (!hasInitialConfig) {
      setPlaceholder(
        container,
        "连接 D-ID 互动头像",
        "准备好 client key 和 agent id 后，这里会直接载入可互动的英语老师。"
      );
    } else {
      setPlaceholder(
        container,
        "正在连接 D-ID",
        "角色载入后，这里会变成可交互的英语课堂头像。"
      );
      mountEmbed(container, initialConfig);
    }

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.matches("[data-did-speak-demo]")) {
        if (!speakDemo()) {
          setPlaceholder(
            container,
            "示范播放未连接",
            "请先接入 D-ID API，再播放示范句。",
            "warn"
          );
        }
      }

      if (target.matches("[data-did-fullscreen]")) {
        requestFullscreen();
      }
    });

    if (!hasInitialConfig) {
      getRuntimeConfig().then((runtimeConfig) => {
        if (!runtimeConfig?.clientKey || !runtimeConfig?.agentId) {
          return;
        }
        if (document.getElementById(SCRIPT_ID)) {
          return;
        }
        window.IVY_DID_CONFIG = { ...initialConfig, ...runtimeConfig };
        setPlaceholder(
          container,
          "正在连接 D-ID",
          "已从运行时配置读取到头像信息，正在载入可交互课堂。"
        );
        mountEmbed(container, window.IVY_DID_CONFIG);
      });
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
