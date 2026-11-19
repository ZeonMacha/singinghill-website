/* ==========================================================================
   磨砂背景舞台、多边形毛玻璃同步与变体 2 外框分层脚本 (js/theme.js)
   与 js/main.js 配合工作，不侵入修改原有页面渲染逻辑：
   1. 挂载 AT1 / AT2 / AT3 交叉淡入柔焦背景舞台 (.bg-stage)
   2. 将主窗口、左栏按钮、底部按钮的 SVG 多边形轮廓同步为毛玻璃层 clip-path
   3. 落地“变体 2”外框分层：
      - 中央主窗 (Z2)：外侧遮罩纯黑双层下沉影 + 精确外扩黑色护边 + 0 发光极净单线
      - 左上导线 (Z3)：底层黑色护边衬底 + 向下纯黑投影
      - 左栏/底栏按钮：待命态 (Z1) 细黑护边 + 浅接触影 + 0 发光；
                        激活态 (Z3) 粗黑护边 + 抬升下沉影 + 严格内收的微光
   4. 随当前系列自动切换 html[data-series] 与浏览器地址栏 theme-color
   ========================================================================== */
(function () {
  /* ── 1. 注入柔焦背景舞台 ── */
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

  /* ── 2. 注入主窗口多边形毛玻璃层 ── */
  const panelGlassEl = document.createElement("div");
  panelGlassEl.className = "panel-glass";
  panelGlassEl.id = "panel-glass";
  panelGlassEl.setAttribute("aria-hidden", "true");
  if (typeof panelEl !== "undefined" && panelEl) {
    panelEl.prepend(panelGlassEl);
  }

  /* ── 3. 为连接导线层注入底层防融边护边节点 ── */
  let connectorGuardEl = null;
  if (typeof connectorLayerEl !== "undefined" && connectorLayerEl) {
    connectorGuardEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    connectorGuardEl.setAttribute("id", "connector-guard");
    connectorGuardEl.setAttribute("class", "connector-guard");
    connectorGuardEl.setAttribute("d", "");
    connectorLayerEl.prepend(connectorGuardEl);
  }

  /* ── 4. SVG 多边形路径解析与精确平行外扩算法（确保护边严丝合缝且不压在半透明线框下） ── */
  function parsePathVertices(d) {
    if (!d) return [];
    const tokens = d.match(/[MHVLZ]|-?\d+(?:\.\d+)?/gi);
    if (!tokens) return [];
    const raw = [];
    let i = 0;
    let cx = 0;
    let cy = 0;
    while (i < tokens.length) {
      const cmd = tokens[i++].toUpperCase();
      if (cmd === "M" || cmd === "L") {
        cx = parseFloat(tokens[i++]);
        cy = parseFloat(tokens[i++]);
        raw.push([cx, cy]);
      } else if (cmd === "H") {
        cx = parseFloat(tokens[i++]);
        raw.push([cx, cy]);
      } else if (cmd === "V") {
        cy = parseFloat(tokens[i++]);
        raw.push([cx, cy]);
      } else if (cmd === "Z") {
        break;
      }
    }
    const dedup = [];
    for (const pt of raw) {
      if (
        !dedup.length ||
        Math.hypot(pt[0] - dedup[dedup.length - 1][0], pt[1] - dedup[dedup.length - 1][1]) > 0.05
      ) {
        dedup.push(pt);
      }
    }
    if (
      dedup.length > 1 &&
      Math.hypot(dedup[0][0] - dedup[dedup.length - 1][0], dedup[0][1] - dedup[dedup.length - 1][1]) < 0.05
    ) {
      dedup.pop();
    }
    const clean = [];
    const m = dedup.length;
    for (let k = 0; k < m; k++) {
      const prev = dedup[(k - 1 + m) % m];
      const cur = dedup[k];
      const next = dedup[(k + 1) % m];
      const vx1 = cur[0] - prev[0];
      const vy1 = cur[1] - prev[1];
      const vx2 = next[0] - cur[0];
      const vy2 = next[1] - cur[1];
      const l1 = Math.hypot(vx1, vy1);
      const l2 = Math.hypot(vx2, vy2);
      if (l1 > 0.01 && l2 > 0.01) {
        const cross = Math.abs((vx1 / l1) * (vy2 / l2) - (vy1 / l1) * (vx2 / l2));
        if (cross < 0.01) continue;
      }
      clean.push(cur);
    }
    return clean;
  }

  function offsetPolygonPath(pts, offset) {
    const n = pts.length;
    if (n < 3) return "";
    let area2 = 0;
    for (let i = 0; i < n; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % n];
      area2 += x1 * y2 - x2 * y1;
    }
    const sign = area2 >= 0 ? 1 : -1;
    const edges = [];
    for (let i = 0; i < n; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      edges.push({
        qx: p1[0] + offset * (-sign * uy),
        qy: p1[1] + offset * (sign * ux),
        ux,
        uy
      });
    }
    const out = [];
    for (let i = 0; i < n; i++) {
      const e1 = edges[(i - 1 + n) % n];
      const e2 = edges[i];
      const det = e1.ux * e2.uy - e1.uy * e2.ux;
      if (Math.abs(det) < 1e-4) {
        out.push([e2.qx, e2.qy]);
      } else {
        const dx = e2.qx - e1.qx;
        const dy = e2.qy - e1.qy;
        const t = (dx * e2.uy - dy * e2.ux) / det;
        out.push([e1.qx + t * e1.ux, e1.qy + t * e1.uy]);
      }
    }
    return out.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ") + " Z";
  }

  /* ── 5. 毛玻璃剪裁与变体 2 外框分层装饰 ── */
  function applyClipPath(el, d) {
    if (!el || !d) return;
    if (el.dataset.lastPath === d) return;
    el.dataset.lastPath = d;
    const val = `path("${d}")`;
    el.style.webkitClipPath = val;
    el.style.clipPath = val;
  }

  function syncPanelLayer() {
    if (typeof panelFillEl === "undefined" || !panelFillEl) return;
    const d = panelFillEl.getAttribute("d");
    applyClipPath(panelGlassEl, d);

    if (typeof panelBgSvgEl === "undefined" || !panelBgSvgEl || typeof panelEl === "undefined" || !panelEl) {
      return;
    }
    const w = panelEl.clientWidth;
    const h = panelEl.clientHeight;
    if (!d || w <= 0 || h <= 0) return;

    panelBgSvgEl.querySelectorAll(".theme-hud-fx").forEach((n) => n.remove());

    const pts = parsePathVertices(d);
    const outerGuardD = offsetPolygonPath(pts, -1.9);
    const pad = 180;

    panelBgSvgEl.insertAdjacentHTML(
      "beforeend",
      `<defs class="theme-hud-fx">
        <mask id="sh-panel-ext-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"
              x="${-pad}" y="${-pad}" width="${w + pad * 2}" height="${h + pad * 2}">
          <rect x="${-pad}" y="${-pad}" width="${w + pad * 2}" height="${h + pad * 2}" fill="#ffffff" />
          <path d="${d}" fill="#000000" />
        </mask>
      </defs>
      <g class="theme-hud-fx" mask="url(#sh-panel-ext-mask)">
        <path class="panel-shadow-deep" d="${d}" fill="#000" />
        <path class="panel-shadow-contact" d="${d}" fill="#000" />
        <path class="panel-guard" d="${outerGuardD}" fill="none" stroke-linejoin="miter" />
      </g>`
    );
  }

  function syncConnectorLayer() {
    if (!connectorGuardEl || typeof connectorLineEl === "undefined" || !connectorLineEl) return;
    if (typeof mobileMenuQuery !== "undefined" && mobileMenuQuery.matches) {
      connectorGuardEl.setAttribute("d", "");
      return;
    }
    const lineD = connectorLineEl.getAttribute("d") || "";
    connectorGuardEl.setAttribute("d", lineD);
  }

  function syncBoxesLayer(container, boxSelector, frameBgSelector, kind) {
    if (!container) return;
    container.querySelectorAll(boxSelector).forEach((box, idx) => {
      let glass = box.querySelector(`.${kind}-glass`);
      if (!glass) {
        glass = document.createElement("span");
        glass.className = `${kind}-glass`;
        glass.setAttribute("aria-hidden", "true");
        box.prepend(glass);
      }
      const svg = box.querySelector("svg");
      const bg = svg ? svg.querySelector(frameBgSelector) : null;
      if (!svg || !bg) return;

      const d = bg.getAttribute("d");
      applyClipPath(glass, d);

      svg.querySelectorAll(".theme-hud-fx").forEach((n) => n.remove());
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!d || w <= 0 || h <= 0) return;

      const selected = box.getAttribute("aria-selected") === "true";
      const pts = parsePathVertices(d);
      const outerGuardD = offsetPolygonPath(pts, selected ? -1.6 : -1.1);
      const uid = `${kind}-${idx}`;
      const pad = 64;

      svg.insertAdjacentHTML(
        "afterbegin",
        `<defs class="theme-hud-fx">
          <mask id="sh-box-mask-${uid}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"
                x="${-pad}" y="${-pad}" width="${w + pad * 2}" height="${h + pad * 2}">
            <rect x="${-pad}" y="${-pad}" width="${w + pad * 2}" height="${h + pad * 2}" fill="#ffffff" />
            <path d="${d}" fill="#000000" />
          </mask>
        </defs>
        <g class="theme-hud-fx" mask="url(#sh-box-mask-${uid})">
          <path class="box-shadow-deep" d="${d}" fill="#000" />
          <path class="box-shadow-contact" d="${d}" fill="#000" />
          <path class="box-guard" d="${outerGuardD}" fill="none" stroke-linejoin="miter" />
        </g>`
      );

      if (selected) {
        // 严格将微光向框内缘裁切，保持外侧黑护边与下沉黑影 100% 净黑不混糊；并置于前景条带/侧脊之下
        bg.insertAdjacentHTML(
          "afterend",
          `<defs class="theme-hud-fx">
            <clipPath id="sh-box-in-${uid}">
              <path d="${d}" />
            </clipPath>
          </defs>
          <g class="theme-hud-fx" clip-path="url(#sh-box-in-${uid})">
            <path class="box-inner-glow" d="${d}" />
          </g>`
        );
      }
    });
  }

  function syncTabLayer() {
    if (typeof indexNavEl !== "undefined" && indexNavEl) {
      syncBoxesLayer(indexNavEl, ".tab", ".tab-bg", "tab");
    }
  }

  function syncPillLayer() {
    if (typeof subnavEl !== "undefined" && subnavEl) {
      syncBoxesLayer(subnavEl, ".pill", ".pill-bg", "pill");
    }
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

  /* ── 6. 包装几何重绘与路由渲染钩子 ── */
  if (typeof window.drawPanelFrame === "function") {
    const origDrawPanel = window.drawPanelFrame;
    window.drawPanelFrame = function () {
      origDrawPanel.apply(this, arguments);
      syncPanelLayer();
    };
  }

  if (typeof window.drawTabFrames === "function") {
    const origDrawTabs = window.drawTabFrames;
    window.drawTabFrames = function () {
      origDrawTabs.apply(this, arguments);
      syncTabLayer();
    };
  }

  if (typeof window.drawPillFrames === "function") {
    const origDrawPills = window.drawPillFrames;
    window.drawPillFrames = function () {
      origDrawPills.apply(this, arguments);
      syncPillLayer();
    };
  }

  if (typeof window.drawConnector === "function") {
    const origDrawConnector = window.drawConnector;
    window.drawConnector = function () {
      origDrawConnector.apply(this, arguments);
      syncConnectorLayer();
    };
  }

  if (typeof window.renderPage === "function") {
    const origRenderPage = window.renderPage;
    window.renderPage = function () {
      syncSeriesTheme();
      origRenderPage.apply(this, arguments);
      syncSeriesTheme();
      requestAnimationFrame(() => {
        syncPanelLayer();
        syncTabLayer();
        syncPillLayer();
        syncConnectorLayer();
      });
    };
  }

  /* ── 7. 初次执行同步 ── */
  syncSeriesTheme();
  if (typeof window.drawConnector === "function") {
    window.drawConnector();
  }
  syncPanelLayer();
  syncTabLayer();
  syncPillLayer();
  syncConnectorLayer();
})();
