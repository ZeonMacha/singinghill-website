/* ==========================================================================
   磨砂背景舞台、多边形毛玻璃同步、外框分层与方形轨迹光标脚本 (js/theme.js)
   与 js/main.js 配合工作，不侵入修改原有页面渲染逻辑：
   1. 挂载 AT1 / AT2 / AT3 交叉淡入柔焦背景舞台 (.bg-stage)
   2. 将主窗口、左栏按钮、底部按钮的 SVG 多边形轮廓同步为毛玻璃层 clip-path
   3. 落地“变体 2”外框分层（黑色护边 + 双层下沉影 + 导线护边 + 选中态内收微光）
   4. 桌面端搭载 HeronAI 风格 8x8 主题色方形轨迹光标 + 16x16 交互准星外框
   5. 支持提取码点击一键复制与当前系列 theme-color 同步
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

  /* ── 4. SVG 多边形路径解析与精确平行外扩算法 ── */
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

  /* ── 6. 桌面端 HeronAI 风格 8x8 方形折线轨迹光标 ── */
  let refreshCursorColor = function () {};
  (function initCustomCursor() {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const canvas = document.createElement("canvas");
    canvas.id = "sh-canvas-cursor";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483600;";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = 1;
    let vw = 0;
    let vh = 0;
    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let cr = 199, cg = 174, cb = 244;
    let cursorIsDark = false;
    refreshCursorColor = function () {
      const hex = getComputedStyle(document.documentElement).getPropertyValue("--panel-frame").trim();
      if (hex.startsWith("#")) {
        const h = hex.length === 4 ? hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] : hex.slice(1, 7);
        cr = parseInt(h.slice(0, 2), 16) || 0;
        cg = parseInt(h.slice(2, 4), 16) || 0;
        cb = parseInt(h.slice(4, 6), 16) || 0;
      } else {
        const m = hex.match(/\d+/g);
        if (m && m.length >= 3) {
          cr = Number(m[0]);
          cg = Number(m[1]);
          cb = Number(m[2]);
        }
      }
      cursorIsDark = (0.2126 * cr + 0.7152 * cg + 0.0722 * cb) / 255 < 0.28;
    };

    function syncCursorMode() {
      const enabled = finePointer.matches;
      document.documentElement.classList.toggle("has-custom-cursor", enabled);
      if (!enabled) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, vw, vh);
      }
    }
    syncCursorMode();
    finePointer.addEventListener("change", syncCursorMode);

    let visible = false;
    let mx = -100, my = -100;
    let cx = -100, cy = -100;
    let isDown = false;
    let isInteractive = false;
    let overTextInput = false;
    let reticle = 0;
    let rafId = 0;
    const trail = [];
    const MAX_TRAIL = 14;

    function drawFrame() {
      rafId = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);

      if (!finePointer.matches || !visible || overTextInput) return;

      const noTrail = reduceMotion.matches;
      if (noTrail) {
        cx = mx;
        cy = my;
        trail.length = 0;
      } else {
        cx += (mx - cx) * 0.44;
        cy += (my - cy) * 0.44;
        const dist = Math.hypot(mx - cx, my - cy);
        trail.push({ x: cx, y: cy });
        if (trail.length > MAX_TRAIL) trail.shift();
        if (dist < 0.35 && trail.length > 1) trail.shift();

        if (trail.length > 2 && dist > 0.25) {
          ctx.lineWidth = 1;
          ctx.lineCap = "butt";
          ctx.lineJoin = "miter";
          for (let i = 1; i < trail.length; i++) {
            const p0 = trail[i - 1];
            const p1 = trail[i];
            const alpha = (i / trail.length) * 0.62;
            ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
        }
      }

      const coreSize = isDown ? 6 : 8;
      const hx = Math.round(cx - coreSize / 2);
      const hy = Math.round(cy - coreSize / 2);
      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.fillRect(hx, hy, coreSize, coreSize);
      ctx.strokeStyle = cursorIsDark ? "rgba(255, 255, 255, 0.78)" : "rgba(6, 8, 14, 0.48)";
      ctx.lineWidth = 1;
      ctx.strokeRect(hx - 0.5, hy - 0.5, coreSize + 1, coreSize + 1);

      const targetReticle = isDown || isInteractive ? 1 : 0;
      reticle = noTrail ? targetReticle : reticle + (targetReticle - reticle) * 0.32;
      if (reticle > 0.03) {
        const outerMax = isDown ? 14 : 16;
        const curOuter = 8 + (outerMax - 8) * reticle;
        const ox = Math.round(cx - curOuter / 2) + 0.5;
        const oy = Math.round(cy - curOuter / 2) + 0.5;
        const ow = Math.round(curOuter) - 1;
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${(0.88 * reticle).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(ox, oy, ow, ow);
      }

      const stillMoving =
        Math.hypot(mx - cx, my - cy) > 0.08 ||
        trail.length > 1 ||
        Math.abs(targetReticle - reticle) > 0.02;
      if (stillMoving) {
        rafId = requestAnimationFrame(drawFrame);
      }
    }

    function kick() {
      if (!rafId && finePointer.matches) {
        rafId = requestAnimationFrame(drawFrame);
      }
    }

    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch") return;
        if (!visible) {
          cx = e.clientX;
          cy = e.clientY;
          refreshCursorColor();
        }
        visible = true;
        mx = e.clientX;
        my = e.clientY;
        const t = e.target;
        overTextInput = Boolean(t && t.closest && t.closest('input[type="text"], textarea'));
        isInteractive = Boolean(
          t &&
            t.closest &&
            t.closest(
              'a, button, [role="button"], input[type="range"], input[type="color"], .dl-code, .hud-scroll-thumb, .hud-scroll-track'
            )
        );
        kick();
      },
      { passive: true }
    );

    window.addEventListener("pointerdown", () => { isDown = true; kick(); }, { passive: true });
    window.addEventListener("pointerup", () => { isDown = false; kick(); }, { passive: true });
    document.addEventListener("mouseleave", () => { visible = false; trail.length = 0; kick(); });
    document.addEventListener("input", () => { refreshCursorColor(); kick(); }, { passive: true });
  })();

  /* ── 7. 提取码一键复制委托交互 ── */
  function copyDlCode(codeEl) {
    const valEl = codeEl.querySelector(".dl-code-value");
    const code = valEl ? valEl.textContent.trim() : "";
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    codeEl.classList.add("is-copied");
    clearTimeout(codeEl._copyTimer);
    codeEl._copyTimer = setTimeout(() => {
      codeEl.classList.remove("is-copied");
    }, 1400);
  }

  document.addEventListener("click", (e) => {
    const codeEl = e.target.closest(".dl-code");
    if (codeEl) copyDlCode(codeEl);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const codeEl = e.target.closest && e.target.closest(".dl-code");
    if (codeEl) {
      e.preventDefault();
      copyDlCode(codeEl);
    }
  });

  function syncSeriesTheme() {
    const series = (typeof state !== "undefined" && state.series) ? state.series : "at1";
    document.documentElement.setAttribute("data-series", series);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const cssBase = getComputedStyle(document.documentElement).getPropertyValue("--canvas-base").trim();
      metaTheme.setAttribute("content", cssBase || "#cfd5de");
    }
    requestAnimationFrame(refreshCursorColor);
  }

  /* ── 8. 包装几何重绘与路由渲染钩子 ── */
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

  /* ── 9. 初次执行同步 ── */
  syncSeriesTheme();
  if (typeof window.drawConnector === "function") {
    window.drawConnector();
  }
  syncPanelLayer();
  syncTabLayer();
  syncPillLayer();
  syncConnectorLayer();
})();
