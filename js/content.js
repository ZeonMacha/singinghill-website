/*
  网站文案集中修改处
  ==================
  只修改引号里的文字，不要修改 id、const、逗号和括号。

  1. SITE.series：左侧作品名称、副标题和尚未整理作品的简介。
  2. SUBPAGES：底部三个按钮的中英文。
  3. SITE_TEXT：浏览器标题、外部链接页和尚未整理页面的提示。
  4. AT1 / AT2 已发布的正文、下载地址、更新记录和人员名单：
     请在 js/at1.js 修改。
  5. 页脚：修改各作品的 footer，会随当前主标签一起切换。
*/

const SITE = {
  series: [
    {
      id: "at1", // 内部标识，请勿修改。
      name: "Ar tonelico",
      sub: "于世界终末继续吟咏诗歌的少女",
      intro: "在高塔与浮游大陆之间，聆听少女们编织的诗篇。系列一切的起点。",
      footer: "占位符"
    },
    {
      id: "at2",
      name: "Ar tonelico II",
      sub: "回响于世间的少女们的<ruby>创造诗<rt>梅塔法利卡</rt></ruby>",
      intro: "让思念化作歌声，在梅塔法尔斯寻找新的大地。"
    },
    {
      id: "at3",
      name: "Ar tonelico III",
      sub: "扣动世界终焉之扳机的少女之诗歌",
      intro: "旅途来到索尔·库拉斯塔，歌声再一次连接彼此。"
    },
    {
      id: "ciel",
      name: "Ciel nosurge",
      sub: "～献给失落之星的诗歌～",
      intro: "隔着七次元的距离，与伊恩一起拾起记忆的碎片。"
    },
    {
      id: "arn",
      name: "Ar nosurge",
      sub: "～赠予未诞生之星的祈祷诗～",
      intro: "在两个视角交织的旅途中，寻找人与世界的联系。"
    },
    {
      id: "web",
      name: "Web",
      sub: "系列相关资料与外部站点索引",
      intro: "系列相关的 wiki、资料库与官方站点索引。"
    },
    {
      id: "wiki",
      name: "Wiki",
      sub: "SingingHill Wiki",
      intro: "社区维护的英文百科，涵盖设定、角色与音乐资料。",
      url: "https://wiki.singinghill.top/"
    }
  ]
};

// 底部三个按钮：en 是英文，zh 是中文，desc 是下方英文说明。
// 未单独填写 footer 的作品统一显示这段文字。
const DEFAULT_FOOTER = "占位符";

const SUBPAGES = [
  { id: "home", en: "Home", zh: "主页 / 特性", desc: "Overview & Features" },
  { id: "download", en: "Download", zh: "下载 / 补丁教程", desc: "Download & Patch Guide" },
  { id: "staff", en: "Staff", zh: "制作人员", desc: "Project Credits" }
];

const SITE_TEXT = {
  name: "歌颂之丘",
  browserTitle: "歌颂之丘 — 本地化补丁发布站",
  homeEmpty: "这一作品的主页正文尚未整理。补齐后此处将放置作品简介、补丁特性与更新记录。",
  downloadEmpty: "下载地址、适用镜像、安装步骤与注意事项将整理在此处。",
  staffEmpty: "参与人员、分工与感言将整理在此处。",
  webTitle: "外部链接",
  webSubtitle: "系列相关的社区与资料来源索引"
};

// Web 页面中的链接：第一项是显示名称，第二项是网址。
const WEB_LINKS = [
  ["Ar tonelico", "https://artonelico.wiki.gg/wiki/Ar_tonelico:_Melody_of_Elemia"],
  ["Ar tonelico II", "https://artonelico.wiki.gg/wiki/Ar_tonelico_II:_Melody_of_Metafalica"],
  ["Ar tonelico III", "https://artonelico.wiki.gg/wiki/Ar_tonelico_Qoga:_Knell_of_Ar_Ciel"],
  ["Ciel nosurge", "https://artonelico.wiki.gg/wiki/Ciel_nosurge"],
  ["Ar nosurge", "https://artonelico.wiki.gg/wiki/Ar_nosurge"],
  ["SingingHill Wiki", "https://wiki.singinghill.top/"]
];
