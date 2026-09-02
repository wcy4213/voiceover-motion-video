# Remotion 工程手册

## 0. 环境

- Node ≥ 18 + 包管理器（npm/pnpm 均可）
- 转写脚本依赖：`pip install funasr soundfile` + ffmpeg（首次运行自动下载 SenseVoice/fsmn-vad 模型，约 1GB）
- 本仓库 `template/` 是一个可直接使用的最小 Remotion 工程（含完整示例视频的全部场景代码，旧版深空紫皮肤）；`skins/` 是两套现行视觉皮肤组件库；`motionkit/` 是跨视频共享动效库

## 1. 起一个新视频

```bash
cp -r template my-video && cd my-video
npm install                      # 或 pnpm install
bash fetch_logos.sh              # 拉取示例场景用的公司 logo
cp <你的口播.mp3> public/audio/audio.mp3
npm run studio                   # Remotion Studio 实时预览
```

然后改四类文件：

| 文件 | 改什么 |
|---|---|
| `src/timeline.js` | FPS/DUR_FRAMES（=音频时长×30 向上取整）+ 全部 TL 帧标记（来自 align_tokens.py 输出） |
| `src/Video.jsx` | SCENES 场景数组；CHAPTERS 顶部章节标签；WIPES 转场切点；顶层挂 `<Disclaimer />` |
| `src/scenes/*.jsx` | 按新分镜重写（组件语汇沿用：Kicker/Chip/Pop/Rise/CountUp/TickerChip） |
| `src/Root.jsx` | Composition id、width/height（比例和用户确认，默认 1084×884）、durationInFrames |

**⚠️ 背景必改（2026-08 起投研线用黑底点阵）**：模板是旧紫底，复制后两处必换——① `theme.js` 换成 `skins/black-dotgrid/theme.js`（`bg: "#050505"`）；② `Video.jsx` 里的背景层（紫底涟漪 `Backdrop`）换成 `motionkit/DotGridBackdrop`（**每期换 seed/gap 至少一样**）。涟漪 `RippleWipe` 转场保留可用。投教纸面线则整套换 `skins/paper/`（PaperBackdrop + PageFlip）。

**⚠️ S0 开场不能沿用模板**：每条视频的 S0 封面帧必须重新设计（frame 0 完整可见的 日期+主视觉+标题，构图和历史成片不同），规范见 design-system.md §1.5——短视频平台会对首帧查重，沿用模板开场=被判批量同质化限流。

## 2. 组件速查

### template/src/components/（示例工程自带）

- `Backdrop` — 深空紫底 + 常驻涟漪。**已弃用为背景**（现行背景一律黑底点阵 DotGridBackdrop），只在维护老视频时会碰到
- `Pop / Rise` — 弹簧缩放入场 / 上浮淡入，均带 delay（帧）
- `CountUp` — 数字滚动，props: to/delay/dur/decimals/prefix/suffix
- `Chip / Kicker` — 药丸标签 / 小节标题（两侧短线）
- `useShake` — 冲击瞬间屏幕震动
- `TickerChip / Logo` — 公司出场规范组件（logo 圆角块 + $代码药丸）
- `ExecQuote`（components/Exec.jsx）— 高管/名人抠图出场：照片侧滑弹入 + 白色引言气泡 + 姓名牌，props: photo/name/title/quote/delay/photoH/side/quoteSize。照片是 public/<slug>/ 下的 rembg 抠图 png
- `Video.jsx` 里的 `ChapterTab`（顶部章节标签）和 `RippleWipe`（涟漪转场）直接复用；WIPES 数组**只放大章节切点**（分层转场，WIPE_HALF=10），小节切换靠 Sequence 硬切
- 示例场景即模式库：折线图逐帧画出（S1/S7）、象形阵列（S2 车辆/S5 电池）、仪表盘（S6 Gauge）、硬币翻面（S7）、横滑快卡+进度点（S8）、决策树（S9）

### skins/（两套现行皮肤，见各自 README）

- `skins/black-dotgrid/` — 投研线默认：Fx（CRT 雪花电视闪回 / Glitch 信号故障 / WindOutline 抠图风动描边 / BreakingTag+DateStamp 突发章）、fun（FloatWrap/MoneyRain/SlamStamp 等 14 个趣味组件）、ui、TickerChip、Disclaimer、Subtitle
- `skins/paper/` — 投教纸面线：PaperBackdrop / PaperCard / Polaroid / Highlighter / InkCircle / Stamp / StickyNote / PageFlip / Window / ChapterBar / Subtitle / Disclaimer + kit（H1/Label/Num/Hand/TickerPill/DrawLine）

多拍场景写法：一个 Sequence 内用局部帧常量（`const BEAT2 = TL.xx_beat2 - TL.xx`）分拍，各拍独立绝对定位容器 + 交叉淡入淡出。⚠️ `<Beat from={A} to={B}>` 的 `to` 一律等于下一拍的起始常量，**不加偏移**——写 `to={B+8}` 就人为造出 8 帧叠字。⚠️ 行内 span 的垂直 margin 无效（inline 元素 CSS 直接忽略），凡给 span 写 marginTop/Bottom 必须同时 `display:"inline-block"`。

### motionkit/ 跨视频共享组件库

`import {enter, DotGridBackdrop, KenBurns, DrawSVG} from '../motionkit/index.js';`

- `enter(name, frame, fps, {delay, dur, dist})` — 语义动画 preset（只填名字不写关键帧）：fadeIn/fadeInUp/fadeInDown/slideInLeft/slideInRight/zoomIn/popIn/blurIn/wipeReveal/riseRotate，过冲已钳制 ≤1.3；退场用 `exit(name, frame, {start, dur})`。**每期换 preset 组合 = 同类卡片入场不重样**
- `DotGridBackdrop` — **投研线标准背景**：近黑 #050505 + 点阵 + 漂移光晕（props: seed/gap/dot/dotColor/glow/glowColor/speed）。**每期换 seed/gap 至少一样**，防黑底同质化。⚠️ speed 是每帧噪声步进，用 0.005 量级；传 0.7+ 光晕会逐帧瞬移狂闪
- `NoiseBackdrop` — 旧紫底方案（深紫 + noise 光斑）。投研线已弃用，留作他用
- `KenBurns` — 静态图片缓推缓移（direction: in/out/left/right/up/down，amount 1.06~1.15）；更强的 2.5D 视差用 broll_fetch.py animate 预生成
- `DrawSVG` — SVG 路径描边"画出来"（@remotion/paths evolvePath）。素材：lucide.dev 1600+ 描边图标，把 path d 贴进 paths 数组即可，多条自动错峰
- 验证 demo：`npx remotion still ./motionkit/demo/index.jsx MotionKitDemo out/mk.png --frame=80`

依赖：`@remotion/{noise,paths,shapes,transitions,motion-blur}`（transitions/motion-blur 备用：转场纪律仍是"大章节涟漪、小节硬切"）。

### motionkit/three/ 3D 动效层

`import {ThreeStage, Bars3D, Globe3D} from '../motionkit/three/index.js';`（独立入口，2D 视频不背 three.js 包体）

- `ThreeStage` — @remotion/three 的 ThreeCanvas 外壳：透明背景叠在黑底点阵上、品牌灯光、相机 lookAt
- `Globe3D` — three-globe 地球（紫球面+经纬线+大气辉光+黄点位+资金流弧线），全球市场/资金流向/供应链场景
- `Bars3D` — 3D 柱阵（spring 错峰升起+整组缓转），数据对比的差异化画面
- ⚠️ **含 3D 的工程渲 still/render 命令一律加 `--gl=angle`**；动画只用 useCurrentFrame，禁 useFrame/clock
- 验证 demo：`npx remotion still ./motionkit/demo3d/index.jsx MotionKit3DDemo out/mk3d.png --frame=60 --gl=angle`
- 完整规则与确定性坑（three-globe animateIn 等）见 **references/three-motion.md**

3D 依赖：`three` `@remotion/three` `@react-three/fiber` `@react-three/drei` `three-globe`（全 MIT）。

## 3. 验证与渲染命令

```bash
# 编译自检（改完代码先跑，确认 composition 注册成功、时长对）
npx remotion compositions src/index.jsx

# 单帧静帧（关键帧抽查，作为图片查看）
npx remotion still src/index.jsx <CompId> out/stills/f<N>.png --frame=<N>

# 批量抽帧（一次 bundle 渲多帧，QC 提速一个量级）
node scripts/qc-stills.mjs src/index.jsx <CompId> 0,120,480,900

# 排版自动质检（重叠 + 出框，改完布局必跑，目标 0 组重叠）
node scripts/overlap-check.mjs src/index.jsx <CompId> 5 0.10

# 整片渲染（后台跑，~10-20 分钟）
npx remotion render src/index.jsx <CompId> "out/<成片名>.mp4" --codec=h264 --crf=17
```

抽帧策略：每场景 1-3 帧，选"信息最满"的时刻（所有 chip 已弹出）+ 拍间过渡时刻（查残影）。修完必须重渲同帧复核。

**超 4 分钟的片子**：单次 render 时间很长且易撞工具超时，可按 `--muted --frames=A-B` 分 2-3 段渲（各 ≈4000 帧），ffmpeg concat 后一次性 mux 音轨（音频完整无接缝）。

## 4. 交付清单

1. `ffprobe` 确认：分辨率、30fps、时长≈音频时长、有 aac 音轨
2. 从成片 `ffmpeg -ss <t> -frames:v 1` 抽 2 帧确认封装无误（选一个转场瞬间 + 一个场景中段），另抽 **frame 0** 核对封面规范（日期+主视觉+差异化，见 design-system.md §1.5），通过后存档到 `out/stills/covers/<slug>_f0.png`
3. **免责水印验收**：从成片随机抽 3 帧（开头/中段/结尾各一），确认每帧右上角或左下角均可见免责水印文字。任何一帧缺失 = `<Disclaimer />` 没挂在 Video.jsx 顶层，修复后重渲
4. 成片拷到音频所在目录，命名 `<主题>_<日期>_<比例>.mp4`
5. 汇报：路径、参数、分镜清单（每场景一句话）、提示"报分镜编号可微调"

## 5. 已知边界

- 渲染并行乱序：场景代码里禁止 useState 驱动动画、禁止 Date.now()/Math.random()（确定性伪随机用 `fun.jsx` 的 `rand(i, seed)`）
- 时长改了记得同步：timeline.js 的 DUR_FRAMES、Root.jsx durationInFrames、最后一个场景的收尾淡出帧
- 场景引用 `TL.xxx` 时 timeline.js 里必须真有这个键——键缺失 → NaN → interpolate(NaN) 不报错、opacity 被当 1 渲，前后两拍全程叠屏。改完 timeline 跑 `grep -ho "TL\.[a-z0-9]*" scenes/*.jsx | sort -u` 对账
- 宽 logo（如横排字标）上屏用 width 限宽，别用 height（会放大爆版）
- emoji 渲染依赖系统 emoji 字体：macOS 本机效果最佳；Linux 渲染节点需安装 Noto Color Emoji 并自查静帧
