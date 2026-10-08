// motionkit/type.js — 字体系统（2026-10-08 video-director 重构落地）
// 目的：告别"全片 PingFang 600"的默认感。中文展示字体打包在 public/fonts/，用 FontFace + delayRender 加载，
// 不依赖字由(HelloFont)是否激活 —— 渲染机器上字体必然一致，帧可复现。
//
// 用法（场景工程顶层 import 一次即可，模块级执行）：
//   import {useFonts, T} from '../motionkit/type.js';
//   useFonts(['shuhei', 'smiley', 'din']);          // 在 Root/Video 组件体内调用（只加载用到的，省渲染启动时间）
//   <div style={{fontFamily: T.shuhei, fontSize: 140}}>3.2万亿</div>
//
// 版权（2026-10-08 逐款核验，详表 agent/craft/fonts-license.md）：**没有一款是 CC0**。
//   tier 'ofl'    = SIL OFL 1.1：商用、打包、投放都放心（不能单独卖字体）
//   tier 'vendor' = 厂商免费商用声明：视频/广告可商用，但**禁止子集化/转格式/修改**（阿里系明文），可撤销
//   tier 'cond'   = 有附加条件：见 note（署名 / 不得上传转载 / 不得嵌入软件）
// 付费投放（TikTok/DOU+ 广告）优先用 PAIRS_AD（只含 ofl + 华为/小米明文允许广告的字体，不用 macOS 系统字体）。
import {continueRender, delayRender, staticFile} from 'remotion';

export const FONTS = {
  // —— 中文标题/展示 ——
  shuhei:   {family: 'MK Alimama ShuHei',   file: 'fonts/AlimamaShuHeiTi-Bold.ttf',      license: '阿里妈妈数黑体 · 免费商用', tier: 'vendor', role: '数字+粗标题，方正硬朗，替代 PingFang 600 做大字'},
  smiley:   {family: 'MK Smiley Sans',      file: 'fonts/SmileySans-Oblique.ttf',       license: '得意黑 · SIL OFL 1.1',      tier: 'ofl', role: '斜切窄体，速度感/年轻，kinetic 字效首选'},
  gaoduan:  {family: 'MK Zcool GaoDuanHei', file: 'fonts/ZcoolGaoDuanHei.ttf',          license: '站酷高端黑 · 免费商用',     tier: 'vendor', role: '几何细节黑体，科技/高端感标题'},
  youshe:   {family: 'MK YouShe BiaoTiHei', file: 'fonts/YouSheBiaoTiHei.ttf',          license: '优设标题黑 · 免费商用',     tier: 'cond', note: '不得嵌入网页/App/游戏（视频 OK）', role: '综艺/爆款感超粗标题，短冲击词'},
  pangmen:  {family: 'MK PangMen BiaoTi',   file: 'fonts/PangMenZhengDaoBiaoTi.ttf',    license: '庞门正道标题体 · 免费商用', tier: 'cond', note: '不得嵌入软件（视频 OK）；原文未核实', role: '海报级斜粗标题，封面大字'},
  dakai:    {family: 'MK Alimama DaKai',    file: 'fonts/AlimamaDongFangDaKai.ttf',     license: '阿里妈妈东方大楷 · 免费商用', tier: 'vendor', role: '书法楷，国风/历史/宏观叙事大字'},
  fengya:   {family: 'MK FengYa Song',      file: 'fonts/MaoKenWangFengYaSong.ttf',     license: '猫啃网风雅宋 · 免费商用',   tier: 'ofl', role: '杂志宋体，editorial/纪实/报刊感标题'},
  fangyuan: {family: 'MK Alimama FangYuan', file: 'fonts/AlimamaFangYuanTiVF.ttf',      license: '阿里妈妈方圆体 · 免费商用（可变字重）', tier: 'cond', note: '须标注版权方阿里妈妈：用了就在视频简介加一行字体署名', role: '圆润友好，投教/轻松题'},
  jinbu:    {family: 'MK DingTalk JinBu',   file: 'fonts/DingTalkJinBuTi.ttf',          license: '钉钉进步体 · 免费商用',     tier: 'cond', note: '不得上传/发布/转载字体文件（已 .gitignore）', role: '斜粗圆体，活泼标签/贴纸'},
  wenyi:    {family: 'MK Zcool WenYi',      file: 'fonts/ZcoolWenYiTi.ttf',             license: '站酷文艺体 · 免费商用',     tier: 'vendor', role: '文艺手写感，旁白/引语'},
  kuaile:   {family: 'MK Zcool KuaiLe',     file: 'fonts/ZcoolKuaiLe-Regular.ttf',      license: '站酷快乐体 · SIL OFL 1.1（Google Fonts）', tier: 'ofl', role: '手写/活泼，便签批注、白板皮肤（替代未安装的手札体）'},
  // —— 中文正文/界面 ——
  puhui:    {family: 'MK PuHuiTi 3',        file: 'fonts/AlibabaPuHuiTi3-75-SemiBold.ttf', license: '阿里巴巴普惠体 3.0 · 免费商用', tier: 'vendor', role: '正文/卡片主文案（比 PingFang 更有分量）'},
  sourceH:  {family: 'MK Source Han Heavy', file: 'fonts/SourceHanSansSC-Heavy.otf',    license: '思源黑体 · SIL OFL 1.1',    tier: 'ofl', role: '真·900 字重中文黑体（PingFang 最粗只有 600）'},
  sourceB:  {family: 'MK Source Han Bold',  file: 'fonts/SourceHanSansSC-Bold.otf',     license: '思源黑体 · SIL OFL 1.1',    tier: 'ofl', role: '700 字重中文'},
  misans:   {family: 'MK MiSans Heavy',     file: 'fonts/MiSans-Heavy.ttf',             license: 'MiSans · 免费商用（小米字体协议）', tier: 'vendor', note: '软件内使用需注明 MiSans；视频 OK', role: '现代 UI 感超粗黑'},
  sourceR:  {family: 'MK Source Han Regular', file: 'fonts/SourceHanSansSC-Regular.otf', license: '思源黑体 · SIL OFL 1.1', tier: 'ofl', role: '正文 400（投放版替代 PingFang）'},
  sourceM:  {family: 'MK Source Han Medium',  file: 'fonts/SourceHanSansSC-Medium.otf',  license: '思源黑体 · SIL OFL 1.1', tier: 'ofl', role: '正文 500 / chip'},
  // —— 西文/数字 ——
  harmony:  {family: 'MK HarmonyOS Black',  file: 'fonts/HarmonyOSSans-Black.ttf',      license: 'HarmonyOS Sans · 免费商用', tier: 'vendor', note: '纯西文无中文字形', role: '数字/英文超粗'},
  montB:    {family: 'MK Montserrat Black', file: 'fonts/Montserrat-Black.otf',         license: 'Montserrat · SIL OFL',      tier: 'ofl', role: '英文几何超粗，kinetic 字效'},
  playfair: {family: 'MK Playfair Black',   file: 'fonts/PlayfairDisplay-Black.otf',    license: 'Playfair Display · SIL OFL', tier: 'ofl', role: '英文高对比衬线，editorial 大数字'},
  oswald:   {family: 'MK Oswald',           file: 'fonts/Oswald-VF.ttf',                license: 'Oswald · SIL OFL 1.1（Google Fonts）', tier: 'ofl', role: '窄体数字（替代 DIN Condensed，投放版用）'},
  jbmono:   {family: 'MK JetBrains Mono',     file: 'fonts/JetBrainsMono-VF-latin.woff2', license: 'JetBrains Mono · SIL OFL 1.1', tier: 'ofl', role: '等宽（替代 Menlo，投放版用）'},
  abril:    {family: 'MK Abril Fatface',    file: 'fonts/AbrilFatface-Regular.ttf',     license: 'Abril Fatface · SIL OFL',   tier: 'ofl', role: 'Didone 粗衬线，杂志封面数字'},
};

// macOS 系统自带（不用加载，headless Chrome 直接可用）
// ⚠️ 许可：Apple 许可只授权"在本机上显示与打印"，没有明文授权商业广告；字体多为第三方（苹方=华康、DIN=Linotype…）。
//    自然流量视频风险低；**付费投放版不用 SYS 字体**，用 PAIRS_AD。字体文件不得拷出本机（不能进仓库、不能上 Lambda）。
export const SYS = {
  din: '"DIN Condensed", "DIN Alternate", sans-serif',     // 窄体数字，终端/数据感
  dinAlt: '"DIN Alternate", sans-serif',
  mono: 'Menlo, "SF Mono", monospace',
  futura: 'Futura, "Futura Condensed", sans-serif',
  didot: 'Didot, "Bodoni 72", serif',
  avenirCond: '"Avenir Next Condensed", sans-serif',
  pingfang: '"PingFang SC", "Hiragino Sans GB", sans-serif',
  songti: '"Songti SC", "STSong", serif',
  // ⚠️ "Hannotate SC"(手札体) / "Kaiti SC"(楷体) 本机未安装（macOS 按需下载字体），写了也会静默回退成 PingFang。
  //    手写感用 T.kuaile / T.wenyi，楷书用 T.dakai。2026-10-08 样张实测。
};

const FALLBACK = '"PingFang SC", "Hiragino Sans GB", sans-serif';
// T.<key> = 可直接塞进 fontFamily 的字符串（带回退链）
export const T = Object.fromEntries([
  ...Object.entries(FONTS).map(([k, v]) => [k, `"${v.family}", ${FALLBACK}`]),
  ...Object.entries(SYS).map(([k, v]) => [k, `${v}, ${FALLBACK}`]),
]);

// 字体配对（art-direction.md 的 type pairing 速查；每套皮肤选一对，不在一条片子里混第三种展示字体）
export const PAIRS = {
  impact:    {title: T.shuhei,  body: T.puhui,    num: T.shuhei,   note: '默认投研：数黑体大字 + 普惠体正文'},
  kinetic:   {title: T.smiley,  body: T.puhui,    num: T.montB,    note: '速度感：得意黑斜切 + Montserrat Black 数字'},
  editorial: {title: T.fengya,  body: T.puhui,    num: T.playfair, note: '杂志/纪实：风雅宋 + Playfair 高对比数字'},
  terminal:  {title: T.gaoduan, body: T.mono,     num: T.din,      note: '数据终端：站酷高端黑 + Menlo + DIN 窄数字'},
  poster:    {title: T.pangmen, body: T.sourceB,  num: T.harmony,  note: '海报冲击：庞门正道 + HarmonyOS Black'},
  guofeng:   {title: T.dakai,   body: T.puhui,    num: T.abril,    note: '宏观/历史叙事：东方大楷 + Abril 衬线数字'},
  friendly:  {title: T.fangyuan, body: T.fangyuan, num: T.jinbu,   note: '投教轻松：方圆体 + 进步体（方圆体需在简介署名）'},
  variety:   {title: T.youshe,  body: T.sourceB,  num: T.misans,   note: '综艺爆款：优设标题黑 + MiSans Heavy'},
};

// 付费投放安全组（只用 OFL + 华为/小米明文允许广告用途的字体；不用 macOS 系统字体）
export const PAIRS_AD = {
  impact:    {title: T.sourceH, body: T.sourceR, num: T.oswald,   note: '思源黑体 Heavy + Oswald'},
  kinetic:   {title: T.smiley,  body: T.sourceM, num: T.montB,    note: '得意黑 + Montserrat Black'},
  editorial: {title: T.fengya,  body: T.sourceR, num: T.playfair, note: '风雅宋 + Playfair'},
  terminal:  {title: T.sourceB, body: T.jbmono,  num: T.oswald,   note: '思源黑体 + JetBrains Mono + Oswald'},
  friendly:  {title: T.kuaile,  body: T.sourceM, num: T.smiley,   note: '站酷快乐体 + 得意黑'},
};
// 规则：tier 'vendor'/'cond' 的字体文件不得子集化、转 woff2、转 typeface JSON（阿里系声明禁止"转换、拆分"）。

const loaded = new Set();
// 模块级去重；在组件体内调用（Remotion 在每个渲染 tab 里都会执行一次）
export const useFonts = (keys = Object.keys(FONTS)) => {
  const todo = keys.filter((k) => FONTS[k] && !loaded.has(k));
  if (!todo.length || typeof document === 'undefined') return;
  todo.forEach((k) => loaded.add(k));
  const handle = delayRender(`fonts: ${todo.join(',')}`, {timeoutInMilliseconds: 60000});
  Promise.all(
    todo.map((k) => {
      const {family, file} = FONTS[k];
      const face = new FontFace(family, `url(${staticFile(file)})`);
      return face.load().then((f) => document.fonts.add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('[motionkit/type] font load failed', err);
      continueRender(handle);
    });
};
