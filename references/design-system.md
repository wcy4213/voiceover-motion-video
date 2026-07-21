# 设计规范 · Bobby AI 动效解说视频

写任何场景代码前读完本文。规范分三层：品牌 tokens（不能改）、动效语言（默认遵循）、踩坑清单（血泪教训，别再踩）。

## 1. 品牌 tokens（示例品牌包：RockFlow / Bobby AI。换品牌 = 只改这套 tokens，其余动效语言通用）

```js
// theme.js —— 新工程直接抄
export const C = {
  bg: "#1D0038",          // 深空紫底
  purple: "#6F00FF",       // 品牌紫（卡片强底、节点）
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
```

- **黄色纪律**：黄是稀缺资源。日历高亮环、全片核心问题、"历史第二高"这类点睛处才用；到处用黄=没有重点
- **视觉母题**：紫色涟漪径向扩散（背景常驻低调涟漪 + 场景转场涟漪擦除 + 收尾涟漪呼应）
- **品牌形象**：✦ 星芒 + "Bobby AI" 字标做片头点缀和片尾落版

## 2. 内容与排版纪律

- **文字纪律**：屏上只有关键词、数字、emoji、logo。口播讲整句，屏幕只给锚点。一行关键词 > 一段话。ASR 错字按正确写法上屏（Megapack/CapEx/FSD/18A…），数字以口播为准
- **公司出场规范**：官方 logo（parqet CDN 方形色块图，`borderRadius: size*0.24` 做成 app-icon 风）+ 中文名 + `$TICKER` 药丸。首次出场用大 TickerChip 弹簧入场，之后小尺寸出现在章节标签/决策树里
- **信息层级字号**（1:1 画布参考）：巨数字 128-170 / 标题 72-86 / 关键词行 40-54 / chip 26-40 / 免责小字 26
- **顶部章节标签**（ChapterTab）：讲多家公司/多章节的视频必备，顶部居中小药丸显示"当前讲到谁"，mini logo + 文案，跨场景持续。场景内的 kicker 标题 marginTop ≥ 100 给它让位
- **安全区**：1:1 画布四边留 ≥ 80px；卡片宽度 ≤ 920

## 3. 动效语言（服务理解，不炫技）

| 意图 | 动效 |
|---|---|
| 元素登场 | spring 缩放弹入（damping 11-14），组内 stagger 6-20 帧 |
| 数字 | count-up 滚动（Easing.out(cubic)，30-44 帧），`fontVariantNumeric: tabular-nums` |
| 涨/跌 | 绿/红折线 strokeDashoffset 逐帧画出，端点脉冲圆点 |
| 冲击瞬间（暴跌等） | 大数字 from=1.9 overshoot 砸入 + 屏幕 shake 10 帧 + 红色闪光 opacity 0.14 |
| 数量感 | 象形阵列逐个点亮（🚗×32、电池块 grid） |
| 对比/抉择 | 左右分屏交替脉冲、岔路口 svg 分支线生长 |
| 转变 | 硬币 rotateY 翻面（backfaceVisibility hidden 两面各一 div） |
| 场景切换 | 紫色涟漪径向擦除：切点前后各 14 帧，圆形 radial-gradient 先盖满再收走 |
| 拍内切换（同场景多拍） | 上一拍 opacity/scale 退场 + 下一拍独立容器；退场要**退干净**（见坑 #2） |

节拍感：一个场景内每 2-4 秒必须有新元素进场或状态变化，跟着口播语义走；口播提到什么，什么才出现。

## 4. 踩坑清单（每条都真踩过）

1. **方块底 emoji 禁用**：⬆️⬇️➡️📉 这类自带灰蓝方块底的 emoji 在深紫底上极其违和。箭头用 SVG path 画（纯色三角），跌幅用 🔻（无底色）。无底色 emoji（🚗🎈🤝🧠💰⚡）随便用
2. **拍间残影**：多拍场景，上一拍如果只降到 0.5 opacity 会和下一拍叠字。退场公式：`opacity = (1 - shift * 0.72) * nextBeatOut`，且和下一拍内容错开 y 区间
3. **中文字重**：PingFang SC 最粗 600，别写 700+（无效）。要更重的观感用白色+发光 textShadow；数字用 `-apple-system` 支持 800
4. **文字换行溢出**：大数字串（"$1800–1900亿"）必加 `whiteSpace: "nowrap"` 并预留宽度，字号宁小勿断行；决策树行超宽就砍文案，不要缩成两行
5. **连线要对准**：svg 分支线/牵引绳的端点必须对准目标元素中心 —— 给目标列固定 width，端点坐标按列中心算，别靠 flex 自动布局对齐
6. **比例锁定**：1:1 和 9:16 布局参数完全不同（每个 marginTop/字号都不同），中途换比例=所有场景重排。写代码前必须和用户敲定
7. **Edit 工具匹配**：中文文案里全角？！：和半角混用，Edit old_string 匹配失败时先 Read 原文
8. **背景 logo 矩阵**：装饰性 logo 群透明度 ≤ 0.55、避开主数字的 y 区间，出场后要在下一个主元素登场前淡出

## 5. 素材

- **公司 logo**：`curl -sL "https://assets.parqet.com/logos/symbol/<TICKER>?format=png&size=200" -o public/logos/<TICKER>.png`，方形品牌色块，直接圆角化即可；拉不到的公司用 `$TICKER` 药丸兜底
- **emoji 即插图**：macOS 本机渲染 Apple Color Emoji，无需额外字体
- 需要图表/仪表盘/晶圆等图形一律 svg 代码画，不找图片素材
