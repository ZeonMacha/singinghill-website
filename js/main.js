/*
  页面渲染与交互程序。通常不需要修改这个文件。

  修改文案：
  - 作品名、副标题、底部按钮、外部链接：js/content.js
  - AT1 / AT2 正文、下载信息、人员名单：js/at1.js
  - 页脚：js/content.js 中各作品的 footer

  本文件只负责把上述内容显示到页面上。
*/

const state = { series: "at1", page: "home" };

const indexNavEl = document.getElementById("index-nav");
const subnavEl = document.getElementById("subnav");
const pageEl = document.getElementById("page");
const panelBodyEl = document.getElementById("panel-body");
const barTitleEl = document.getElementById("bar-title");
const footerEl = document.getElementById("site-footer-text");
const menuEl = document.getElementById("series-menu");
const menuToggleEl = document.getElementById("menu-toggle");
const mobileMenuQuery = window.matchMedia("(max-width: 820px)");
const connectorLayerEl = document.getElementById("connector-layer");
const connectorLineEl = document.getElementById("connector-line");
const connectorAuxEl = document.getElementById("connector-aux");
const connectorCapsEl = document.getElementById("connector-caps");
const panelEl = document.querySelector(".panel");
const panelBgSvgEl = document.getElementById("panel-bg-svg");
const panelFgSvgEl = document.getElementById("panel-fg-svg");
const panelFillEl = document.getElementById("panel-fill");
const panelOutlineEl = document.getElementById("panel-outline");
const panelArmorEl = document.getElementById("panel-armor");
const panelAccentsEl = document.getElementById("panel-accents");
const hudScrollbarEl = document.getElementById("hud-scrollbar");
const hudScrollTrackEl = document.getElementById("hud-scroll-track");
const hudScrollThumbEl = document.getElementById("hud-scroll-thumb");

function drawTabFrames() {
  const isMobile = mobileMenuQuery.matches;
  indexNavEl.querySelectorAll(".tab").forEach((tab) => {
    const svg = tab.querySelector(".tab-frame");
    if (!svg) return;
    const w = tab.clientWidth;
    const h = tab.clientHeight;
    if (w <= 0 || h <= 0) return;

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const n1 = Math.round(w * 0.28);
    const n2 = Math.round(w * 0.75);
    const selected = tab.getAttribute("aria-selected") === "true";
    const midY = h / 2;

    const bgPath = [
      `M 0.8 0.8`,
      `H ${w - 16}`,
      `L ${w - 0.8} 16`,
      `V ${h - 8}`,
      `L ${w - 8} ${h - 0.8}`,
      `H ${n2}`,
      `L ${n2 - 6} ${h - 4.5}`,
      `H ${n1 + 6}`,
      `L ${n1} ${h - 0.8}`,
      `H 0.8`,
      "Z"
    ].join(" ");

    const foot = !isMobile && selected
      ? `<path class="tab-foot" d="M ${w - 0.8} ${midY - 8.5} L ${w + 3.5} ${midY - 5} V ${midY + 5} L ${w - 0.8} ${midY + 8.5} Z" />`
      : "";

    svg.innerHTML = `
      <path class="tab-bg" d="${bgPath}" />
      <rect class="tab-spine" x="0.8" y="0.8" width="6.5" height="${h - 1.6}" />
      <line class="tab-notch-line" x1="${n1 + 6}" y1="${h - 0.8}" x2="${n2 - 6}" y2="${h - 0.8}" />
      ${foot}`;
  });
}

function drawPillFrames() {
  subnavEl.querySelectorAll(".pill").forEach((pill) => {
    const svg = pill.querySelector(".pill-frame");
    if (!svg) return;
    const w = pill.clientWidth;
    const h = pill.clientHeight;
    if (w <= 0 || h <= 0) return;

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const compactPill = w < 170;
    const stepLen = compactPill ? 32 : 48;
    const outerD = [
      `M 10 1`,
      `H ${w - stepLen}`,
      `L ${w - stepLen + 6.5} 6.2`,
      `H ${w - 1}`,
      `V ${h - 10.5}`,
      `L ${w - 10.5} ${h - 1}`,
      `H 1`,
      `V 10`,
      "Z"
    ].join(" ");

    const innerD = [
      `M 12 4.8`,
      `H ${w - stepLen - 2}`,
      `L ${w - stepLen + 4.5} 10`,
      `H ${w - 4.8}`,
      `V ${h - 12.5}`,
      `L ${w - 12.5} ${h - 4.8}`,
      `H 4.8`,
      `V 12`,
      "Z"
    ].join(" ");

    svg.innerHTML = `
      <path class="pill-bg" d="${outerD}" />
      <path class="pill-inner" d="${innerD}" />`;
  });
}

function drawPanelFrame() {
  const w = panelEl.clientWidth;
  const h = panelEl.clientHeight;
  if (w <= 0 || h <= 0) return;

  const isMobile = mobileMenuQuery.matches;
  const compact = w < 620;
  const top = isMobile ? 8 : 14;
  const headerBottom = isMobile ? 41 : 36;
  const stepRun = isMobile ? 22 : 19;
  const leftChamfer = isMobile ? 16 : 22;
  const rightChamfer = isMobile ? 15 : 17;
  const platStart = isMobile ? 24 : 42;
  const platEnd = isMobile
    ? Math.min(w - 76, Math.max(platStart + 150, Math.round(w * 0.67)))
    : Math.min(w - 280, Math.max(platStart + 215, Math.round(w * 0.35)));
  const stepEndX = platEnd + stepRun;

  panelEl.style.setProperty(
    "--panel-title-width",
    `${Math.max(110, platEnd - platStart - (isMobile ? 12 : 20))}px`
  );
  panelBgSvgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);
  panelFgSvgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);

  const notchL = Math.round(w * (compact ? 0.27 : 0.34));
  const notchR = Math.round(w * (compact ? 0.71 : 0.66));

  // 主体一体化轮廓：桌面端浅台阶坡度；手机端顶边上提并在右上留出菜单按钮嵌入槽。
  const outlineD = [
    `M ${platStart} ${top}`,
    `H ${platEnd}`,
    `L ${stepEndX} ${headerBottom}`,
    `H ${w - 8 - rightChamfer}`,
    `L ${w - 8} ${headerBottom + rightChamfer}`,
    `V ${h - 8}`,
    `H ${notchR}`,
    `L ${notchR - 7} ${h - 14.5}`,
    `H ${notchL + 7}`,
    `L ${notchL} ${h - 8}`,
    `H 8`,
    `V ${top + leftChamfer}`,
    `L ${8 + leftChamfer} ${top}`,
    "Z"
  ].join(" ");

  panelFillEl.setAttribute("d", outlineD);
  panelOutlineEl.setAttribute("d", outlineD);

  // 1) 桌面端右上加长实心阶梯装甲条；手机端该槽位嵌入菜单按钮，保持单线干净承托
  const armorStartX = Math.max(stepEndX + 48, Math.round(w * 0.62));
  const topRightArmor = (!isMobile && w - 28 - armorStartX >= 40)
    ? `<path d="M ${armorStartX} ${headerBottom + 0.6} L ${armorStartX + 6} ${headerBottom - 5.5} H ${w - 27.5} L ${w - 8} ${headerBottom + 13} V ${headerBottom + 18} L ${w - 25} ${headerBottom} Z" />`
    : "";

  // 2) 左侧竖边实心梯形护板 + 右下角放大的实心大三角
  const sideTop = Math.max(isMobile ? 84 : 90, Math.round(h * 0.21));
  const sideH = Math.min(104, Math.max(64, Math.round(h * 0.20)));
  const sideBot = Math.min(h - 92, sideTop + sideH);
  const showSideArmor = sideBot - sideTop >= 48;
  const sideArmor = showSideArmor
    ? `<path d="M 8 ${sideTop} L ${isMobile ? 14 : 15.5} ${sideTop + 7} V ${sideBot - 7} L 8 ${sideBot} Z" />`
    : "";

  const tri = compact ? 36 : 50;
  const cornerTriangle = `<path d="M ${w - 8} ${h - 8 - tri} L ${w - 8 - tri} ${h - 8} H ${w - 8} Z" />`;

  panelArmorEl.innerHTML = [
    topRightArmor,
    sideArmor,
    cornerTriangle
  ].join("");

  // 3) 左下 L 直角标
  panelAccentsEl.innerHTML = `<path class="frame-corner-line" d="M 19 ${h - 68} V ${h - 19} H 76" />`;
}

function updateHudScrollbar() {
  if (!hudScrollbarEl || !panelBodyEl) return;
  const scrollH = panelBodyEl.scrollHeight;
  const clientH = panelBodyEl.clientHeight;
  if (scrollH <= clientH + 2) {
    hudScrollbarEl.classList.add("is-hidden");
    return;
  }
  hudScrollbarEl.classList.remove("is-hidden");
  const trackH = hudScrollTrackEl.clientHeight;
  if (trackH <= 0) return;
  const thumbH = Math.max(36, Math.round((clientH / scrollH) * trackH));
  const maxTop = Math.max(0, trackH - thumbH);
  const maxScroll = Math.max(1, scrollH - clientH);
  const ratio = Math.min(1, Math.max(0, panelBodyEl.scrollTop / maxScroll));
  const thumbTop = Math.round(ratio * maxTop * 2) / 2;
  hudScrollThumbEl.style.height = `${thumbH}px`;
  hudScrollThumbEl.style.transform = `translateY(${thumbTop}px)`;
}

function drawConnector() {
  drawPanelFrame();
  drawTabFrames();
  drawPillFrames();
  updateHudScrollbar();
  if (mobileMenuQuery.matches) return;
  const activeTab = indexNavEl.querySelector('[aria-selected="true"]');
  if (!activeTab) return;
  const container = document.querySelector(".console").getBoundingClientRect();
  const start = activeTab.getBoundingClientRect();
  const panelRect = panelEl.getBoundingClientRect();

  const railRight = start.right - container.left;
  const panelLeft = panelRect.left - container.left + 8;
  // 竖直干线严格位于左栏右缘与主窗口左边框正中间
  const busX = Math.round((railRight + panelLeft) / 2);

  const x1 = railRight + 3;
  const y1 = Math.round((start.top + start.height / 2 - container.top) * 2) / 2;

  // 右端从顶部拱桥以 -45° 垂直锚入主窗口左上 45° 斜切边 (8,36)-(30,14) 中点 (19,25)
  const endX = panelRect.left - container.left + 19;
  const endY = panelRect.top - container.top + 25;
  const peakY = Math.max(4, panelRect.top - container.top + 5);
  const drop = endY - peakY;
  const bridgeRightX = endX - drop;
  const cut = 10;

  let route;
  let auxD = "";
  let leftHorizAvail;

  if (y1 - peakY < cut * 2 + 20 && bridgeRightX - x1 - (y1 - peakY) >= 12) {
    // 顶部首项（图一）：水平引出 -> 45° 斜升上拱 -> 顶部短平桥 -> -45° 垂直落入主框斜切边
    const climb = Math.max(8, y1 - peakY);
    const avail = Math.max(16, bridgeRightX - x1 - climb);
    const bridgeLen = Math.min(18, Math.max(10, Math.round(avail * 0.34)));
    const bridgeLeftX = bridgeRightX - bridgeLen;
    const climbStartX = Math.max(x1 + 8, bridgeLeftX - climb);
    leftHorizAvail = climbStartX - x1;

    route = [
      `M ${x1} ${y1}`,
      `H ${climbStartX}`,
      `L ${bridgeLeftX} ${peakY}`,
      `H ${bridgeRightX}`,
      `L ${endX} ${endY}`
    ];

    auxD = [
      leftHorizAvail > 12
        ? `M ${x1 + 3} ${y1 - 4.5} H ${climbStartX - 1.9} L ${climbStartX + 4.5} ${y1 - 10.9}`
        : "",
      `M ${bridgeLeftX - 5} ${peakY + 11.4} L ${bridgeLeftX + 1.9} ${peakY + 4.5} H ${bridgeRightX - 1.9} L ${bridgeRightX + 5} ${peakY + 11.4}`
    ].join(" ");
  } else {
    // 其余各项（图二）：水平引出 -> 45° 折入居中竖干线 -> 升至顶部 -> 45° 折入平桥 -> -45° 垂直落入主框斜切边
    const topTurnRightX = Math.min(bridgeRightX - 8, busX + cut);
    const actualBusX = topTurnRightX - cut;
    leftHorizAvail = actualBusX - cut - x1;

    route = [
      `M ${x1} ${y1}`,
      `H ${actualBusX - cut}`,
      `L ${actualBusX} ${y1 - cut}`,
      `V ${peakY + cut}`,
      `L ${topTurnRightX} ${peakY}`,
      `H ${bridgeRightX}`,
      `L ${endX} ${endY}`
    ];

    const vSpan = Math.min(20, Math.max(8, (y1 - peakY - cut * 2) * 0.25));
    auxD = [
      leftHorizAvail > 10
        ? `M ${x1 + 3} ${y1 - 4.5} H ${actualBusX - cut - 1.9} L ${actualBusX - 4.5} ${y1 - cut - 1.9} V ${y1 - cut - 1.9 - vSpan}`
        : "",
      `M ${actualBusX + 4.5} ${peakY + cut + 14} V ${peakY + cut + 1.9} L ${topTurnRightX + 1.9} ${peakY + 4.5} H ${bridgeRightX - 1.9} L ${bridgeRightX + 5} ${peakY + 11.4}`
    ].join(" ");
  }

  // 左端水平加粗护套 + 右端沿 -45° 垂直嵌入主框斜切边的斜向加粗护套
  const lenL = Math.min(14, Math.max(7, leftHorizAvail * 0.52));
  const leftCap = `M ${x1 - 1} ${y1 - 2.2} H ${x1 + lenL - 2.2} L ${x1 + lenL} ${y1 - 0.85} V ${y1 + 0.85} L ${x1 + lenL - 2.2} ${y1 + 2.2} H ${x1 - 1} Z`;

  const k = Math.SQRT1_2;
  const pt = (s, wOff) => `${(endX - k * s + k * wOff).toFixed(2)} ${(endY - k * s - k * wOff).toFixed(2)}`;
  const d1 = 9.5;
  const d2 = 12;
  const hw = 2.2;
  const lw = 0.85;
  const rightCap = `M ${pt(0, hw)} L ${pt(d1, hw)} L ${pt(d2, lw)} L ${pt(d2, -lw)} L ${pt(d1, -hw)} L ${pt(0, -hw)} Z`;

  connectorLayerEl.setAttribute("viewBox", `0 0 ${container.width} ${container.height}`);
  connectorLineEl.setAttribute("d", route.join(" "));
  connectorAuxEl.setAttribute("d", auxD.trim());
  connectorCapsEl.setAttribute("d", `${leftCap} ${rightCap}`);
}

function setMenuOpen(open) {
  menuEl.classList.toggle("is-open", open);
  menuToggleEl.setAttribute("aria-expanded", String(open));
  menuToggleEl.setAttribute("aria-label", open ? "收起作品导航" : "展开作品导航");
  indexNavEl.querySelectorAll("a, button").forEach((item) => {
    if (mobileMenuQuery.matches && !open) item.setAttribute("tabindex", "-1");
    else if (item.matches("a")) item.removeAttribute("tabindex");
    else item.setAttribute("tabindex", item.getAttribute("aria-selected") === "true" ? "0" : "-1");
  });
  if (open) requestAnimationFrame(drawTabFrames);
}

function seriesById(id) {
  return SITE.series.find((s) => s.id === id) || SITE.series[0];
}

function pageById(id) {
  return SUBPAGES.find((p) => p.id === id) || SUBPAGES[0];
}

/* ── 各系列的内容 ─────────────────────────── */

/* 页面头：只留标题（位置信息由窗口标题栏与底部子标签承担，不再重复） */
function viewHead(title, sub) {
  return `<header class="view-head">
      <h1 class="view-title">${title}</h1>
      ${sub ? `<p class="view-sub">${sub}</p>` : ""}
    </header>`;
}

function homeContent(s) {
  if (s.id === "at1") return at1Home();
  if (s.id === "at2") return at2Home();
  if (s.id === "web") return webContent();
  if (s.id === "wiki") return wikiContent();

  return `${viewHead(s.name)}
    <p class="lead">${s.intro}</p>
    <p class="empty-note">${SITE_TEXT.homeEmpty}</p>`;
}

function downloadContent(s) {
  if (s.id === "at1") return at1Download();
  if (s.id === "at2") return at2Download();
  return `${viewHead(s.name)}
    <p class="empty-note">${SITE_TEXT.downloadEmpty}</p>`;
}

function staffContent(s) {
  if (s.id === "at1") return at1Staff();
  if (s.id === "at2") return at2Staff();
  return `${viewHead(s.name)}
    <p class="empty-note">${SITE_TEXT.staffEmpty}</p>`;
}

function webContent() {
  return `${viewHead(SITE_TEXT.webTitle, SITE_TEXT.webSubtitle)}
    <ul class="link-list">
      ${WEB_LINKS.map(([name, url]) => `
        <li><a class="link-card" href="${url}" target="_blank" rel="noopener noreferrer">
          <span class="lc-en">${name}</span>
          <span class="lc-url">${url.replace(/^https:\/\//, "")}</span>
        </a></li>`).join("")}
    </ul>`;
}

function wikiContent() {
  return `${viewHead("Ar tonelico Wiki", "社区维护的英文百科")}
    <p class="lead">涵盖系列设定、角色与音乐资料，是英文资料的主要来源。</p>
    <p><a class="big-link" href="https://artonelico.wiki.gg/" target="_blank" rel="noopener noreferrer">前往 Ar tonelico Wiki <span>wiki.gg</span></a></p>`;
}

/* ── 渲染 ─────────────────────────────────── */

function renderIndex() {
  indexNavEl.setAttribute("role", "tablist");
  indexNavEl.setAttribute("aria-orientation", "vertical");
  indexNavEl.removeAttribute("role");
  indexNavEl.innerHTML = SITE.series.map((s) => {
    const active = s.id === state.series;
    if (s.id === "wiki") {
      return `<a class="tab tab-link" href="${s.url}" target="_blank" rel="noopener noreferrer">
        <svg class="tab-frame" aria-hidden="true"></svg>
        <span class="tab-en">${s.name}</span>
        <span class="tab-sub">${s.sub}</span>
      </a>`;
    }
    return `<button type="button" role="tab" class="tab" data-series="${s.id}"
      aria-selected="${active}" tabindex="${active ? 0 : -1}">
      <svg class="tab-frame" aria-hidden="true"></svg>
      <span class="tab-en">${s.name}</span>
      <span class="tab-sub">${s.sub}</span>
    </button>`;
  }).join("");
  setMenuOpen(menuEl.classList.contains("is-open"));
}

function renderSubnav() {
  subnavEl.setAttribute("role", "tablist");
  subnavEl.innerHTML = SUBPAGES.map((p) => {
    const active = p.id === state.page;
    return `<button type="button" role="tab" class="pill" data-page="${p.id}"
      aria-selected="${active}" tabindex="${active ? 0 : -1}">
      <svg class="pill-frame" aria-hidden="true"></svg>
      <span class="pill-label"><span class="pill-en">${p.en}</span><span class="pill-zh">${p.zh}</span></span>
      <span class="pill-desc">${p.desc}</span>
    </button>`;
  }).join("");
}

function renderChrome() {
  const s = seriesById(state.series);
  const p = pageById(state.page);

  document.title = `${p.en} · ${s.name} — ${SITE_TEXT.name}`;
  barTitleEl.textContent = `${s.name} / ${p.en}`;
  footerEl.textContent = s.footer || DEFAULT_FOOTER;
}

function renderPage({ keepScroll = false } = {}) {
  const s = seriesById(state.series);
  const page = pageById(state.page);

  renderIndex();
  renderSubnav();
  renderChrome();

  const views = { home: homeContent, download: downloadContent, staff: staffContent };
  pageEl.innerHTML = views[page.id](s);

  /* 重新触发淡入 */
  pageEl.style.animation = "none";
  void pageEl.offsetWidth;
  pageEl.style.animation = "";

  if (!keepScroll) panelBodyEl.scrollTop = 0;
  requestAnimationFrame(drawConnector);
}

/* ── 交互 ─────────────────────────────────── */

function selectSeries(id, { focusTab = false, keepScroll = false } = {}) {
  if (!SITE.series.some((s) => s.id === id)) return;
  state.series = id;
  state.page = "home";
  location.hash = `${state.series}/${state.page}`;
  renderPage({ keepScroll });
  if (focusTab) indexNavEl.querySelector(`[data-series="${id}"]`)?.focus();
}

function selectPage(id, { focusTab = false } = {}) {
  if (!SUBPAGES.some((p) => p.id === id)) return;
  state.page = id;
  location.hash = `${state.series}/${state.page}`;
  renderPage();
  if (focusTab) subnavEl.querySelector(`[data-page="${id}"]`)?.focus();
}

/* 方向键在标签组内移动（WAI-ARIA tablist 习惯） */
function wireKeys(container, selector, attr, onSelect) {
  container.addEventListener("keydown", (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    const buttons = [...container.querySelectorAll(selector)];
    const current = buttons.indexOf(event.target.closest(selector));
    if (current < 0) return;

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      onSelect(buttons[event.key === "Home" ? 0 : buttons.length - 1].dataset[attr]);
    } else if (step) {
      event.preventDefault();
      const next = (current + step + buttons.length) % buttons.length;
      onSelect(buttons[next].dataset[attr]);
    }
  });
}

menuToggleEl.addEventListener("click", (event) => {
  event.stopPropagation();
  setMenuOpen(!menuEl.classList.contains("is-open"));
});

mobileMenuQuery.addEventListener("change", () => {
  setMenuOpen(false);
  requestAnimationFrame(drawConnector);
});

panelBodyEl.addEventListener("scroll", updateHudScrollbar, { passive: true });

if (hudScrollThumbEl && hudScrollTrackEl) {
  let dragStartY = 0;
  let dragStartScroll = 0;

  hudScrollThumbEl.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragStartY = event.clientY;
    dragStartScroll = panelBodyEl.scrollTop;
    hudScrollbarEl.classList.add("is-dragging");
    hudScrollThumbEl.setPointerCapture(event.pointerId);
  });

  hudScrollThumbEl.addEventListener("pointermove", (event) => {
    if (!hudScrollbarEl.classList.contains("is-dragging")) return;
    const trackH = hudScrollTrackEl.clientHeight;
    const thumbH = hudScrollThumbEl.offsetHeight;
    const maxTop = Math.max(1, trackH - thumbH);
    const maxScroll = Math.max(0, panelBodyEl.scrollHeight - panelBodyEl.clientHeight);
    const deltaY = event.clientY - dragStartY;
    panelBodyEl.scrollTop = dragStartScroll + (deltaY / maxTop) * maxScroll;
  });

  const endDrag = (event) => {
    if (!hudScrollbarEl.classList.contains("is-dragging")) return;
    hudScrollbarEl.classList.remove("is-dragging");
    if (hudScrollThumbEl.hasPointerCapture(event.pointerId)) {
      hudScrollThumbEl.releasePointerCapture(event.pointerId);
    }
  };
  hudScrollThumbEl.addEventListener("pointerup", endDrag);
  hudScrollThumbEl.addEventListener("pointercancel", endDrag);

  hudScrollTrackEl.addEventListener("pointerdown", (event) => {
    if (event.target === hudScrollThumbEl) return;
    const rect = hudScrollTrackEl.getBoundingClientRect();
    const thumbH = hudScrollThumbEl.offsetHeight;
    const maxTop = Math.max(1, rect.height - thumbH);
    const targetTop = Math.min(maxTop, Math.max(0, event.clientY - rect.top - thumbH / 2));
    const maxScroll = Math.max(0, panelBodyEl.scrollHeight - panelBodyEl.clientHeight);
    panelBodyEl.scrollTop = (targetTop / maxTop) * maxScroll;
  });
}

window.addEventListener("resize", drawConnector);
if (window.ResizeObserver) {
  const geometryObserver = new ResizeObserver(() => requestAnimationFrame(drawConnector));
  geometryObserver.observe(panelEl);
  geometryObserver.observe(pageEl);
  geometryObserver.observe(indexNavEl);
  geometryObserver.observe(subnavEl);
}
if (document.fonts) document.fonts.ready.then(drawConnector);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuEl.classList.contains("is-open")) {
    setMenuOpen(false);
    menuToggleEl.focus();
  }
});

document.addEventListener("click", (event) => {
  if (mobileMenuQuery.matches && menuEl.classList.contains("is-open") && !menuEl.contains(event.target)) {
    setMenuOpen(false);
  }
});

indexNavEl.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-series]");
  if (mobileMenuQuery.matches) setMenuOpen(false);
  if (!tab || tab.dataset.series === state.series) return;
  selectSeries(tab.dataset.series);
});
wireKeys(indexNavEl, "[data-series]", "series", (id) => selectSeries(id, { focusTab: true }));

subnavEl.addEventListener("click", (event) => {
  const pill = event.target.closest("[data-page]");
  if (!pill || pill.dataset.page === state.page) return;
  selectPage(pill.dataset.page);
});
wireKeys(subnavEl, "[data-page]", "page", (id) => selectPage(id, { focusTab: true }));

function readRoute() {
  const [selected, view] = location.hash.slice(1).split("/");
  if (selected && SITE.series.some((s) => s.id === selected)) state.series = selected;
  if (SUBPAGES.some((p) => p.id === view)) state.page = view;
}

window.addEventListener("hashchange", () => {
  const before = `${state.series}/${state.page}`;
  const previousSeries = state.series;
  readRoute();
  if (state.series !== previousSeries) state.page = "home";
  if (`${state.series}/${state.page}` !== before) renderPage();
});

readRoute();
renderPage();
