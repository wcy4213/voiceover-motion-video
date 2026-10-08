# 皮肤 · 黑底点阵（投研线，2026-08 起默认）

近黑底 `#050505` + 紫色点阵微动效背景，紫/黄降级为元素色。取代旧的深空紫涟漪底（`template/` 里的旧皮肤保留作完整示例工程）。适合财报解读、热点拆解、公司复盘这类投研向内容。

## 文件

| 文件 | 内容 |
|---|---|
| `theme.js` | 色板 + 字体 tokens（换品牌只改这里）。涨绿 `#2ebd85` / 跌红 `#f6465d` 固定 |
| `Fx.jsx` | 特效组件：`DotGrid`（点阵背景，或用 `motionkit/DotGridBackdrop` 带漂移光晕版）、`CRT`（雪花电视闪回——把真实访谈视频包进去=老录像既视感，讲"过去"整段可用）、`Glitch`（信号故障转场：暗闪+细撕裂线，别做实心大色块）、`WindOutline`（抠图风动描边，配 `scripts/make_outline.py` 生成素材对）、`BreakingTag`/`DateStamp`（突发新闻章/日期章） |
| `fun.jsx` | 趣味组件库：FloatWrap（呼吸浮动兜底）/ Sparkles / MoneyRain / ConfettiBurst / Battery / EKG / Lifebuoy / Waves / SlamStamp / CoinStack / SweatDrops / QuestionScatter / Shimmer / TypingDots + `rand(i, seed)` 确定性伪随机。"每场一个图形主角、万物皆动"的弹药库 |
| `ui.jsx` | 基础动效：Pop / Rise / CountUp / Chip / Kicker / useShake |
| `TickerChip.jsx` | 公司出场规范组件（logo 圆角块 + $代码药丸） |
| `Disclaimer.jsx` | 免责水印，挂 Video.jsx 顶层全片常驻（不是只放片尾） |
| `Subtitle.jsx` | 烧录字幕（单行/无标点/贴底/白色），读工程根目录 `subs.json`（`{f0, f1, text}` 帧号制；用 `scripts/make_subs.py` 的秒制输出换算 = 秒×fps） |

## 用法

把本目录拷进你的工程（或直接 import），场景里：

```jsx
import { C, F } from "./theme.js";
import { DotGrid, CRT, Glitch } from "./Fx.jsx";
import { FloatWrap, MoneyRain, SlamStamp } from "./fun.jsx";
import { Pop, Rise, CountUp } from "./ui.jsx";
```

背景层建议用 `motionkit/DotGridBackdrop`（点阵 + 漂移光晕，props 带 seed/gap）——**每期至少换 seed/gap 一样**，防"条条黑底一样"被平台判同质化。

## 开场（S0）标准构图：实拍打底

- 主角人物讲话实拍（官方 keynote/采访机位）全幅打底、`objectPosition` 推人物到右侧 60-70%
- 左侧黑区渐变 `linear-gradient(90deg, rgba(5,5,5,.95) 0%, .85 30%, .28 54%, .02 72%)`，文字全压左黑区
- 左上日期章（黄系）+ badge（突发才用红 BREAKING，非突发用中性标签）
- 两行大标题（~104px / 800），关键词品牌黄；人物名牌右下
- **frame 0 必须排版完整可见，frame 1 起强冲击动画**（punch-in、光爆、slam），每 1-2 秒一个新动效事件

完整规范见 `references/design-system.md` §1.5。

## 设计纪律速记

- 黄色只给全片最关键的一两处；到处黄 = 没有重点
- 屏上文字：标题 ≤6 字、卡片正文 ≤8 字关键词、解释性整句一律删（口播/字幕已经在讲）
- 方块底 emoji（⬆️📉📈）禁用，箭头用 SVG 三角 / 🔻
- 转场分层级：大章节涟漪擦除（前后各 10 帧），小节硬切，全片涟漪 ≤10 次
