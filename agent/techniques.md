# 技术工具箱（3D / MG / 2.5D / 实拍 / AI 生成 / 贴纸 / 录屏 / 数据可视化）

> 工程：`./`。2D 组件 `import {...} from '../motionkit/index.js'`；3D 独立入口 `'../motionkit/three/index.js'`。
> 样张命令统一：`REMOTION_ENTRY_POINT=./<demo>/index.jsx node scripts/remotion-cli.mjs still ./<demo>/index.jsx <CompId> out/stills/x.png --frame=N [--gl=angle]`
> Remotion API 细节查 `remotion-best-practices` skill；复杂动作（落地/撞击/甩出）先用 `disney-animation-rule-skill` 拆姿态表。

## 1. MG 动画（Motion Graphics，2D 矢量动效）—— `motionkit/mg.jsx`

| 组件 | 做什么 | 典型用法 |
|---|---|---|
| `Morph from to at dur` | SVG 图形平滑变形（`SHAPES`: circle/square/up/down/diamond/bolt 或任意 path） | 圆 → 上涨箭头、闪电 → 下跌、饼 → 柱 |
| `Burst at radius` | 冲击放射线 | 巨数字落地、印章砸下的同一帧 |
| `Ring value label` | 环形占比 + count-up | "73% 是老股东在卖" |
| `FlowLine d` | 路径先画出，再虚线流动 + 光点跑 | 资金流向、传导链、供应链 |
| `KineticWords words=[{t,at,fx}]` | 按口播逐**词**出现（slam/rise/slide/scale/blur） | 开场金句、段落结论；`at` 用 align_tokens 帧号 |
| `LiquidReveal at cx cy` | 有机液态形状长满全屏露出下一画面 | 大章节换底 |
| `LottieClip src` | 播 Lottie JSON（放 `public/lottie/`） | 图标动画、装饰；LottieFiles 免费动画单个看许可 |
| `DrawSVG paths` | 线稿逐笔画出（lucide 图标） | 白板/线稿风、图标出场 |
| `enter/exit` presets | 语义入场退场 | 卡片、标签 |

样张：`motionkit/demo-mg/`（`MGDemo`，0/60/120/180/240/300 帧各一种）。

## 2. 3D —— `motionkit/three/`（**still/render 必须加 `--gl=angle`**）

| 组件 | 做什么 | 适配 |
|---|---|---|
| `ThreeStage` | 透明 3D 舞台外壳（品牌灯光） | 所有 3D 场景的外层，叠在任意皮肤底上 |
| `Number3D value suffix` | 立体挤出数字 count-up，自动适配宽度 | 全片最大那个数（第二钩子位） |
| `Coin3D` | 抽象硬币翻转落下（无币种、无真钞，合规） | 费用、成本、收益的图形化 |
| `IsoCity3D data highlight` | 等距数据城市，每栋楼一个数据点 | 市值/营收/持仓排名，"谁是城里最高的楼" |
| `Particles3D shape` | 散点云聚合成球/环/网格 | 资金汇聚、数据涌入、AI 计算 |
| `Card3D src` | 漂浮的 3D 卡片/屏幕（贴图） | logo、产品图、Bobby 回答截图（抖音可放信息查询类、不放交易界面；小红书版不放任何 Bobby 界面） |
| `Bars3D` / `Globe3D` | 3D 柱阵 / 数据地球 | 对比 / 全球资金流 |

- 3D 拉丁字体：`node scripts/tools/ttf2typeface.mjs <ttf> public/fonts/<name>.typeface.json`，再在 `motionkit/three/useFont3D.js` 里 import 登记（**必须同步 import**，异步 fetch 会截到空帧）。中文不做 3D 字，用 2D 叠在 3D 上。
- 异步贴图一律用 `useCanvasAsset`（delayRender → 加载 → advance 重画 → continueRender），否则截到空画面（10-08 实测）。
- 金属度别太高（≤0.3）：没有环境贴图时高金属度会发黑。
- 3D 场景每期 ≤ 全片 1/4；渲染比 2D 慢 2–4 倍。
- 样张：`motionkit/demo3d-v2/`（`MotionKit3DV2`）。

## 3. 2.5D / 视差
- `KenBurns`（图片缓推）、`Camera/Parallax`（镜头层纵深）、`broll_fetch.py animate`（depthflow 把静态照片做成 2.5D 运镜视频，见 `pipelines/motion/broll-assets.md`）。

## 4. 实拍 / B-roll
- 规则与来源：`pipelines/motion/broll-assets.md`（Pexels/Pixabay API、官方 PD 源、官方频道 yt-dlp 原流；**绝不去水印**）；台账防跨期复用。
- 开场默认主角实拍打底（leopold 式，`pipelines/motion/design-system.md` §1.5.1）。

## 5. AI 生成（图 / 视频）
- chatcut 插件：`image-gen`（gpt-image-2 / nano-banana）、`video-gen`（Seedance 2.0 / Kling，文生/图生/首尾帧）。**需要用户先在 /mcp 授权 chatcut**。
- 适用：素材降级阶梯走到底时（没有实拍、没有照片的实物/场景）、贴纸角色的新道具（Monica 4 合 1 拼图流程见 `pipelines/sticker/README.md`）。
- 红线：不生成真实名人形象（小红书 09-09 判"伪造名人"）；片内/发布时勾 AI 生成声明；生成清单单独列给用户确认。

## 6. 动态排版（kinetic typography）
- `KineticWords`（逐词）、皮肤自带 `Headline`（逐行遮罩升起 / 模糊对焦 / 砸入）、`SplitFlap`（翻牌）。
- 字体：`motionkit/type.js` 的 `PAIRS`；一条片子 1 款展示字体。

## 7. 数据可视化
- `Candles`（K 线）、`SplitFlap`、`Ring`、`Bars3D`、`IsoCity3D`、折线（`evolvePath`）、bar race（格式 F10）。
- 数据一律离线 json 放 `public/data/`，渲染时不联网；数字按脚本原意核对（"26pp ≠ 26%"）。

## 8. 贴纸角色剧（Bobbie / Rich）
- 全流程见 `pipelines/sticker/README.md`（方格纸 3:4、字级对齐、Monica 拼图生素材、跳闪 QC）。

## 9. 录屏产品短片
- App 录屏剪英文配音短片：流水线。国内平台不演示交易功能。

## 10. 镜头 / 切点 / 质感
- `Camera/Punch/Parallax/useWhip`（`motionkit/camera.jsx`）、`Shot/LeakAt`（`motionkit/seams.jsx`）、皮肤自带 `Wipe`、颗粒/胶片（纪录片胶片皮肤，grain 0.28 静态 PNG）。

## 11. 字体
- `motionkit/type.js`：`useFonts([...])` + `T.<key>` + `PAIRS`。许可状态见 `craft/fonts-license.md`（10-08 逐款核验）。

## 12. 声音（音效层）—— `motionkit/sfx.jsx`
- `SfxTrack cues=[{at, s, v?}]`：`at` = 声音峰值应落的帧；`s` ∈ whoosh / swish / hit / stamp / pop / tick / riser；`tickCues(from, dur)` 给 count-up 配滴答。
- 素材 `public/sfx/*.wav` 由 `scripts/tools/make_sfx.py` **程序合成**（零版权）；改参数重跑出新变体。
- 纪律：口播下 SFX ≤0.35 音量；hit/stamp 与整屏冲击同配额（≤1 次/分钟）；whoosh 只给大章节；BGM 不烧进成片（发布时用平台曲库）。

## 13. 包装手法（10-08 抖音 AI vibe 调研可借项，Remotion 直接能做）
- **场景标签条 + 角色资料卡 HUD**：左上"📍 期货交易所"标签条；角色出场带资料卡（名字/属性/当前数字）——F18/F19 必备。
- **开场两行大字问句**，关键词标红；或反向钩子（"别再…"）。
- **"AI 生成"角标**：用了 AI 生图/生视频的镜头右上角小字角标（与免责水印同层）。
- **制作参数片尾卡**：落版前 1s "数据由 Bobby AI 整理 · 用时 XX 秒 · 来源 N 个"（品牌露出 + 可信度）。
- **口诀歌卡片**：卡片切换卡在 BGM/口播节拍上（KineticWords + SfxTrack tick）。
- **指令 vs 结果对照**：F20 的左右对照卡，红叉绿勾。
- **2.5D 一镜到底近似**：多张 AI 生图/照片做纵深层，Camera push 穿过（真一镜到底需 AI 视频）。

## 14. 幕间与界面道具（10-08，对标小红书「Opus 10 分钟 Figma 动态广告」拆解）
参考片 24s 的三件事我们以前没有：常驻吉祥物 + 转场从内容里长出来 + 按幕整块换底色。现在都有组件：
- **`acts.jsx`**：`ColorFlood acts=[{at,color,wipe}]`（按幕换底，diagonal/up/left/iris 扫入，放所有场景下面）；`Carry keyframes=[{at,x,y,w,h,rot,opacity}]`（共享元素跨场景连续运动，放顶层）；`NestZoom at to`（上一场整屏缩成下一场里的一张卡片，上一场 Sequence 要延长）。
- **`uiprops.jsx`**：`Cursor`（光标沿关键帧走 + click 涟漪）、`SelectionBox`（蓝框四手柄"选中"）、`Toggle`、`ChatBubble`（user/bot，typing 用字符串切片）、`StickerPill`（黑描边贴纸标签）、`OrbitRing`（logo 书挡）。全是抽象道具不是截图。
- **`buddy.jsx`**：`BobbyBuddy corner says=[{at,text,hold}]` 常驻小伙伴（官方 icon + 气泡）。海外/抖音可常驻，**小红书不用**。
- **皮肤 `skins/uimotion`**：以上三样的整合皮肤（米白/橙/紫/绿按幕换底 + 窗口面板 + 贴纸字）。Bobby 是 AI 产品，这是最贴身份的一套；也是 F20「问错 vs 问对」和海外投放的默认皮肤。
- ⚠️ 写法坑：`<Sequence>` 里组件的 `at` 是**局部帧**（从 from 起算）；顶层 Carry / Buddy / ColorFlood 才用全局帧。demo：`motionkit/demo-ui/`。
- **节拍网格** `scripts/beat_grid.py music.mp3 --snap-frames 帧,帧`：音乐烧进成片的版本（TikTok/Shorts/YT/投放）切点和关键动作吸到强拍；位移 >0.6s 报警（改分镜而不是硬拉）。抖音/小红书用平台曲库，不用。
