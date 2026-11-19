/*
  AT1 / AT2 正文修改处
  ====================
  at1DownloadUrl：AT1 网盘地址。
  at1Features：主页“补丁内容”列表。
  at1Updates：主页“最新更新”列表。
  at1Credits：Staff 页参与人员名单。
  at1Messages：Staff 页制作感言。
  at1Home / at1Download / at1Staff：AT1 三个页面的正文。
  at2Home / at2Download / at2Staff：AT2 三个页面的正文。

  作品名与左侧副标题请在 js/content.js 修改。
  列表中每一项都要保留引号与逗号；HTML 标签只用于排版。
*/

const at1DownloadUrl = "https://pan.baidu.com/s/1Pj1ZFba0foAlAaJHZaocdw?pwd=0bms";

const at1Features = [
  "完全本地化菜单、剧情对话、技能动画、开头与结尾动画，并为剧情过场动画添加中文字幕。",
  "修复弥纱线事件绑定错误导致剧情无法推进的问题。",
  "修复安装启动事件条件错误导致功能无法解锁的问题。",
  "将原版未加入的缺号卡片添加到卡包。",
  "修复龙巢商店通行性设定错误导致的死机。",
  "修复道具「恢复核心」未绑定事件、使用无效的问题。",
  "修复红魔法用晶体暴击加成计算与异常状态施予判定。"
];

const at1Updates = [
  ["20250511.1", "修复红魔法用异常效果施予系晶体等级惩罚计算错误。"],
  ["20250506.1", "修复多处术语不一致；补丁器支持 The Best（SLPS-73249）版本，可能仍有 BUG。"],
  ["20241107.1", "修复红魔法用暴击提升系晶体无效，以及多处衍字、脱字。"],
  ["20241012.0", "修复第三女主潜入异常及多处笔误，建议更新。"]
];

const at1Credits = [
  ["主持", "巇岩"],
  ["翻译", "巇岩、星云nebulas、Lipsum、AkiraVoid、Lordvord、小狼、镜、明日启示、皮蛋粥、EREVitta、Kuroimomo、Twain_Z、黑二、盐巴、LunaLand、窖藏四千五、霸王、vittorio、清口之杏、叶子、Amlupta、北巷_hokukou、随风、抽风君"],
  ["游戏 ROM 逆向", "巇岩"],
  ["翻译协作工具", "寂听"],
  ["游戏文本导出", "Lipsum"],
  ["视频格式逆向", "星云nebulas"],
  ["图像裁切调整", "氷上の湖精"],
  ["世界观与语言学顾问", "AsforThisTime"],
  ["图像", "星云nebulas、巇岩"],
  ["视频", "星云nebulas"],
  ["一校", "巇岩、星云nebulas、Lipsum、窖藏四千五、弦音、盐巴、镜"],
  ["一测", "巇岩、星云nebulas、Twain_Z、灰椋鸟、ar-ciel"],
  ["二校（润色）", "巇岩、星云nebulas、小狼、AsforThisTime、Lipsum"],
  ["二测", "星云nebulas、巇岩"]
];

const at1Messages = [
  ["星云nebulas", "能陪我在汉化全系列的路上走到尽头么（？）"],
  ["Lipsum", "Was yea ra chs hymmnos mea, an yor."],
  ["寂听", "因为非常奇妙的缘分接触到了这个作品，只是做了点微小的工作"],
  ["氷上の湖精", "入坑的时候汉化都快搞完了，没帮上什么忙 (www"],
  ["AsforThisTime", "我最终所做的并不像我所承诺的那样多，抱歉。"],
  ["窖藏四千五", "我是马克西米利安·泰尔米多尔，也是企业连rank.1的奥次达尔瓦"],
  ["Twain_Z", "功成不在我。"],
  ["盐巴", "我是大一大二开始翻这个的，转眼都读研了。下一作（CnS或者AT3）真的翻得完吗？"],
  ["ar-ciel（伊茨特克）", "感谢在这个年代依旧能遇到如此热爱AT系列的各位，Was yea ra hymme mea ks maya gyen yeal."]
];

/* ── AT1 ─────────────────────────────────── */

function at1Home() {
  return `
    ${viewHead("Ar tonelico 本地化补丁")}
    <div class="home-intro">
      <p class="intro-motto">Was yea ra weel li wearequewie!</p>
      <p>十年……啊不，五年磨一剑。各位好，这里是《歌颂之丘计划》——魔塔大陆非官方本地化项目的发起人，巇岩。<br />历时五载，终于得以于今日将经组内三批人悉心雕琢的成品呈予各位——</p>
    </div>
    <p class="lead home-summary">AT1 非官方本地化补丁现已发布，覆盖菜单、剧情对话、技能动画与片头片尾动画。</p>

    <h2>补丁内容</h2>
    <ol class="feature-items">
      ${at1Features.map((x) => `<li>${x}</li>`).join("")}
    </ol>

    <h2>最新更新</h2>
    <dl class="updates">
      ${at1Updates.map(([date, text]) => `<div class="update"><dt>${date}</dt><dd>${text}</dd></div>`).join("")}
    </dl>`;
}

function at1Download() {
  return `
    ${viewHead("下载与补丁教程")}
    <div class="download-hero">
      <a class="big-link" href="${at1DownloadUrl}" target="_blank" rel="noopener noreferrer">百度网盘下载</a>
      <dl class="dl-meta">
        <div><dt>提取码</dt><dd>0bms</dd></div>
        <div><dt>适用镜像</dt><dd>日版、美版、欧版</dd></div>
        <div><dt>主要支持</dt><dd>日版</dd></div>
      </dl>
    </div>

    <div class="notice">
      补丁直接修改原镜像，失败可能导致镜像损坏。请先备份完整镜像，并在补丁器中选择「实行 → 备份」备份主程序。
    </div>

    <h2>安装步骤</h2>
    <ol class="instructions">
      <li>从自己的 AT1 光碟制作 ISO 镜像。</li>
      <li>在补丁器主界面点击「选择镜像」。</li>
      <li>如需高级设置，打开「文件 → 偏好」。美版、欧版请在修补前选择日语或英语配音；完成后无法在游戏内切换。</li>
      <li>确认设置与备份完毕，点击「修补」。</li>
      <li>若主程序出现问题，可尝试「实行 → 恢复」。完整镜像损坏时请使用事先保留的镜像备份。</li>
    </ol>

    <p class="empty-note">不提供原始镜像，请以正当方式获取。</p>`;
}

function at1Staff() {
  return `
    ${viewHead("制作名单与感言", "SingingHill Project")}
    <h2>参与人员</h2>
    <dl class="staff-list">
      ${at1Credits.map(([role, names]) => `<div class="staff-row"><dt>${role}</dt><dd>${names}</dd></div>`).join("")}
    </dl>

    <p class="thanks">Infel yora.</p>

    <h2>感言</h2>
    <dl class="staff-messages">
      ${at1Messages.map(([name, message]) => `<div class="msg"><dt>${name}</dt><dd>${message}</dd></div>`).join("")}
    </dl>`;
}

/* ── AT2 ─────────────────────────────────── */

function at2Home() {
  return `
    ${viewHead("Ar tonelico II 资料页")}
    <p class="statement">让思念化作歌声，<br />在梅塔法尔斯寻找新的大地。</p>
    <p class="empty-note">本作的补丁与资料仍在整理中，完成后会在此更新。</p>

    <hr class="rule" />

    <h2>翻译招募</h2>
    <p>AT2 翻译校对进行中，欢迎加入 · QQ 群：88588292。</p>`;
}

function at2Download() {
  return `
    ${viewHead("下载与补丁教程")}
    <p class="empty-note">下载地址、适用镜像、安装步骤与注意事项将整理在此处。</p>`;
}

function at2Staff() {
  return `
    ${viewHead("制作名单")}
    <p class="empty-note">参与人员、分工与感言将整理在此处。</p>`;
}
