(function () {
  const ENDPOINT = "/api/liveavatar/embed";

  function getConfig() {
    return window.IVY_HEYGEN_CONFIG || {};
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
      return data?.heygen || {};
    } catch {
      return {};
    }
  }

  function getContainer() {
    return document.querySelector("[data-heygen-avatar-container]");
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

  function mountEmbed(container, payload) {
    if (!container) return;
    const embedData = payload?.data || payload || {};
    const embedUrl = embedData.url || embedData.embedUrl || "";
    const embedScript = embedData.script || "";

    container.innerHTML = "";
    container.classList.add("did-agent-frame-loading");

    if (embedScript) {
      container.innerHTML = embedScript;
      container.classList.remove("did-agent-frame-loading");
      return;
    }

    if (embedUrl) {
      const iframe = document.createElement("iframe");
      iframe.src = embedUrl;
      iframe.title = "LiveAvatar Embed";
      iframe.allow = "microphone; autoplay; fullscreen";
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("loading", "lazy");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.minHeight = "540px";
      iframe.style.border = "0";
      container.appendChild(iframe);
      container.classList.remove("did-agent-frame-loading");
      return;
    }

    setPlaceholder(
      container,
      "LiveAvatar 返回为空",
      "请检查 avatar id、context id、API key 和 sandbox 设置。",
      "warn"
    );
    container.classList.remove("did-agent-frame-loading");
  }

  async function loadEmbed(config) {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        avatarId: config.avatarId || "",
        contextId: config.contextId || "",
        embedUrl: config.embedUrl || "",
        isSandbox: config.isSandbox !== false,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error || data?.message || `HeyGen embed request failed with ${response.status}`);
    }
    return data;
  }

  function focusContainer(container) {
    if (!container) return;
    container.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function requestFullscreen() {
    const container = getContainer();
    if (!container) return;
    if (container.requestFullscreen) {
      container.requestFullscreen().catch(() => {});
    }
  }

  async function init() {
    const container = getContainer();
    if (!container) return;

    const initialConfig = getConfig();
    const runtimeConfig = await getRuntimeConfig();
    const mergedConfig = {
      ...runtimeConfig,
      ...initialConfig,
      avatarId: initialConfig.avatarId || runtimeConfig.avatarId || "",
      contextId: initialConfig.contextId || runtimeConfig.contextId || "",
      embedUrl: initialConfig.embedUrl || runtimeConfig.embedUrl || "",
      targetId: initialConfig.targetId || runtimeConfig.targetId || container.id || "heygen-avatar-container",
      isSandbox: initialConfig.isSandbox ?? runtimeConfig.isSandbox ?? true,
      greetingText: initialConfig.greetingText || runtimeConfig.greetingText || "Hello! Let's practice English together.",
    };

    const hasEmbedConfig = Boolean(mergedConfig.embedUrl || mergedConfig.avatarId);

    if (!hasEmbedConfig) {
      setPlaceholder(
        container,
        "连接 HeyGen LiveAvatar",
        "准备好 API key、avatar id 和 context id 后，这里会直接载入可互动的英语老师。"
      );
    } else {
      setPlaceholder(
        container,
        "正在连接 HeyGen LiveAvatar",
        "头像载入后，这里会变成可交互的英语课堂角色。"
      );
      try {
        const payload = await loadEmbed(mergedConfig);
        mountEmbed(container, payload);
      } catch (error) {
        console.error(error);
        setPlaceholder(
          container,
          "HeyGen 加载失败",
          "请检查 API key、avatar id、context id，以及 LiveAvatar 的可用状态。",
          "error"
        );
      }
    }

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.matches("[data-heygen-start-demo]")) {
        focusContainer(container);
      }

      if (target.matches("[data-heygen-fullscreen]")) {
        requestFullscreen();
      }
    });
  }

  window.addEventListener("DOMContentLoaded", init);
})();
