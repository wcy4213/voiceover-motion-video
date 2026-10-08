# 设计规范 · Bobby AI 动效解说视频

写任何场景代码前读完本文。规范分三层：品牌 tokens（不能改）、动效语言（默认遵循）、踩坑清单（血泪教训，别再踩）。

## 1. 品牌 tokens（来自官方 Figma 板，见记忆 rockflow-bobby-brand-tokens）

```js
// theme.js —— 新工程直接抄
export const C = {
  bg: "#050505",          // 近黑底（2026-08-10 用户定：投研视频弃紫底，改黑+点阵；纯黑易 banding 故用近黑）
  purple: "#6F00FF",       // 品牌紫（卡片强底、节点——紫色降级为元素色，不再做底）
  purpleBright: "#A050FF", // 亮紫（描边、轴线、次强调）
  yellow: "#F9F339",       // 品牌黄 —— 只给全片最关键的一两处
  blue1: "#7C9CFD", blue2: "#9FB7FF", blue3: "#E3D9FF", // 蓝紫系，次要文字
  white: "#FFFFFF", grey: "#F2F2F2",
  up: "#2ebd85", down: "#f6465d", // 涨绿跌红，固定规则，与紫黄无关
};
export const F = {
  cn: '"PingFang SC", "Hiragino Sans GB", "Heiti SC", sans-serif',
  num: '-apple-system, "SF Pro Display", "Helvetica Neue", "PingFang SC", Arial, sans-serif',
};
// 2026-10-08 起：标题/巨数字的展示字体从 motionkit/type.js 选（PAIRS.impact = 阿里妈妈数黑体 + 普惠体），
// 上面的 F.cn 只做正文兜底。美术规则见 agent/craft/art-direction.md
```

- **黄色纪律**：黄是稀缺资源。日历高亮环、全片核心问题、"历史第二高"这类点睛处才用；到处用黄=没有重点
- **背景母题（2026-08-10 起）**：**黑底 + 点阵**，用 `motionkit/DotGridBackdrop`（近黑 #050505 + 点阵 + 漂移光晕）；**每期换 seed/gap 至少一样**，防"条条黑底一样"重蹈空紫底同质化覆辙。旧的深空紫 NoiseBackdrop/涟漪 Backdrop 不再做背景
- **涟漪母题降级**：涟漪只保留在大章节转场擦除（RippleWipe）和收尾呼应，不再常驻背景
- **品牌形象**：✦ 星芒 + "Bobby AI" 字标做片头点缀和片尾落版

## 1.5 首帧/封面规范（抖音防同质化判定，2026-07-23 起铁律）

**背景**：2026-07-22《谷歌Q2财报》被抖音判"出现批量发布违规或低质内容"限流（画面维度）。根因：开场全靠 spring 从 scale/opacity 0 弹入 → frame 0 ≈ 一块空的深紫底，条条视频首帧几乎一样，被算法当成批量同质化内容。第 0 帧同时也是默认封面，权重极高。

每条视频的 S0 开场场景必须满足：

1. **frame 0 是排版完整的封面，但 frame 1 起必须立刻动起来**（2026-08-10 用户反馈追加）：开场主视觉（抠图照片、日期、标题）在第 0 帧就完整可见（入场插值在 frame 0 已处于终态），**禁止**整个 S0 从空底弹入；同时**禁止**"静帧海报+呼吸微动"撑几秒——从 frame 1 起封面拍要做强冲击开场动画：整体镜头 punch-in/推拉（scale 1.12→1.0 带 overshoot）、封面元素逐个 slam 重强调+震屏、光爆/粒子爆发、标题扫光、抠图视差位移、印章连环砸入；开场拍每 1-2 秒必须有新动效事件
2. **必带当天日期**：发布日期（如「7月23日」或「07·23」）做成日期章/日历页/角标放进封面帧，位置与样式可以每条换
3. **主视觉 = 事件主角实拍视频打底（默认，2026-08-11 用户定）**，没有合适实拍才退回照片抠图：封面拍用主角人物讲话实拍（keynote/采访官方机位）全幅打底、人物居右，实拍自带的人物运动就是最强开场动效。人物归属规则不变——必须是本片主角公司的人。抠图备选流程见 §5。纯底色+文字+logo 不合格（黑底点阵同样算纯底）
4. **构图每条换**：人物/素材、日期章样式（黄底黑字↔黄描边黑底↔红方章…轮换）、badge 位置（横排/竖排）、标题排版至少换两处，保证和历史成片首帧肉眼可辨地不同。历史封面存档在 `./out/stills/covers/`，写 S0 前先翻一遍
5. **验收**：渲 `--frame=0` 静帧肉眼核对以上四条，通过后存档 `out/stills/covers/<slug>_f0.png`

### §1.5.1 实拍开场标准模板（leopold 式，2026-08-11 nvda0811 定版，以后默认）

参照成片：`leopold0731`（首创）、`nvda0811`（定版）。结构：

- **实拍底**：OffthreadVideo 静音全幅 cover，`objectPosition` 把人物推到画面右侧 ~60-70%；舞台暗光素材加 `brightness(1.2-1.3)`。素材来源限官方频道/press kit（yt 下载认准 channel 名），单段 ≤10s，选人物正面讲话+手势段（抽帧挑段再 trim）
- **左侧黑区渐变**：`linear-gradient(90deg, rgba(5,5,5,.95) 0%, .85 30%, .28 54%, .02 72%)` + 上下轻压暗，字全部压在左黑区上
- **左上日期章**（黄系）+ **红 badge「突发 · BREAKING」**——badge 只在事件确属当日/突发时用，非突发选题换中性标签（如「热点拆解」「财报解读」），别标题党
- **两行大标题**（fontSize ~104 fontWeight 800）：白字 + 关键词品牌黄；第二行在口播关键词落点处 kick 重强调
- **副行**：小 logo + 一行紫蓝小字（事件参与方/一句话背景）；**钩子 chip** 一枚（预告后段反差结论，补 25 秒线）
- **人物名牌**右下（bottom ≥ 40）
- 动效事件表照旧：f0-14 punch-in+光爆 → 日期章/badge kick → 标题扫光循环 → 关键词落点 kick；实拍人物全程在动

## 1.6 Bobby AI 前置露出（2026-09-10 起铁律，每条必有）

**背景**：抖音人均观看只有 30 秒左右，Bobby 露出只放片尾等于多数人没看到；标题已在往 AI 产品方向调，前段提一嘴不违和。用户定：**前 30 秒内画面出现 Bobby AI app icon + 名字**，脚本阶段和制作阶段都要落。

- **时间**：前 30 秒内，理想 8~25 秒——**不占前 2 秒**（第一拍仍是标的+硬数字），也不进 frame 0 封面拍（§1.5 首帧规范不变）
- **触发点**：口播说到「用 Bobby AI 把…拉了一遍 / 一查就出来」那一拍同步入场；停 2~3 秒（60~90 帧）后退场，不常驻。口播没这句时，挂在前 30 秒第一张数据卡的来源署名角
- **素材**：icon = `public/logos/BobbyAI_icon.png`（独角兽 app icon，透明底 1049²，圆角 24% 做成 app-icon 风）；名字 = `BobbyAI_light.png`（白，深底）/ `BobbyAI_purple.png` / `BobbyAI_ink.png`（浅底）。**禁手打 "Bobby AI" 文字**（见记忆 bobby-logo-and-text-density）
- **形式（选一，每期可换）**：① 角标 chip：icon + 字标横排小药丸从边缘滑入，放顶部章节标签下方或右下；② 数据卡来源署名：卡片左下角 `icon + 字标 + 「整理」` 一行小字；③ 小画中画：icon 弹出，字标跟入，波纹一圈。**不做**全屏产品卡、UI 截图、功能演示、slogan 大字（国内合规，见 cn-platform-compliance-redline）
- **布局**：不与主数字抢同一 y 区，透明度 1（不是装饰层）；尺寸 icon 72~96px、字标高 36~46px
- **组件**：`import {BobbyCallout} from '../motionkit/index.js'`（icon+字标 chip，自带滑入/滑出；参数 `from` 入场帧、`hold` 停留帧数默认 75、`tone` light/purple/ink、`corner` br/bl/tr/tl、`label` 默认「整理」）；纸面皮肤工程 `zaojia0904/scenes/common.jsx` 里有同名副本。验证样张 `out/stills/bobby_callout_demo.png`（motionkit demo frame 60）。`BobbyPill`/`BobbyLogo` 仍用于片尾落版
- **验收**：分镜表有 `【Bobby前置位】` 行；渲染后抽 ≤30s 帧确认，存 `out/stills/<slug>_bobby.png`。片尾落版照旧保留

## 2. 内容与排版纪律

- **文字纪律**：屏上只有关键词、数字、emoji、logo。口播讲整句，屏幕只给锚点。一行关键词 > 一段话。ASR 错字按正确写法上屏（Megapack/CapEx/FSD/18A…），数字以口播为准
- **文字上限（用户实测反馈"字还是有点多"后定的）**：卡片只留一行主文案，**副标题/解释行默认不加**；chip 文案 ≤10 个字（"广告这条线·大概率是稳的✓"→"广告线·稳✓"）；同屏文字组 ≤4 个
- **公司出场规范**：官方 logo（parqet CDN 方形色块图，`borderRadius: size*0.24` 做成 app-icon 风）+ 中文名 + `$TICKER` 药丸。首次出场用大 TickerChip 弹簧入场，之后小尺寸出现在章节标签/决策树里
- **画布默认（2026-08-11 用户定）**：**1084×884**（=1085:885 宽高比取偶）。旧 1:1 工程不迁移，新工程一律用它
- **信息层级字号**（1084×884 画布参考）：巨数字 128-170 / 标题 72-86 / 关键词行 40-54 / chip 26-40 / 免责小字 26
- **顶部章节标签**（ChapterTab）：讲多家公司/多章节的视频必备，顶部居中小药丸显示"当前讲到谁"，mini logo + 文案，跨场景持续。场景内的 kicker 标题 marginTop ≥ 100 给它让位
- **安全区**：四边留 ≥ 80px；卡片宽度 ≤ 920
- **字幕安全区（2026-08-11 起默认关闭）**：用户字幕在画面外，底部不再预留 170px；贴底元素 `bottom ≥ 40` 即可。仅当用户明确说"字幕压在视频底部"时才恢复 ~150px 预留
- **免责水印（全片常驻，不可省略）**：在 Video.jsx / Root 组件顶层挂 `<Disclaimer />` 组件——position: absolute、z 最高、全片每帧可见、fontSize 26、opacity 0.35-0.4、放右上角 `{top:28, right:34}` 或左下角（避让字幕安全区则用右上）。文案按内容类型选：科普/投教→「内容仅供科普 · 不构成投资建议」；公司介绍/财报→「内容仅供信息参考 · 不构成投资建议」。**与片尾 Outro 的免责文字共存——Outro 是大字收尾，水印是全片保险。**

## 2.5 画面趣味性铁律（2026-08-05 用户四条反馈后定的：画面不吸引/没趣味/动效少/文字多）

- **每场一个图形主角**：能画的绝不写字。概念一律翻成视觉道具——濒死=心电图拉直+电量掉红格、救助=救生圈套 logo、回购=🍎吃豆人吃股票方块、紧张=数字冒汗颤抖、被碾压=拳套怼小气泡、订阅=卡片往下掉金币。"标题+文字卡片弹出"是被打回的旧模式
- **屏上文字 ≤1 行短语 + 数字**：完整叙述交给底部烧录字幕，画面只给锚点。三行 checklist → 三个大图标+印章连斩；长句 chip → 4-6 字短语
- **万物皆动**：任何元素静止不超过 2 秒。FloatWrap（呼吸浮动）兜底，再加持续动效层（钱雨/星光/彩纸/汗滴/轨道环 marching-ants）。入场动效结束≠场景结束
- **emoji 即插图（已实测）**：渲染用 chrome-headless-shell 能渲全量 Apple Color Emoji（探针验证过 💰💵🍎📱🔋🥊😰🚀🔔💡🏷📺🧠⚖️ 等）——此前"🧠 渲成色块"是缩略图看走眼。大尺寸（60-120px）当插画用；方块底箭头类（⬆️📉）仍禁用
- **章节色彩层**：每章一个主题色 radial 光晕缓慢漂移（红=危机/金=钱/绿=增长/紫=品牌），六章观感"换房间"，不是 200 秒一张紫桌布
- **现成组件库**：`aapl0805/components/fun.jsx`（FloatWrap/Sparkles/MoneyRain/ConfettiBurst/Battery/EKG/Lifebuoy/Waves/SlamStamp/CoinStack/SweatDrops/QuestionScatter/Shimmer/TypingDots + rand 确定性伪随机），新工程直接抄
- **装饰层与 overlap-check**：钱雨/星光叠在卡片文字上属故意分层，扫描报告里人工放行；但粒子层别越出画底（MoneyRain h ≤ 画布高-14）；若该片恢复了字幕安全区，则裁在安全区之上

## 3. 动效语言（服务理解，不炫技）

| 意图 | 动效 |
|---|---|
| 元素登场 | spring 缩放弹入（damping 11-14），组内 stagger 6-20 帧 |
| 数字 | count-up 滚动（Easing.out(cubic)，30-44 帧），`fontVariantNumeric: tabular-nums` |
| 涨/跌 | 绿/红折线 strokeDashoffset 逐帧画出，端点脉冲圆点 |
| 冲击瞬间（暴跌等） | 大数字 overshoot 砸入 + 屏幕 shake 10 帧 + 红色闪光 opacity 0.14。**过冲上限**：局部数字/图章 from ≤1.3；全宽卡片/chip from ≤1.25，更大值入场瞬间会放大出框（用户实测投诉过） |
| 数量感 | 象形阵列逐个点亮（🚗×32、电池块 grid） |
| 对比/抉择 | 左右分屏交替脉冲、岔路口 svg 分支线生长 |
| 转变 | 硬币 rotateY 翻面（backfaceVisibility hidden 两面各一 div） |
| 场景切换（**分层级**） | 大章节切换：紫色涟漪径向擦除，切点前后各 **10** 帧（≈0.67s）；小节/同章节切换：**硬切**（场景自带弹入动效足够缓冲）。全片涟漪 ≤10 次——首版 13 个切点全用 14 帧涟漪被用户投诉"转场时间都很长" |
| 拍内切换（同场景多拍） | 上一拍 opacity/scale 退场 + 下一拍独立容器；退场要**退干净**（见坑 #2） |

节拍感：一个场景内每 2-4 秒必须有新元素进场或状态变化，跟着口播语义走；口播提到什么，什么才出现。

## 4. 踩坑清单（每条都真踩过）

1. **方块底 emoji 禁用**：⬆️⬇️➡️📉 这类自带灰蓝方块底的 emoji 在深色底上极其违和。箭头用 SVG path 画（纯色三角），跌幅用 🔻（无底色）。无底色 emoji（🚗🎈🤝🧠💰⚡）随便用
2. **拍间残影**：多拍场景，上一拍如果只降到 0.5 opacity 会和下一拍叠字。退场公式：`opacity = (1 - shift * 0.72) * nextBeatOut`，且和下一拍内容错开 y 区间
3. **中文字重**：PingFang SC 最粗 600，别写 700+（无效）。要真·粗用 `T.sourceH`（思源黑体 Heavy）/ `T.shuhei`（数黑体）。要更重的观感用白色+发光 textShadow；数字用 `-apple-system` 支持 800
4. **文字换行溢出**：大数字串（"$1800–1900亿"）必加 `whiteSpace: "nowrap"` 并预留宽度，字号宁小勿断行；决策树行超宽就砍文案，不要缩成两行
5. **连线要对准**：svg 分支线/牵引绳的端点必须对准目标元素中心 —— 给目标列固定 width，端点坐标按列中心算，别靠 flex 自动布局对齐
6. **比例锁定**：1:1 和 9:16 布局参数完全不同（每个 marginTop/字号都不同），中途换比例=所有场景重排。写代码前必须和用户敲定
7. **Edit 工具匹配**：中文文案里全角？！：和半角混用，Edit old_string 匹配失败时先 Read 原文
8. **背景 logo 矩阵**：装饰性 logo 群透明度 ≤ 0.55、避开主数字的 y 区间，出场后要在下一个主元素登场前淡出
9. **拍容器必须 flex 居中**：多拍场景的 absolute 全屏容器（`position:absolute; top:0; width:100%`）默认是块流，里面的 svg（inline）和 Pop/Chip（块级）会全部**靠左贴边**，连线也对不准居中的 logo 行。容器一律加 `display:"flex", flexDirection:"column", alignItems:"center"`，或每个子元素自带 `display:flex; justifyContent:center` 包一层
10. **带底色 emoji 黑名单补充**：📈📉⤴️⬆️ 在深色底上带白/蓝方块底，禁用；替代：涨跌用文字 ▲/🔻，箭头用 svg。已验证无底色可用：📊🐄🤑💥🗄️⏳🚪🎭🧊📦

## 5. 素材

- **公司 logo**：`curl -sL "https://assets.parqet.com/logos/symbol/<TICKER>?format=png&size=200" -o public/logos/<TICKER>.png`，方形品牌色块，直接圆角化即可；拉不到的公司用 `$TICKER` 药丸兜底
- **人物照片抠图**（高管/名人出场）：优先 Wikimedia Commons（CC 授权、高清），没有再从新闻源/官网找彩色正脸照 → rembg 抠图：`python3 -c "from rembg import remove; ..."`（已装，u2net 模型缓存在 ~/.u2net）→ `getbbox()` 裁掉透明边 → 存 `public/<slug>/xxx.png`。**验收**：合成到 #050505 黑底上肉眼检查发丝边缘有无杂色；黑白照和彩照别混用。上屏用 `components/Exec.jsx` 的 ExecQuote（照片侧滑入 + 引言气泡 + 姓名牌），口播"管理层说/预告"处是天然出场点
- **emoji 即插图**：macOS 本机渲染 Apple Color Emoji，无需额外字体
- 需要图表/仪表盘/晶圆等图形一律 svg 代码画，不找图片素材
- **白色 logo 变体**：深色 wordmark 上紫底看不清时，用 PIL 把不透明像素统一刷成 #F2ECFF 生成 `_white` 版（例：Anthropic_white.png）
