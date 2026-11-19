/* ==========================================================================
   磨砂背景舞台与多边形毛玻璃同步脚本 (js/theme.js)
   与 js/main.js 配合工作，不侵入修改原有页面渲染逻辑：
   1. 挂载 AT1 / AT2 / AT3 交叉淡入柔焦背景舞台 (.bg-stage)
   2. 将主窗口、左栏按钮、底部按钮的 SVG 多边形轮廓同步为毛玻璃层 clip-path
   3. 随当前系列自动切换 html[data-series] 与浏览器地址栏 theme-color
   ========================================================================== */
(function () {
  /* 1. 注入柔焦背景舞台 */
  const bgStage = document.createElement("div");
  bgStage.className = "bg-stage";
  bgStage.setAttribute("aria-hidden", "true");
  bgStage.innerHTML = `
    <div class="bg-neutral"></div>
    <div class="bg-slide" data-bg="at1"></div>
    <div class="bg-slide" data-bg="at2"></div>
    <div class="bg-slide" data-bg="at3"></div>
    <div class="bg-veil"></div>
    <div class="bg-grain"></div>
  `;
  document.body.prepend(bgStage);

  /* 2. 注入主窗口多边形毛玻璃层 */
  const panelGlassEl = document.createElement("div");
  panelGlassEl.className = "panel-glass";
  panelGlassEl.id = "panel-glass";
  panelGlassEl.setAttribute("aria-hidden", "true");
  if (typeof panelEl !== "undefined" && panelEl) {
    panelEl.prepend(panelGlassEl);
  }

  function applyClipPath(el, d) {
    if (!el || !d) return;
    if (el.dataset.lastPath === d) return;
    el.dataset.lastPath = d;
    const val = `path("${d}")`;
    el.style.webkitClipPath = val;
    el.style.clipPath = val;
  }

  function syncPanelGlass() {
    if (!panelFillEl) return;
    applyClipPath(panelGlassEl, panelFillEl.getAttribute("d"));
  }

  function syncTabGlass() {
    if (!indexNavEl) return;
    indexNavEl.querySelectorAll(".tab").forEach((tab) => {
      let glass = tab.querySelector(".tab-glass");
      if (!glass) {
        glass = document.createElement("span");
        glass.className = "tab-glass";
        glass.setAttribute("aria-hidden", "true");
        tab.prepend(glass);
      }
      const bg = tab.querySelector(".tab-bg");
      if (bg) applyClipPath(glass, bg.getAttribute("d"));
    });
  }

  function syncPillGlass() {
    if (!subnavEl) return;
    subnavEl.querySelectorAll(".pill").forEach((pill) => {
      let glass = pill.querySelector(".pill-glass");
      if (!glass) {
        glass = document.createElement("span");
        glass.className = "pill-glass";
        glass.setAttribute("aria-hidden", "true");
        pill.prepend(glass);
      }
      const bg = pill.querySelector(".pill-bg");
      if (bg) applyClipPath(glass, bg.getAttribute("d"));
    });
  }

  function syncSeriesTheme() {
    const series = (typeof state !== "undefined" && state.series) ? state.series : "at1";
    document.documentElement.setAttribute("data-series", series);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const cssBase = getComputedStyle(document.documentElement).getPropertyValue("--canvas-base").trim();
      metaTheme.setAttribute("content", cssBase || "#cfd5de");
    }
  }

  /* 3. 包装几何重绘与路由渲染钩子 */
  if (typeof window.drawPanelFrame === "function") {
    const origDrawPanel = window.drawPanelFrame;
    window.drawPanelFrame = function () {
      origDrawPanel.apply(this, arguments);
      syncPanelGlass();
    };
  }

  if (typeof window.drawTabFrames === "function") {
    const origDrawTabs = window.drawTabFrames;
    window.drawTabFrames = function () {
      origDrawTabs.apply(this, arguments);
      syncTabGlass();
    };
  }

  if (typeof window.drawPillFrames === "function") {
    const origDrawPills = window.drawPillFrames;
    window.drawPillFrames = function () {
      origDrawPills.apply(this, arguments);
      syncPillGlass();
    };
  }

  if (typeof window.renderPage === "function") {
    const origRenderPage = window.renderPage;
    window.renderPage = function () {
      syncSeriesTheme();
      origRenderPage.apply(this, arguments);
      syncSeriesTheme();
      requestAnimationFrame(() => {
        syncPanelGlass();
        syncTabGlass();
        syncPillGlass();
      });
    };
  }

  /* 初次执行同步 */
  syncSeriesTheme();
  if (typeof window.drawConnector === "function") {
    window.drawConnector();
  }
  syncPanelGlass();
  syncTabGlass();
  syncPillGlass();
})();
