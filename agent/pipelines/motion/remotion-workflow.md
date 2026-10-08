# Remotion 工程手册

## 0. 环境

- 工程：`./`（Remotion 4.x，pnpm，依赖已装好，自带渲染用 Chrome）
- Node 走 nvm，任何命令前先：
  ```bash
  export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null 2>&1
  ```
- 转写用系统 python：`python3`（funasr 已装）
- 工程原有 `motion/` 插件机制**不要动**，我们用 `REMOTION_ENTRY_POINT` 环境变量走独立入口，互不干扰

## 1. 起一个新视频（从模板复制）

**模板选 `googleq2/`**（第二个成片，比 `earnings/` 新：多了 Exec 高管出场组件、底部字幕安全区、分层转场 WIPE_HALF=10）。新视频取一个 slug（如 `fedcut0801`）：

```bash
cd .
cp -r googleq2 <slug>
mkdir -p public/<slug>
cp <口播音频> public/<slug>/audio.mp3
```

然后改四类文件：

| 文件 | 改什么 |
|---|---|
| `<slug>/timeline.js` | FPS/DUR_FRAMES（=时长×30 向上取整）+ 全部 TL 帧标记（来自 align_marks.py 输出） |
| `<slug>/Video.jsx` | Audio 的 staticFile 路径→`<slug>/audio.mp3`；SCENES 数组；CHAPTERS 章节标签；WIPES 转场切点 |
| `<slug>/scenes/*.jsx` | 按新分镜重写（组件语汇沿用：Kicker/Chip/Pop/Rise/CountUp/TickerChip） |
| `<slug>/Root.jsx` | Composition id（如 `FedCut0801`）、width/height（比例用户定）、durationInFrames |

`components/`（ui 工具集、TickerChip）一般原样保留。新公司 logo 拉到 `public/logos/`。

**⚠️ 背景必改（2026-08-10 起黑底点阵）**：老模板是紫底，复制后两处必换——① `theme.js` 的 `bg` 改 `#050505`；② `Video.jsx` 里的背景层（紫底涟漪 `Backdrop` 或 `NoiseBackdrop`）换成 `motionkit/DotGridBackdrop`（每期换 seed/gap）。涟漪 `RippleWipe` 转场保留可用。

**⚠️ S0 开场不能沿用模板**：每条视频的 S0 封面帧必须重新设计（frame 0 完整可见的 日期+抠图主视觉+标题，构图和历史成片不同），规范见 design-system.md §1.5——抖音会对首帧查重，沿用模板开场=被判批量同质化限流。

## 2. 组件速查（components/ 与场景内已有实现）

- `Backdrop` — 深空紫底 + 常驻涟漪。**已弃用为背景**（2026-08-10 起背景一律黑底点阵 DotGridBackdrop），只在维护老视频时会碰到
- `Pop / Rise` — 弹簧缩放入场 / 上浮淡入，均带 delay（帧）
- `CountUp` — 数字滚动，props: to/delay/dur/decimals/prefix/suffix
- `Chip / Kicker` — 药丸标签 / 小节标题（两侧短线）
- `useShake` — 冲击瞬间屏幕震动
- `TickerChip / Logo` — 公司出场规范组件
- `ExecQuote`（googleq2/components/Exec.jsx）— 高管/名人抠图出场：照片侧滑弹入 + 白色引言气泡 + 姓名牌，props: photo/name/title/quote/delay/photoH/side/quoteSize。照片是 public/<slug>/ 下的 rembg 抠图 png
- `Video.jsx` 里的 `ChapterTab`（顶部章节标签）和 `RippleWipe`（涟漪转场）直接复用；WIPES 数组**只放大章节切点**（分层转场），小节切换靠 Sequence 硬切
- 现成场景模式可抄：折线图逐帧画出（S1/S7）、象形阵列（S2 车辆/S5 电池）、仪表盘（S6 Gauge）、硬币翻面（S7）、横滑快卡+进度点（S8）、决策树三剧本（S9）

多拍场景写法：一个 Sequence 内用局部帧常量（`const BEAT2 = TL.xx_beat2 - TL.xx`）分拍，各拍独立绝对定位容器 + 交叉淡入淡出。

### motionkit/ 跨视频共享组件库（2026-07 开源调研落地）

`import {enter, DotGridBackdrop, KenBurns, DrawSVG} from '../motionkit/index.js';`

- `enter(name, frame, fps, {delay, dur, dist})` — 语义动画 preset（FFCreator 思路，只填名字不写关键帧）：fadeIn/fadeInUp/fadeInDown/slideInLeft/slideInRight/zoomIn/popIn/blurIn/wipeReveal/riseRotate，过冲已钳制 ≤1.3；退场用 `exit(name, frame, {start, dur})`。**每期换 preset 组合 = 同类卡片入场不重样**
- `DotGridBackdrop` — **标准背景（2026-08-10 起）**：近黑 #050505 + 点阵 + 漂移光晕（props: seed/gap/dot/dotColor/glow/glowColor/speed）。**每期换 seed/gap 至少一样**，防黑底同质化
- `NoiseBackdrop` — 旧紫底方案（深紫 + noise 光斑）。**投研线已弃用**，留作他用
- `KenBurns` — 静态图片缓推缓移（direction: in/out/left/right/up/down，amount 1.06~1.15）；更强的 2.5D 视差用 broll_fetch.py animate 预生成
- `DrawSVG` — SVG 路径描边"画出来"（@remotion/paths evolvePath）。素材：lucide.dev 1600+ 描边图标（candlestick-chart/banknote/trending-up…），把 path d 贴进 paths 数组即可，多条自动错峰
- 验证 demo：`REMOTION_ENTRY_POINT=./motionkit/demo/index.jsx node scripts/remotion-cli.mjs still ./motionkit/demo/index.jsx MotionKitDemo out/stills/mk.png --frame=80`

依赖已装：`@remotion/{noise,paths,shapes,transitions,motion-blur}@4.0.438`（transitions/motion-blur 备用：转场纪律仍是"大章节涟漪、小节硬切"）。

### motionkit/three/ 3D 动效层（2026-08 three.js 开源生态落地）

`import {ThreeStage, Bars3D, Globe3D} from '../motionkit/three/index.js';`（独立入口，2D 视频不背 three.js 包体）

- `ThreeStage` — @remotion/three 的 ThreeCanvas 外壳：透明背景叠在黑底点阵上、品牌灯光、相机 lookAt
- `Globe3D` — three-globe 地球（紫球面+经纬线+大气辉光+黄点位+资金流弧线），全球市场/资金流向/供应链场景
- `Bars3D` — 3D 柱阵（spring 错峰升起+整组缓转），数据对比的差异化画面
- ⚠️ **含 3D 的工程渲 still/render 命令一律加 `--gl=angle`**；动画只用 useCurrentFrame，禁 useFrame/clock
- 验证 demo：`REMOTION_ENTRY_POINT=./motionkit/demo3d/index.jsx node scripts/remotion-cli.mjs still ./motionkit/demo3d/index.jsx MotionKit3DDemo out/stills/mk3d.png --frame=60 --gl=angle`
- 完整规则/项目清单/确定性坑（three-globe animateIn 等）见 **references/three-motion.md**

依赖已装：`three@0.185.1` `@remotion/three@4.0.438` `@react-three/fiber@9.7.0` `@react-three/drei@10.7.8` `three-globe@2.45.2`（全 MIT）。


### motionkit 新层（2026-10-08 video-agent 重构）

`import {useFonts, T, PAIRS, Camera, Parallax, Punch, useWhip, Shot, LeakAt, Candles, SplitFlap} from '../motionkit/index.js';`

- **字体 `type.js`**：`useFonts(['shuhei','smiley'])` 在 Video 组件体内调一次（FontFace + delayRender，字体文件在 `public/fonts/`，19 款免费商用）；`fontFamily: T.shuhei`；配对速查 `PAIRS.impact/kinetic/editorial/terminal/poster/guofeng/friendly/variety`。样张 `REMOTION_ENTRY_POINT=./motionkit/demo-type/index.jsx node scripts/remotion-cli.mjs still ./motionkit/demo-type/index.jsx TypeSpecimen out/stills/type_specimen.png --frame=0`。⚠️ `"Hannotate SC"`/`"Kaiti SC"` 本机没装，会静默回退 PingFang
- **镜头 `camera.jsx`**：`<Camera move="push|pull|panL|panR|rise|drift|still" dur>` 包场景；`<Punch at={[帧]}>` 重音冲击；`<Parallax depth={0.2|1|1.4}>` 纵深；`useWhip(cut, dir)` 快甩
- **切点 `seams.jsx`**：`<Shot dur enter="curve|rise|zoom|pull|none" exit=... dir={1|-1} still0>` 包在每个场景 Sequence 里（封面场景传 `still0`，frame 0 不做入场）；`<LeakAt at seed hueShift>` 在硬切上叠官方 WebGL 光漏——**用了 LeakAt 的工程 still/render 都要加 `--gl=angle`**
- **金融 `finance.jsx`**：`<Candles data={[{o,h,l,c,t}]} reveal>` K 线逐根生长（涨绿跌红，数据放 `public/data/*.json`，不在渲染时联网）；`<SplitFlap text="7.21万亿">` 翻牌数字。demo：`motionkit/demo-fin/`
- **皮肤 `skins/<id>/kit.jsx`**：terminal / swiss / glass / brutal，契约见 `skins/README.md`；`cp -r skins/<id> <slug>/skin` 后场景 `import {...} from '../skin/kit.jsx'`
- **MG `mg.jsx`**：`Morph/Burst/Ring/FlowLine/KineticWords/LiquidReveal/LottieClip`（demo `motionkit/demo-mg/`）
- **3D 扩充 `three/`**：`Number3D/Coin3D/IsoCity3D/Particles3D/Card3D`（demo `motionkit/demo3d-v2/`，`--gl=angle`）；3D 拉丁字体 `scripts/tools/ttf2typeface.mjs`
- **音效 `sfx.jsx`**：`SfxTrack` + `public/sfx/`（`scripts/tools/make_sfx.py` 自合成）
- 完整技术清单见 `agent/techniques.md`
- Remotion API 细节查 `remotion-best-practices` skill（官方，钉 4.0.437 版，与本机 4.0.438 匹配）；新装 `@remotion/light-leaks`、`@remotion/captions`（4.0.438）

## 3. 验证与渲染命令

```bash
cd .

# 编译自检（改完代码先跑，确认 composition 注册成功、时长对）
REMOTION_ENTRY_POINT=./<slug>/index.jsx node scripts/remotion-cli.mjs compositions ./<slug>/index.jsx

# 单帧静帧（关键帧抽查，Read 当图片看）
REMOTION_ENTRY_POINT=./<slug>/index.jsx node scripts/remotion-cli.mjs still \
  ./<slug>/index.jsx <CompId> out/stills/f<N>.png --frame=<N>

# 整片渲染（后台跑，~10-20 分钟）
REMOTION_ENTRY_POINT=./<slug>/index.jsx node scripts/remotion-cli.mjs render \
  ./<slug>/index.jsx <CompId> "out/<成片名>.mp4" --codec=h264 --crf=17 --concurrency=8
```

抽帧策略：每场景 1-3 帧，选"信息最满"的时刻（所有 chip 已弹出）+ 拍间过渡时刻（查残影）。修完必须重渲同帧复核。

## 4. 交付清单

1. `ffprobe` 确认：分辨率、30fps、时长≈音频时长、有 aac 音轨
2. 从成片 `ffmpeg -ss <t> -frames:v 1` 抽 2 帧确认封装无误（选一个转场瞬间 + 一个场景中段），另抽 **frame 0** 核对封面规范（日期+抠图+差异化，见 design-system.md §1.5），通过后存档到 `out/stills/covers/<slug>_f0.png`
3. **免责水印验收**：从成片随机抽 3 帧（开头/中段/结尾各一），确认每帧右上角或左下角均可见免责水印文字。如任何一帧缺失，说明 `<Disclaimer />` 组件未挂在 Video.jsx 顶层——修复后重渲
4. `cp` 成片到音频所在目录，命名 `<主题>_<日期>_<比例>.mp4`
5. 汇报：路径、参数、分镜清单（每场景一句话）、提示"报分镜编号可微调"

## 5. 已知边界

- 渲染并行乱序：场景代码里禁止 useState 驱动动画、禁止 Date.now()/Math.random()
- `remotion-render.mjs` 脚本是给旧插件透明叠层用的（ProRes 4444），**别用它**，用上面的 remotion-cli.mjs render
- 时长改了记得同步三处：timeline.js 的 DUR_FRAMES、Root.jsx durationInFrames（如果没引用常量）、最后一个场景的收尾淡出帧
