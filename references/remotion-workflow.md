# Remotion 工程手册

## 0. 环境

- Node ≥ 18 + 包管理器（npm/pnpm 均可）
- 转写脚本依赖：`pip install funasr soundfile` + ffmpeg（首次运行自动下载 SenseVoice/fsmn-vad 模型，约 1GB）
- 本仓库 `template/` 是一个可直接使用的最小 Remotion 工程（含完整示例视频的全部场景代码）

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
| `src/timeline.js` | FPS/DUR_FRAMES（=音频时长×30 向上取整）+ 全部 TL 帧标记（来自 align_marks.py 输出） |
| `src/Video.jsx` | SCENES 场景数组；CHAPTERS 顶部章节标签；WIPES 转场切点 |
| `src/scenes/*.jsx` | 按新分镜重写（组件语汇沿用：Kicker/Chip/Pop/Rise/CountUp/TickerChip） |
| `src/Root.jsx` | Composition id、width/height（比例和用户确认）、durationInFrames |

`src/theme.js`（品牌 tokens）、`src/components/`（Backdrop 涟漪、ui 工具集、TickerChip）一般原样保留；换品牌只改 theme.js。

## 2. 组件速查

- `Backdrop` — 深色底 + 常驻涟漪（1:1 画布 cy=560、PERIOD=880；9:16 需调 cy≈980）
- `Pop / Rise` — 弹簧缩放入场 / 上浮淡入，均带 delay（帧）
- `CountUp` — 数字滚动，props: to/delay/dur/decimals/prefix/suffix
- `Chip / Kicker` — 药丸标签 / 小节标题（两侧短线）
- `useShake` — 冲击瞬间屏幕震动
- `TickerChip / Logo` — 主体出场规范组件（logo 圆角块 + $代码药丸）
- `ExecQuote`（components/Exec.jsx）— 高管/名人抠图出场：照片侧滑弹入 + 白色引言气泡 + 姓名牌，props: photo/name/title/quote/delay/photoH/side/quoteSize。照片是 public/<slug>/ 下的 rembg 抠图 png
- `Video.jsx` 里的 `ChapterTab`（顶部章节标签）和 `RippleWipe`（涟漪转场）直接复用；WIPES 数组**只放大章节切点**（转场分层级，WIPE_HALF=10），小节切换靠 Sequence 硬切
- 示例场景即模式库：折线图逐帧画出（S1/S7）、象形阵列（S2 车辆/S5 电池）、仪表盘（S6 Gauge）、硬币翻面（S7）、横滑快卡+进度点（S8）、决策树（S9）

多拍场景写法：一个 Sequence 内用局部帧常量（`const BEAT2 = TL.xx_beat2 - TL.xx`）分拍，各拍独立绝对定位容器 + 交叉淡入淡出。

## 3. 验证与渲染命令

```bash
# 编译自检（改完代码先跑，确认 composition 注册成功、时长对）
npx remotion compositions src/index.jsx

# 单帧静帧（关键帧抽查，作为图片查看）
npx remotion still src/index.jsx <CompId> out/stills/f<N>.png --frame=<N>

# 整片渲染（后台跑，~10-20 分钟）
npx remotion render src/index.jsx <CompId> "out/<成片名>.mp4" --codec=h264 --crf=17
```

抽帧策略：每场景 1-3 帧，选"信息最满"的时刻（所有 chip 已弹出）+ 拍间过渡时刻（查残影）。修完必须重渲同帧复核。

## 4. 交付清单

1. `ffprobe` 确认：分辨率、30fps、时长≈音频时长、有 aac 音轨
2. 从成片 `ffmpeg -ss <t> -frames:v 1` 抽 2 帧确认封装无误（选一个转场瞬间 + 一个场景中段）
3. 成片拷到音频所在目录，命名 `<主题>_<日期>_<比例>.mp4`
4. 汇报：路径、参数、分镜清单（每场景一句话）、提示"报分镜编号可微调"

## 5. 已知边界

- 渲染并行乱序：场景代码里禁止 useState 驱动动画、禁止 Date.now()/Math.random()
- 时长改了记得同步：timeline.js 的 DUR_FRAMES、Root.jsx durationInFrames、最后一个场景的收尾淡出帧
- emoji 渲染依赖系统 emoji 字体：macOS 本机效果最佳；Linux 渲染节点需安装 Noto Color Emoji 并自查静帧
