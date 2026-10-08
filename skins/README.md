# skins/ · 皮肤注册表（video-director 2026-10-08 重构）

**皮肤 = 一套可整体替换的视觉语言**（底 + 字体配对 + 色板 + 质感 + 入场签名 + 转场 + 封面构图）。
同一份分镜换皮肤就是另一条肉眼完全不同的片子 —— 这是"每条和前几期不一样"最便宜的手段。

## 皮肤契约（同名换肤法的正式版）

每个 `skins/<id>/kit.jsx` 导出同一组组件，场景代码只引用这些名字，换皮肤 = 换 import 路径：

| 组件 | 职责 |
|---|---|
| `SKIN` | 元信息：id / 中文名 / 适用线别 / 色板 / 字体配对 / 动效签名 |
| `Backdrop` | 全屏底（每期换 seed 防同质化） |
| `Enter` | 皮肤签名入场（包任意元素；frame 0 元素传 `still` 直接终态） |
| `Headline` | 大标题，`accent` 关键词用皮肤自己的强调法（荧光/描边/色块/下划线…） |
| `Hero` | 巨数字 count-up（`value/prefix/suffix/decimals/color`） |
| `Label` | 小标签 / chip（≤8 字） |
| `Delta` | 涨跌指示（▲绿 / ▼红，涨绿跌红固定） |
| `Mark` | 强调包裹（圈 / 划线 / 高亮，皮肤自定） |
| `Stamp` | 结论章 / 判词 |
| `Panel` | 主内容容器（卡片/版块/窗口…） |
| `Photo` | 人物/产品图（抠图或原照），带皮肤化的边框处理 |
| `DateMark` | 封面日期元素 —— **每套皮肤的日期长得不一样**，别再全片左上角黄 chip |
| `ChapterMark` | 章节标识 |
| `Wipe` | 大章节转场覆盖层（`at` 切点帧，前后各 10 帧） |
| `Disclaimer` | 免责水印（全片每帧常驻） |

`Disclaimer` 文案默认「内容仅供信息参考 · 不构成投资建议」，投教传 `text="内容仅供科普 · 不构成投资建议"`。
Bobby 前置位统一用 `motionkit/BobbyCallout`（tone 按底色选 light / purple / ink）。

## 起新片

```bash
cp -r skins/<id> <slug>/skin     # 拷一份到工程里，本片可以随便改，不影响注册表
# 场景里：import {Backdrop, Headline, Hero, ...} from '../skin/kit.jsx';
```

## 样张（每套皮肤同一份三拍分镜：封面 / 数字拍 / 对比拍）

```bash
REMOTION_ENTRY_POINT=./skins/_showcase/index.jsx node scripts/remotion-cli.mjs still \
  ./skins/_showcase/index.jsx Showcase-<id> out/stills/skins/<id>_f<N>.png --frame=<N>
```
帧 0 = 封面（必须完整），帧 120 = 数字拍，帧 240 = 对比拍。

## 注册表

见 `agent/craft/skins.md`（含已用皮肤台账、旧工程里的皮肤组件位置、新皮肤样张）。
