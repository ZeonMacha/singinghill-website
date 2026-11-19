/* ==========================================================================
   内置实时区域调色板 (js/tuner.js)
   支持按作品（AT1 / AT2 / AT3 / 默认页）独立调节所有区域的底色、线框色、字色、
   透明度与磨砂模糊度，自动保存到浏览器本地存储，并支持一键复制参数或导出 CSS。
   ========================================================================== */
(function () {
  const STORAGE_KEY = "singinghill_color_tuner_v1";

  const DEFAULT_PROFILES = {
    at1: {
      canvasBase: "#1b2438",
      bgBlur: 8,
      bgSaturate: 120,
      bgOpacity: 0.90,
      veilCenterColor: "#c4bee8",
      veilCenterAlpha: 0.16,
      veilEdgeColor: "#0c0f20",
      veilEdgeAlpha: 0.36,
      grainAlpha: 0.036,

      panelBgColor: "#eff0f7",
      panelBgAlpha: 0.82,
      panelBlur: 22,
      panelFrameColor: "#362956",
      accentColor: "#46366c",
      connectorColor: "#3b2d5e",
      scrollThumbColor: "#362956",
      surface2Color: "#e2e0ef",
      surface2Alpha: 0.72,
      lineColor: "#8e82ad",
      lineAlpha: 0.58,

      inkTitle: "#191428",
      inkBody: "#282238",
      inkMute: "#62587a",
      footerInk: "#d8d4ec",

      navBgColor: "#0e0e17",
      navBgAlpha: 0.81,
      navBlur: 16,
      navStrokeColor: "#b2a8d8",
      navStrokeAlpha: 0.28,
      navInkColor: "#e8ecf2",
      navSubInkColor: "#c6ceda",

      navSelColor1: "#46366c",
      navSelColor2: "#312550",
      navSelAlpha: 0.96,
      navSelStrokeColor: "#bdb0ea",
      navSelSpineColor: "#e3dcff",
      navSelInkColor: "#ffffff",
      navSelSubInkColor: "#dcd6f2"
    },

    at2: {
      canvasBase: "#122830",
      bgBlur: 8,
      bgSaturate: 120,
      bgOpacity: 0.90,
      veilCenterColor: "#b6e2f0",
      veilCenterAlpha: 0.16,
      veilEdgeColor: "#081822",
      veilEdgeAlpha: 0.36,
      grainAlpha: 0.036,

      panelBgColor: "#edf4f7",
      panelBgAlpha: 0.82,
      panelBlur: 22,
      panelFrameColor: "#113d52",
      accentColor: "#18516c",
      connectorColor: "#14465e",
      scrollThumbColor: "#113d52",
      surface2Color: "#dcebf1",
      surface2Alpha: 0.72,
      lineColor: "#739db2",
      lineAlpha: 0.58,

      inkTitle: "#0d1f29",
      inkBody: "#1b2f3a",
      inkMute: "#4e6d7d",
      footerInk: "#d4ebf2",

      navBgColor: "#0b1116",
      navBgAlpha: 0.81,
      navBlur: 16,
      navStrokeColor: "#8ec6de",
      navStrokeAlpha: 0.28,
      navInkColor: "#e8ecf2",
      navSubInkColor: "#c6ceda",

      navSelColor1: "#18506c",
      navSelColor2: "#0e3346",
      navSelAlpha: 0.96,
      navSelStrokeColor: "#82d0ee",
      navSelSpineColor: "#d8f4ff",
      navSelInkColor: "#ffffff",
      navSelSubInkColor: "#cfe9f4"
    },

    at3: {
      canvasBase: "#331c2b",
      bgBlur: 8,
      bgSaturate: 120,
      bgOpacity: 0.90,
      veilCenterColor: "#eed2e0",
      veilCenterAlpha: 0.14,
      veilEdgeColor: "#260e1d",
      veilEdgeAlpha: 0.38,
      grainAlpha: 0.036,

      panelBgColor: "#f5eff3",
      panelBgAlpha: 0.83,
      panelBlur: 22,
      panelFrameColor: "#451c36",
      accentColor: "#552b46",
      connectorColor: "#451c36",
      scrollThumbColor: "#451c36",
      surface2Color: "#ece0e8",
      surface2Alpha: 0.72,
      lineColor: "#9f7990",
      lineAlpha: 0.58,

      inkTitle: "#24101c",
      inkBody: "#361d2c",
      inkMute: "#755066",
      footerInk: "#f0dce7",

      navBgColor: "#130d11",
      navBgAlpha: 0.81,
      navBlur: 16,
      navStrokeColor: "#d6aac2",
      navStrokeAlpha: 0.28,
      navInkColor: "#e8ecf2",
      navSubInkColor: "#c6ceda",

      navSelColor1: "#552b46",
      navSelColor2: "#451c36",
      navSelAlpha: 0.96,
      navSelStrokeColor: "#e2aec8",
      navSelSpineColor: "#fae0ed",
      navSelInkColor: "#ffffff",
      navSelSubInkColor: "#edd4e1"
    },

    default: {
      canvasBase: "#cfd5de",
      bgBlur: 8,
      bgSaturate: 120,
      bgOpacity: 0.90,
      veilCenterColor: "#ecf0f6",
      veilCenterAlpha: 0.20,
      veilEdgeColor: "#141820",
      veilEdgeAlpha: 0.26,
      grainAlpha: 0.036,

      panelBgColor: "#f3f5f9",
      panelBgAlpha: 0.83,
      panelBlur: 22,
      panelFrameColor: "#232730",
      accentColor: "#323844",
      connectorColor: "#232730",
      scrollThumbColor: "#232730",
      surface2Color: "#e8ecf2",
      surface2Alpha: 0.72,
      lineColor: "#949ca9",
      lineAlpha: 0.60,

      inkTitle: "#15181d",
      inkBody: "#292d34",
      inkMute: "#666e7b",
      footerInk: "#242932",

      navBgColor: "#0f1115",
      navBgAlpha: 0.80,
      navBlur: 16,
      navStrokeColor: "#ffffff",
      navStrokeAlpha: 0.24,
      navInkColor: "#e8ecf2",
      navSubInkColor: "#c6ceda",

      navSelColor1: "#2c313c",
      navSelColor2: "#1a1e26",
      navSelAlpha: 0.96,
      navSelStrokeColor: "#dfe5ee",
      navSelSpineColor: "#ffffff",
      navSelInkColor: "#ffffff",
      navSelSubInkColor: "#dfe6f0"
    }
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeHex(str, fallback) {
    if (typeof str !== "string") return fallback || "#000000";
    let s = str.trim();
    if (!s.startsWith("#")) s = "#" + s;
    if (/^#[0-9a-fA-F]{3}$/.test(s)) {
      s = "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
    }
    return /^#[0-9a-fA-F]{6}$/.test(s) ? s.toLowerCase() : (fallback || "#000000");
  }

  function hexToRgb(hex) {
    const h = normalizeHex(hex, "#000000").slice(1);
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16)
    ];
  }

  function rgbToHex(r, g, b) {
    const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
    return "#" + [clamp(r), clamp(g), clamp(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }

  function mixHex(h1, h2, t) {
    const [r1, g1, b1] = hexToRgb(h1);
    const [r2, g2, b2] = hexToRgb(h2);
    return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
  }

  function shiftHex(hex, delta) {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r + delta, g + delta, b + delta);
  }

  function rgba(hex, alpha) {
    const [r, g, b] = hexToRgb(hex);
    const a = Math.max(0, Math.min(1, Number(alpha)));
    return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
  }

  function luminance(hex) {
    const [r, g, b] = hexToRgb(hex).map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function loadProfiles() {
    const base = clone(DEFAULT_PROFILES);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      ["at1", "at2", "at3", "default"].forEach((k) => {
        if (parsed && parsed[k]) {
          Object.assign(base[k], parsed[k]);
        }
      });
    } catch (_) {}
    return base;
  }

  let profiles = loadProfiles();

  function saveProfiles() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (_) {}
  }

  function activeProfileKey() {
    const s = (typeof state !== "undefined" && state.series) ? state.series : "at1";
    return (s === "at1" || s === "at2" || s === "at3") ? s : "default";
  }

  /* 编译单个作品配置为 CSS 自定义属性块 */
  function buildCssVars(p) {
    const overscan = -Math.max(20, Math.round(p.bgBlur * 2.4));
    const inkSoft = mixHex(p.inkBody, p.inkMute, 0.48);
    const navHoverBg = shiftHex(p.navBgColor, 14);
    const navActiveBg = shiftHex(p.navBgColor, 26);
    const selHover1 = shiftHex(p.navSelColor1, 14);
    const selHover2 = shiftHex(p.navSelColor2, 12);
    const scrollHover = luminance(p.scrollThumbColor) > 0.35
      ? shiftHex(p.scrollThumbColor, -24)
      : shiftHex(p.scrollThumbColor, 24);
    const accentLight = luminance(p.accentColor) > 0.38;
    const btnInk = accentLight ? "#11151d" : "#ffffff";
    const btnSubInk = accentLight ? "rgba(17, 21, 29, 0.75)" : "rgba(255, 255, 255, 0.80)";
    const btnOutline = accentLight ? "rgba(17, 21, 29, 0.28)" : "rgba(255, 255, 255, 0.34)";
    const footerLight = luminance(p.footerInk) > 0.35;
    const footerShadow = footerLight
      ? "0 1px 6px rgba(6, 10, 20, 0.90)"
      : "0 1px 4px rgba(255, 255, 255, 0.84)";

    return `
  --canvas-base: ${p.canvasBase};
  --bg-overscan: ${overscan}px;
  --bg-filter: blur(${p.bgBlur}px) saturate(${p.bgSaturate}%);
  --bg-art-opacity: ${p.bgOpacity};
  --bg-veil-paint: radial-gradient(circle at 50% 36%, ${rgba(p.veilCenterColor, p.veilCenterAlpha)} 0%, ${rgba(p.veilEdgeColor, p.veilEdgeAlpha)} 100%);
  --bg-grain-opacity: ${p.grainAlpha};

  --panel-glass-bg: ${rgba(p.panelBgColor, p.panelBgAlpha)};
  --panel-backdrop: blur(${p.panelBlur}px) saturate(150%);
  --surface: ${rgba(p.panelBgColor, Math.min(1, p.panelBgAlpha + 0.06))};
  --surface-2: ${rgba(p.surface2Color, p.surface2Alpha)};
  --surface-3: ${rgba(p.surface2Color, Math.min(1, p.surface2Alpha + 0.07))};

  --panel-frame: ${p.panelFrameColor};
  --bar: ${p.accentColor};
  --bar-2: ${p.accentColor};
  --bar-3: ${shiftHex(p.accentColor, 22)};
  --conn-main: ${p.connectorColor};
  --conn-aux: ${rgba(p.connectorColor, 0.68)};
  --scroll-thumb: ${p.scrollThumbColor};
  --scroll-thumb-hover: ${scrollHover};

  --line-strong: ${rgba(p.lineColor, Math.min(1, p.lineAlpha + 0.22))};
  --line: ${rgba(p.lineColor, Math.min(1, p.lineAlpha + 0.08))};
  --line-soft: ${rgba(p.lineColor, p.lineAlpha)};
  --line-hair: ${rgba(p.lineColor, Math.max(0.05, p.lineAlpha - 0.14))};

  --ink: ${p.inkTitle};
  --ink-body: ${p.inkBody};
  --ink-soft: ${inkSoft};
  --ink-mute: ${p.inkMute};
  --btn-ink: ${btnInk};
  --btn-sub-ink: ${btnSubInk};
  --btn-outline: ${btnOutline};
  --footer-ink: ${p.footerInk};
  --footer-shadow: ${footerShadow};

  --tab-backdrop: blur(${p.navBlur}px) saturate(145%);
  --pill-backdrop: blur(${p.navBlur}px) saturate(145%);
  --tab-glass-bg: ${rgba(p.navBgColor, p.navBgAlpha)};
  --tab-glass-hover-bg: ${rgba(navHoverBg, Math.min(1, p.navBgAlpha + 0.06))};
  --tab-glass-active-bg: ${rgba(navActiveBg, Math.min(1, p.navBgAlpha + 0.10))};
  --pill-glass-bg: ${rgba(p.navBgColor, p.navBgAlpha)};
  --pill-glass-hover-bg: ${rgba(navHoverBg, Math.min(1, p.navBgAlpha + 0.06))};
  --pill-glass-active-bg: ${rgba(navActiveBg, Math.min(1, p.navBgAlpha + 0.10))};
  --mobile-drawer-bg: ${rgba(p.navBgColor, Math.min(0.96, p.navBgAlpha + 0.12))};

  --tab-stroke: ${rgba(p.navStrokeColor, p.navStrokeAlpha)};
  --tab-hover-stroke: ${rgba(p.navStrokeColor, Math.min(1, p.navStrokeAlpha + 0.30))};
  --tab-spine: ${rgba(p.navStrokeColor, Math.min(1, p.navStrokeAlpha + 0.24))};
  --pill-stroke: ${rgba(p.navStrokeColor, p.navStrokeAlpha)};
  --pill-hover-stroke: ${rgba(p.navStrokeColor, Math.min(1, p.navStrokeAlpha + 0.30))};

  --tab-ink: ${p.navInkColor};
  --tab-sub-ink: ${rgba(p.navSubInkColor, 0.84)};
  --tab-sub-hover-ink: ${p.navInkColor};
  --pill-zh-ink: ${p.navInkColor};
  --pill-en-ink: ${rgba(p.navSubInkColor, 0.80)};
  --pill-desc-ink: ${rgba(p.navSubInkColor, 0.74)};

  --tab-sel-bg: linear-gradient(135deg, ${rgba(p.navSelColor1, p.navSelAlpha)}, ${rgba(p.navSelColor2, Math.min(1, p.navSelAlpha + 0.02))});
  --tab-sel-hover-bg: linear-gradient(135deg, ${rgba(selHover1, Math.min(1, p.navSelAlpha + 0.02))}, ${rgba(selHover2, Math.min(1, p.navSelAlpha + 0.03))});
  --pill-sel-bg: linear-gradient(135deg, ${rgba(p.navSelColor1, p.navSelAlpha)}, ${rgba(p.navSelColor2, Math.min(1, p.navSelAlpha + 0.02))});
  --pill-sel-hover-bg: linear-gradient(135deg, ${rgba(selHover1, Math.min(1, p.navSelAlpha + 0.02))}, ${rgba(selHover2, Math.min(1, p.navSelAlpha + 0.03))});

  --tab-sel-stroke: ${p.navSelStrokeColor};
  --tab-sel-hover-stroke: ${shiftHex(p.navSelStrokeColor, 20)};
  --pill-sel-stroke: ${p.navSelStrokeColor};
  --pill-sel-hover-stroke: ${shiftHex(p.navSelStrokeColor, 20)};
  --tab-sel-spine: ${p.navSelSpineColor};

  --tab-sel-ink: ${p.navSelInkColor};
  --tab-sel-sub-ink: ${p.navSelSubInkColor};
  --pill-sel-zh-ink: ${p.navSelInkColor};
  --pill-sel-en-ink: ${p.navSelSubInkColor};
  --pill-sel-desc-ink: ${rgba(p.navSelSubInkColor, 0.88)};`;
  }

  function compileFullCss() {
    return [
      `/* 由内置调色板实时生成 */`,
      `:root {${buildCssVars(profiles.default)}\n}`,
      `html[data-series="at1"] {${buildCssVars(profiles.at1)}\n}`,
      `html[data-series="at2"] {${buildCssVars(profiles.at2)}\n}`,
      `html[data-series="at3"] {${buildCssVars(profiles.at3)}\n}`
    ].join("\n\n");
  }

  /* 生成可直接覆盖 css/theme.css 的完整独立样式表 */
  function compileStandaloneThemeCss() {
    const baseExtra = `
  --tab-strip: rgba(255, 255, 255, 0.08);
  --tab-hover-strip: rgba(255, 255, 255, 0.14);
  --tab-sel-strip: rgba(255, 255, 255, 0.18);
  --tab-hover-spine: rgba(255, 255, 255, 0.78);
  --tab-notch: rgba(255, 255, 255, 0.18);
  --tab-sel-notch: rgba(255, 255, 255, 0.36);
  --sel-text-shadow: 0 1px 2px rgba(6, 8, 14, 0.48);
  --pill-inner-stroke: rgba(255, 255, 255, 0.10);
  --pill-sel-inner-stroke: rgba(255, 255, 255, 0.26);
  --pill-divider: rgba(255, 255, 255, 0.15);
  --pill-sel-divider: rgba(255, 255, 255, 0.30);
  --scroll-cap-side: rgba(108, 118, 132, 0.82);
  --scroll-grip: rgba(255, 255, 255, 0.74);
  --scroll-grip-hover: #ffffff;`;

    const structuralCss = `
/* ── 1. 背景舞台 ── */
html, body { background: var(--canvas-base); }
body { background: transparent !important; position: relative; }
.bg-stage { position: fixed; inset: 0; z-index: -2; overflow: hidden; pointer-events: none; background: var(--canvas-base); transition: background 420ms var(--ease); }
.bg-slide { position: absolute; inset: var(--bg-overscan); background-position: center 40%; background-size: cover; background-repeat: no-repeat; filter: var(--bg-filter); opacity: 0; transform: translateZ(0); will-change: opacity; transition: opacity 460ms var(--ease); }
.bg-slide[data-bg="at1"] { background-image: url("../images/at1.jpg"); }
.bg-slide[data-bg="at2"] { background-image: url("../images/at2.jpg"); }
.bg-slide[data-bg="at3"] { background-image: url("../images/at3.jpg"); }
html[data-series="at1"] .bg-slide[data-bg="at1"],
html[data-series="at2"] .bg-slide[data-bg="at2"],
html[data-series="at3"] .bg-slide[data-bg="at3"] { opacity: var(--bg-art-opacity); }
.bg-neutral { position: absolute; inset: 0; background: radial-gradient(circle at 52% 36%, rgba(255, 255, 255, 0.65), transparent 62%), linear-gradient(155deg, #e2e6ec 0%, #cbd2dc 100%); opacity: 1; transition: opacity 460ms var(--ease); }
html[data-series="at1"] .bg-neutral,
html[data-series="at2"] .bg-neutral,
html[data-series="at3"] .bg-neutral { opacity: 0; }
.bg-veil { position: absolute; inset: 0; background: var(--bg-veil-paint); transition: background 420ms var(--ease); }
.bg-grain { position: absolute; inset: 0; opacity: var(--bg-grain-opacity); mix-blend-mode: overlay; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 140px 140px; }

/* ── 2. 多边形切角毛玻璃层 ── */
.panel, .tab, .pill { isolation: auto; }
.panel { z-index: 2; }
.tab, .pill { z-index: 1; }
.panel-glass, .tab-glass, .pill-glass { position: absolute; inset: 0; z-index: 0; pointer-events: none; transition: background var(--fast) var(--ease), backdrop-filter var(--fast) var(--ease), -webkit-backdrop-filter var(--fast) var(--ease); }
.panel-glass { background: var(--panel-glass-bg); -webkit-backdrop-filter: var(--panel-backdrop); backdrop-filter: var(--panel-backdrop); }
#panel-fill { fill: transparent !important; }
.tab-glass { background: var(--tab-glass-bg); -webkit-backdrop-filter: var(--tab-backdrop); backdrop-filter: var(--tab-backdrop); }
.tab:hover .tab-glass { background: var(--tab-glass-hover-bg); }
.tab:active .tab-glass { background: var(--tab-glass-active-bg); }
.tab[aria-selected="true"] .tab-glass { background: var(--tab-sel-bg); }
.tab[aria-selected="true"]:hover .tab-glass { background: var(--tab-sel-hover-bg); }
.pill-glass { background: var(--pill-glass-bg); -webkit-backdrop-filter: var(--pill-backdrop); backdrop-filter: var(--pill-backdrop); }
.pill:hover .pill-glass { background: var(--pill-glass-hover-bg); }
.pill:active .pill-glass { background: var(--pill-glass-active-bg); }
.pill[aria-selected="true"] .pill-glass { background: var(--pill-sel-bg); }
.pill[aria-selected="true"]:hover .pill-glass { background: var(--pill-sel-hover-bg); }

/* ── 3. HUD 组件色彩变量绑定 ── */
.connector-layer { filter: drop-shadow(0 0 1.2px rgba(255, 255, 255, 0.45)) drop-shadow(0 1px 2px rgba(8, 10, 18, 0.32)); }
#connector-aux { stroke: var(--conn-aux); transition: stroke 260ms var(--ease); }
#connector-line { stroke: var(--conn-main); transition: stroke 260ms var(--ease); }
#connector-caps { fill: var(--conn-main); transition: fill 260ms var(--ease); }
.tab-frame .tab-bg { fill: transparent; stroke: var(--tab-stroke); }
.tab:hover .tab-frame .tab-bg { fill: transparent; stroke: var(--tab-hover-stroke); }
.tab:active .tab-frame .tab-bg { fill: transparent; }
.tab[aria-selected="true"] .tab-frame .tab-bg { fill: transparent; stroke: var(--tab-sel-stroke); }
.tab[aria-selected="true"]:hover .tab-frame .tab-bg { fill: transparent; stroke: var(--tab-sel-hover-stroke); }
.tab-frame .tab-strip { fill: var(--tab-strip); }
.tab:hover .tab-frame .tab-strip { fill: var(--tab-hover-strip); }
.tab[aria-selected="true"] .tab-frame .tab-strip { fill: var(--tab-sel-strip); }
.tab-frame .tab-spine { fill: var(--tab-spine); }
.tab:hover .tab-frame .tab-spine { fill: var(--tab-hover-spine); }
.tab[aria-selected="true"] .tab-frame .tab-spine { fill: var(--tab-sel-spine); }
.tab-frame .tab-notch-line { stroke: var(--tab-notch); }
.tab[aria-selected="true"] .tab-frame .tab-notch-line { stroke: var(--tab-sel-notch); }
.tab-frame .tab-foot { fill: var(--conn-main); }
.tab-en { color: var(--tab-ink); text-shadow: 0 1px 2px rgba(4, 6, 12, 0.42); }
.tab-sub, .tab-sub rt { color: var(--tab-sub-ink); text-shadow: 0 1px 2px rgba(4, 6, 12, 0.36); }
.tab:hover .tab-sub, .tab:hover .tab-sub rt { color: var(--tab-sub-hover-ink); }
.tab[aria-selected="true"] .tab-en { color: var(--tab-sel-ink); text-shadow: var(--sel-text-shadow); }
.tab[aria-selected="true"] .tab-sub, .tab[aria-selected="true"] .tab-sub rt { color: var(--tab-sel-sub-ink); text-shadow: var(--sel-text-shadow); }
#panel-outline { stroke: var(--panel-frame, var(--bar)); transition: stroke 260ms var(--ease); }
#panel-armor { fill: var(--panel-frame, var(--bar)); transition: fill 260ms var(--ease); }
#panel-accents .frame-corner-line { stroke: var(--panel-frame, var(--bar)); transition: stroke 260ms var(--ease); }
.panel-tab { color: var(--ink); }
.panel-tab::before { background: var(--panel-frame, var(--bar)); transition: background 260ms var(--ease); }
.hud-scrollbar::before, .hud-scrollbar::after { border-left-color: var(--scroll-cap-side); border-right-color: var(--scroll-cap-side); }
.hud-scrollbar::before { border-top-color: var(--panel-frame, var(--bar)); }
.hud-scrollbar::after { border-bottom-color: var(--panel-frame, var(--bar)); }
.hud-scroll-thumb { background: var(--scroll-thumb); }
.hud-scroll-thumb:hover, .hud-scrollbar.is-dragging .hud-scroll-thumb { background: var(--scroll-thumb-hover); }
.hud-scroll-thumb::before { background: linear-gradient(180deg, var(--scroll-grip) 0 1px, transparent 1px 3px, var(--scroll-grip) 3px 4px, transparent 4px 6px, var(--scroll-grip) 6px 7px); }
.hud-scroll-thumb:hover::before, .hud-scrollbar.is-dragging .hud-scroll-thumb::before { background: linear-gradient(180deg, var(--scroll-grip-hover) 0 1px, transparent 1px 3px, var(--scroll-grip-hover) 3px 4px, transparent 4px 6px, var(--scroll-grip-hover) 6px 7px); }
.pill-frame .pill-bg { fill: transparent; stroke: var(--pill-stroke); }
.pill:hover .pill-frame .pill-bg { fill: transparent; stroke: var(--pill-hover-stroke); }
.pill:active .pill-frame .pill-bg { fill: transparent; }
.pill[aria-selected="true"] .pill-frame .pill-bg { fill: transparent; stroke: var(--pill-sel-stroke); }
.pill[aria-selected="true"]:hover .pill-frame .pill-bg { fill: transparent; stroke: var(--pill-sel-hover-stroke); }
.pill-frame .pill-inner { stroke: var(--pill-inner-stroke); }
.pill[aria-selected="true"] .pill-frame .pill-inner { stroke: var(--pill-sel-inner-stroke); }
.pill-label { border-bottom-color: var(--pill-divider); }
.pill[aria-selected="true"] .pill-label { border-bottom-color: var(--pill-sel-divider); }
.pill-en { color: var(--pill-en-ink); text-shadow: 0 1px 2px rgba(4, 6, 12, 0.36); }
.pill-zh { color: var(--pill-zh-ink); text-shadow: 0 1px 2px rgba(4, 6, 12, 0.42); }
.pill-desc { color: var(--pill-desc-ink); text-shadow: 0 1px 2px rgba(4, 6, 12, 0.36); }
.pill[aria-selected="true"] .pill-en { color: var(--pill-sel-en-ink); text-shadow: var(--sel-text-shadow); }
.pill[aria-selected="true"] .pill-zh { color: var(--pill-sel-zh-ink); text-shadow: var(--sel-text-shadow); }
.pill[aria-selected="true"] .pill-desc { color: var(--pill-sel-desc-ink); text-shadow: var(--sel-text-shadow); }
.big-link { color: var(--btn-ink, #ffffff); outline-color: var(--btn-outline, rgba(255, 255, 255, 0.34)); }
.big-link span { color: var(--btn-sub-ink, rgba(255, 255, 255, 0.80)); }
.notice { border-color: var(--line); border-left-color: var(--bar); }
.empty-note { border-color: var(--line-strong); background: var(--surface-2); color: var(--ink-mute); }
.footer-placeholder { color: var(--footer-ink); text-shadow: var(--footer-shadow); }
@media (max-width: 820px) {
  .menu-toggle { background: var(--bar); color: #ffffff; }
  .menu-toggle:hover { background: var(--bar-2); }
  .tabs { border-color: var(--bar); background: var(--mobile-drawer-bg); -webkit-backdrop-filter: blur(20px) saturate(150%); backdrop-filter: blur(20px) saturate(150%); }
}`;

    return [
      `/* 歌颂之丘 — 磨砂背景与三作主题色样式表 (由内置调色板导出，可直接覆盖 css/theme.css) */`,
      `:root {${buildCssVars(profiles.default)}${baseExtra}\n}`,
      structuralCss.trim(),
      `html[data-series="at1"] {${buildCssVars(profiles.at1)}\n}`,
      `html[data-series="at2"] {${buildCssVars(profiles.at2)}\n}`,
      `html[data-series="at3"] {${buildCssVars(profiles.at3)}\n}`,
      ""
    ].join("\n\n");
  }

  const liveStyleEl = document.createElement("style");
  liveStyleEl.id = "sh-tuner-live-css";
  document.head.appendChild(liveStyleEl);

  function applyLiveStyles() {
    liveStyleEl.textContent = compileFullCss();
  }

  /* ── UI 字段定义 ── */
  const GROUPS = [
    {
      id: "bg",
      title: "1. 背景与磨砂柔焦",
      open: true,
      fields: [
        { type: "color", key: "canvasBase", label: "画布垫底色" },
        { type: "range", key: "bgBlur", label: "背景图柔焦半径", min: 0, max: 32, step: 1, unit: "px" },
        { type: "range", key: "bgSaturate", label: "背景图饱和度", min: 60, max: 180, step: 2, unit: "%" },
        { type: "range", key: "bgOpacity", label: "背景图不透明度", min: 0.20, max: 1.00, step: 0.02, unit: "" },
        { type: "colorAlpha", colorKey: "veilCenterColor", alphaKey: "veilCenterAlpha", label: "雾纱中心色 / 浓度", maxA: 0.85 },
        { type: "colorAlpha", colorKey: "veilEdgeColor", alphaKey: "veilEdgeAlpha", label: "暗角边缘色 / 浓度", maxA: 0.85 },
        { type: "range", key: "grainAlpha", label: "喷砂颗粒浓度", min: 0, max: 0.12, step: 0.004, unit: "" }
      ]
    },
    {
      id: "panel",
      title: "2. 中央主窗与机械线框",
      open: true,
      presets: [
        { label: "柔雾浅底主窗", action: "lightPanel" },
        { label: "烟熏黑底主窗", action: "darkPanel" }
      ],
      fields: [
        { type: "colorAlpha", colorKey: "panelBgColor", alphaKey: "panelBgAlpha", label: "主窗底色 / 透明度", minA: 0.15, maxA: 1.00 },
        { type: "range", key: "panelBlur", label: "主窗毛玻璃模糊", min: 0, max: 40, step: 1, unit: "px" },
        { type: "color", key: "panelFrameColor", label: "主窗外框与装甲色" },
        { type: "color", key: "accentColor", label: "内容强调与按钮色" },
        { type: "color", key: "connectorColor", label: "左上 HUD 连接导线色" },
        { type: "color", key: "scrollThumbColor", label: "右侧滚动条滑块色" },
        { type: "colorAlpha", colorKey: "surface2Color", alphaKey: "surface2Alpha", label: "内部条带与卡片底色", maxA: 1.00 },
        { type: "colorAlpha", colorKey: "lineColor", alphaKey: "lineAlpha", label: "内部分割线色 / 浓度", maxA: 1.00 }
      ]
    },
    {
      id: "nav",
      title: "3. 左侧与底部按钮框",
      open: true,
      fields: [
        { type: "colorAlpha", colorKey: "navBgColor", alphaKey: "navBgAlpha", label: "未选中框底色 / 黑度", minA: 0.15, maxA: 1.00 },
        { type: "range", key: "navBlur", label: "按钮框毛玻璃模糊", min: 0, max: 32, step: 1, unit: "px" },
        { type: "colorAlpha", colorKey: "navStrokeColor", alphaKey: "navStrokeAlpha", label: "未选中描边与侧脊", maxA: 1.00 },
        { type: "dualColor", key1: "navInkColor", key2: "navSubInkColor", label: "未选中字色（主 / 副）" },
        { type: "dualColorAlpha", key1: "navSelColor1", key2: "navSelColor2", alphaKey: "navSelAlpha", label: "选中框渐变（起 / 终 / 浓）" },
        { type: "dualColor", key1: "navSelStrokeColor", key2: "navSelSpineColor", label: "选中高亮（外框 / 侧脊）" },
        { type: "dualColor", key1: "navSelInkColor", key2: "navSelSubInkColor", label: "选中字色（主 / 副）" }
      ]
    },
    {
      id: "ink",
      title: "4. 正文与页脚文字色",
      open: false,
      fields: [
        { type: "color", key: "inkTitle", label: "主标题与重点字" },
        { type: "color", key: "inkBody", label: "正文段落字" },
        { type: "color", key: "inkMute", label: "次要说明与注音字" },
        { type: "color", key: "footerInk", label: "底部页脚字色" }
      ]
    }
  ];

  /* ── 构建 DOM ── */
  const tunerEl = document.createElement("aside");
  tunerEl.className = "sh-tuner";
  tunerEl.setAttribute("aria-label", "内置区域调色板");

  function renderFieldHtml(f) {
    if (f.type === "color") {
      return `
        <div class="sh-row sh-row-inline" data-field="${f.key}">
          <span class="sh-label">${f.label}</span>
          <div class="sh-controls">
            <input type="color" class="sh-color-swatch" data-bind-color="${f.key}" />
            <input type="text" class="sh-hex-input" data-bind-hex="${f.key}" maxlength="7" spellcheck="false" />
          </div>
        </div>`;
    }
    if (f.type === "range") {
      return `
        <div class="sh-row" data-field="${f.key}">
          <div class="sh-label">
            <span>${f.label}</span>
            <span class="sh-val-readout" data-readout="${f.key}" data-unit="${f.unit || ""}"></span>
          </div>
          <div class="sh-controls">
            <input type="range" class="sh-range" data-bind-range="${f.key}" min="${f.min}" max="${f.max}" step="${f.step}" />
          </div>
        </div>`;
    }
    if (f.type === "colorAlpha") {
      const minA = f.minA !== undefined ? f.minA : 0;
      const maxA = f.maxA !== undefined ? f.maxA : 1;
      return `
        <div class="sh-row" data-field="${f.colorKey}">
          <span class="sh-label">${f.label}</span>
          <div class="sh-controls">
            <input type="color" class="sh-color-swatch" data-bind-color="${f.colorKey}" />
            <input type="text" class="sh-hex-input" data-bind-hex="${f.colorKey}" maxlength="7" spellcheck="false" />
            <input type="range" class="sh-range" data-bind-range="${f.alphaKey}" min="${minA}" max="${maxA}" step="0.01" />
            <span class="sh-alpha-tag" data-readout="${f.alphaKey}" data-unit=""></span>
          </div>
        </div>`;
    }
    if (f.type === "dualColor") {
      return `
        <div class="sh-row" data-field="${f.key1}">
          <span class="sh-label">${f.label}</span>
          <div class="sh-controls">
            <input type="color" class="sh-color-swatch" data-bind-color="${f.key1}" />
            <input type="text" class="sh-hex-input" data-bind-hex="${f.key1}" maxlength="7" spellcheck="false" />
            <input type="color" class="sh-color-swatch" data-bind-color="${f.key2}" />
            <input type="text" class="sh-hex-input" data-bind-hex="${f.key2}" maxlength="7" spellcheck="false" />
          </div>
        </div>`;
    }
    if (f.type === "dualColorAlpha") {
      return `
        <div class="sh-row" data-field="${f.key1}">
          <span class="sh-label">${f.label}</span>
          <div class="sh-controls">
            <input type="color" class="sh-color-swatch" data-bind-color="${f.key1}" title="起始色" />
            <input type="text" class="sh-hex-input" style="width:62px" data-bind-hex="${f.key1}" maxlength="7" spellcheck="false" />
            <input type="color" class="sh-color-swatch" data-bind-color="${f.key2}" title="结束色" />
            <input type="text" class="sh-hex-input" style="width:62px" data-bind-hex="${f.key2}" maxlength="7" spellcheck="false" />
            <input type="range" class="sh-range" data-bind-range="${f.alphaKey}" min="0.2" max="1" step="0.01" />
          </div>
        </div>`;
    }
    return "";
  }

  tunerEl.innerHTML = `
    <div class="sh-tuner-head" id="sh-tuner-drag">
      <div class="sh-tuner-title">
        <span class="sh-tuner-dot"></span>
        <span>区域调色板</span>
      </div>
      <div class="sh-tuner-head-btns">
        <button type="button" class="sh-tbtn" id="sh-dock-side" title="切换停靠左/右侧">靠左</button>
        <button type="button" class="sh-tbtn" id="sh-min-toggle" title="快捷键 Alt+T 收起或展开">收起</button>
      </div>
    </div>

    <div class="sh-tuner-series" role="group" aria-label="选择调色作品">
      <button type="button" class="sh-series-btn" data-tuner-series="at1">AT1</button>
      <button type="button" class="sh-series-btn" data-tuner-series="at2">AT2</button>
      <button type="button" class="sh-series-btn" data-tuner-series="at3">AT3</button>
      <button type="button" class="sh-series-btn" data-tuner-series="default">其他页</button>
    </div>

    <div class="sh-tuner-body">
      ${GROUPS.map((g) => `
        <section class="sh-group ${g.open ? "" : "is-closed"}" data-group="${g.id}">
          <button type="button" class="sh-group-head">
            <span>${g.title}</span>
            <span class="sh-group-arrow">▼</span>
          </button>
          <div class="sh-group-content">
            ${g.presets ? `
              <div class="sh-preset-row">
                <span class="sh-preset-hint">一键主窗明暗：</span>
                ${g.presets.map((pr) => `<button type="button" class="sh-tbtn" data-preset="${pr.action}">${pr.label}</button>`).join("")}
              </div>
            ` : ""}
            ${g.fields.map(renderFieldHtml).join("")}
          </div>
        </section>
      `).join("")}
    </div>

    <div class="sh-tuner-foot">
      <div class="sh-foot-row">
        <button type="button" class="sh-tbtn" id="sh-sync-alpha" title="将当前页的模糊半径、背景浓度与框底透明度同步给其余三页（不覆盖各页主题色）">同步模糊/透明度</button>
        <button type="button" class="sh-tbtn" id="sh-reset-cur">重置本页</button>
        <button type="button" class="sh-tbtn" id="sh-reset-all">全重置</button>
      </div>
      <div class="sh-foot-row">
        <button type="button" class="sh-tbtn sh-tbtn-primary" id="sh-copy-json">复制参数</button>
        <button type="button" class="sh-tbtn" id="sh-import-json">导入参数</button>
        <button type="button" class="sh-tbtn" id="sh-download-css">导出 theme.css</button>
      </div>
      <div class="sh-toast" id="sh-toast" aria-live="polite"></div>
    </div>
  `;

  document.body.appendChild(tunerEl);

  const toastEl = document.getElementById("sh-toast");
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.textContent = ""; }, 2600);
  }

  /* 将当前激活作品的数据刷新到面板输入控件 */
  function refreshInputsFromProfile() {
    const key = activeProfileKey();
    const p = profiles[key];

    tunerEl.querySelectorAll("[data-tuner-series]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.tunerSeries === key));
    });

    tunerEl.querySelectorAll("[data-bind-color]").forEach((inp) => {
      const k = inp.dataset.bindColor;
      inp.value = normalizeHex(p[k], "#000000");
    });

    tunerEl.querySelectorAll("[data-bind-hex]").forEach((inp) => {
      if (document.activeElement === inp) return;
      const k = inp.dataset.bindHex;
      inp.value = normalizeHex(p[k], "#000000");
    });

    tunerEl.querySelectorAll("[data-bind-range]").forEach((inp) => {
      const k = inp.dataset.bindRange;
      inp.value = p[k];
    });

    tunerEl.querySelectorAll("[data-readout]").forEach((el) => {
      const k = el.dataset.readout;
      const unit = el.dataset.unit || "";
      const val = Number(p[k]);
      el.textContent = (Number.isInteger(val) && unit !== "" ? val : Number(val.toFixed(3))) + unit;
    });
  }

  /* 监听颜色选择器与滑杆实时更新 */
  tunerEl.addEventListener("input", (e) => {
    const key = activeProfileKey();
    const p = profiles[key];
    const t = e.target;

    if (t.dataset.bindColor) {
      const k = t.dataset.bindColor;
      p[k] = normalizeHex(t.value, p[k]);
      tunerEl.querySelectorAll(`[data-bind-hex="${k}"]`).forEach((hx) => { hx.value = p[k]; });
      applyLiveStyles();
      saveProfiles();
    } else if (t.dataset.bindHex) {
      const k = t.dataset.bindHex;
      const raw = t.value.trim();
      const candidate = raw.startsWith("#") ? raw : "#" + raw;
      if (/^#[0-9a-fA-F]{6}$/.test(candidate)) {
        p[k] = candidate.toLowerCase();
        tunerEl.querySelectorAll(`[data-bind-color="${k}"]`).forEach((sw) => { sw.value = p[k]; });
        applyLiveStyles();
        saveProfiles();
      }
    } else if (t.dataset.bindRange) {
      const k = t.dataset.bindRange;
      p[k] = Number(t.value);
      tunerEl.querySelectorAll(`[data-readout="${k}"]`).forEach((el) => {
        const unit = el.dataset.unit || "";
        el.textContent = (Number.isInteger(p[k]) && unit !== "" ? p[k] : Number(p[k].toFixed(3))) + unit;
      });
      applyLiveStyles();
      saveProfiles();
    }
  });

  tunerEl.addEventListener("change", (e) => {
    if (e.target.dataset.bindHex) {
      const key = activeProfileKey();
      const k = e.target.dataset.bindHex;
      profiles[key][k] = normalizeHex(e.target.value, profiles[key][k]);
      refreshInputsFromProfile();
      applyLiveStyles();
      saveProfiles();
    }
  });

  /* 面板按钮交互 */
  tunerEl.addEventListener("click", (e) => {
    const groupHead = e.target.closest(".sh-group-head");
    if (groupHead) {
      groupHead.parentElement.classList.toggle("is-closed");
      return;
    }

    const seriesBtn = e.target.closest("[data-tuner-series]");
    if (seriesBtn) {
      const target = seriesBtn.dataset.tunerSeries;
      const routeSeries = target === "default" ? "ciel" : target;
      if (typeof selectSeries === "function" && state.series !== routeSeries) {
        selectSeries(routeSeries);
      }
      refreshInputsFromProfile();
      return;
    }

    const presetBtn = e.target.closest("[data-preset]");
    if (presetBtn) {
      const key = activeProfileKey();
      const p = profiles[key];
      const def = DEFAULT_PROFILES[key];
      if (presetBtn.dataset.preset === "darkPanel") {
        p.panelBgColor = p.navBgColor;
        p.panelBgAlpha = 0.78;
        p.surface2Color = "#ffffff";
        p.surface2Alpha = 0.06;
        p.lineColor = "#ffffff";
        p.lineAlpha = 0.16;
        p.inkTitle = "#f3f6fb";
        p.inkBody = "#dde3ee";
        p.inkMute = "#9aa6b8";
        if (luminance(p.panelFrameColor) < 0.15) {
          p.panelFrameColor = p.navSelStrokeColor;
          p.connectorColor = p.navSelStrokeColor;
          p.scrollThumbColor = p.navSelStrokeColor;
        }
        showToast("已切换为烟熏黑底主窗（可继续微调）");
      } else if (presetBtn.dataset.preset === "lightPanel") {
        p.panelBgColor = def.panelBgColor;
        p.panelBgAlpha = def.panelBgAlpha;
        p.surface2Color = def.surface2Color;
        p.surface2Alpha = def.surface2Alpha;
        p.lineColor = def.lineColor;
        p.lineAlpha = def.lineAlpha;
        p.inkTitle = def.inkTitle;
        p.inkBody = def.inkBody;
        p.inkMute = def.inkMute;
        p.panelFrameColor = def.panelFrameColor;
        p.connectorColor = def.connectorColor;
        p.scrollThumbColor = def.scrollThumbColor;
        showToast("已恢复柔雾浅底主窗");
      }
      refreshInputsFromProfile();
      applyLiveStyles();
      saveProfiles();
      return;
    }

    if (e.target.closest("#sh-dock-side")) {
      tunerEl.style.left = "";
      tunerEl.style.right = "";
      tunerEl.style.top = "";
      const left = tunerEl.classList.toggle("is-dock-left");
      document.getElementById("sh-dock-side").textContent = left ? "靠右" : "靠左";
      return;
    }

    if (e.target.closest("#sh-min-toggle")) {
      const min = tunerEl.classList.toggle("is-minimized");
      document.getElementById("sh-min-toggle").textContent = min ? "展开" : "收起";
      return;
    }

    if (e.target.closest("#sh-sync-alpha")) {
      const cur = profiles[activeProfileKey()];
      const sharedKeys = [
        "bgBlur", "bgSaturate", "bgOpacity", "veilCenterAlpha", "veilEdgeAlpha",
        "grainAlpha", "panelBgAlpha", "panelBlur", "navBgAlpha", "navBlur", "navSelAlpha"
      ];
      ["at1", "at2", "at3", "default"].forEach((k) => {
        sharedKeys.forEach((sk) => { profiles[k][sk] = cur[sk]; });
      });
      applyLiveStyles();
      saveProfiles();
      showToast("已将当前模糊与透明度同步到全部页面");
      return;
    }

    if (e.target.closest("#sh-reset-cur")) {
      const key = activeProfileKey();
      profiles[key] = clone(DEFAULT_PROFILES[key]);
      refreshInputsFromProfile();
      applyLiveStyles();
      saveProfiles();
      showToast(`已重置 ${key.toUpperCase()} 配色`);
      return;
    }

    if (e.target.closest("#sh-reset-all")) {
      profiles = clone(DEFAULT_PROFILES);
      refreshInputsFromProfile();
      applyLiveStyles();
      saveProfiles();
      showToast("已恢复全部默认配色");
      return;
    }

    if (e.target.closest("#sh-copy-json")) {
      const text = JSON.stringify(profiles, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast("已复制调色参数 JSON（可直接发给助手固化）");
        }).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
      return;
    }

    if (e.target.closest("#sh-import-json")) {
      const raw = window.prompt("请粘贴之前复制的调色参数 JSON：");
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        let count = 0;
        ["at1", "at2", "at3", "default"].forEach((k) => {
          if (parsed && typeof parsed[k] === "object") {
            Object.assign(profiles[k], parsed[k]);
            count++;
          }
        });
        if (!count) throw new Error("invalid");
        refreshInputsFromProfile();
        applyLiveStyles();
        saveProfiles();
        showToast("已成功导入调色参数");
      } catch (_) {
        showToast("JSON 格式有误，导入取消");
      }
      return;
    }

    if (e.target.closest("#sh-download-css")) {
      const blob = new Blob([compileStandaloneThemeCss()], { type: "text/css;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "theme.css";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("已导出完整 theme.css（可直接覆盖 css/theme.css）");
    }
  });

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("已复制调色参数 JSON");
    } catch (_) {
      showToast("复制失败，请使用导出 CSS");
    }
    ta.remove();
  }

  /* 顶栏自由拖拽定位 */
  const dragHead = document.getElementById("sh-tuner-drag");
  let dragging = false;
  let startX = 0, startY = 0, origLeft = 0, origTop = 0;

  dragHead.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    dragging = true;
    const rect = tunerEl.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    origLeft = rect.left;
    origTop = rect.top;
    dragHead.setPointerCapture(e.pointerId);
  });

  dragHead.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const nx = Math.max(6, Math.min(window.innerWidth - tunerEl.offsetWidth - 6, origLeft + (e.clientX - startX)));
    const ny = Math.max(6, Math.min(window.innerHeight - 44, origTop + (e.clientY - startY)));
    tunerEl.style.right = "auto";
    tunerEl.style.bottom = "auto";
    tunerEl.style.left = `${nx}px`;
    tunerEl.style.top = `${ny}px`;
  });

  const stopDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    if (dragHead.hasPointerCapture(e.pointerId)) {
      dragHead.releasePointerCapture(e.pointerId);
    }
  };
  dragHead.addEventListener("pointerup", stopDrag);
  dragHead.addEventListener("pointercancel", stopDrag);

  /* Alt+T 快捷键收起/展开调色板 */
  document.addEventListener("keydown", (e) => {
    if (e.altKey && (e.key === "t" || e.key === "T")) {
      e.preventDefault();
      document.getElementById("sh-min-toggle").click();
    }
  });

  /* 联动主站左侧作品切换自动刷新调色板当前页 */
  if (typeof window.renderPage === "function") {
    const prevRender = window.renderPage;
    window.renderPage = function () {
      prevRender.apply(this, arguments);
      refreshInputsFromProfile();
    };
  }

  applyLiveStyles();
  refreshInputsFromProfile();
})();
