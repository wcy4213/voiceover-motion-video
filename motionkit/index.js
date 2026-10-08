// motionkit — 跨视频共享的画面丰富度组件库（2026-07 开源调研落地）
// 场景工程用法: import {enter, NoiseBackdrop, KenBurns, DrawSVG} from '../motionkit/index.js';
export {enter, exit, ENTER_PRESETS} from './presets.js';
export {DotGridBackdrop} from './DotGridBackdrop.jsx'; // 投研线标准背景（黑+点阵，2026-08-10 起）
export {NoiseBackdrop} from './NoiseBackdrop.jsx';     // 旧紫底方案，投研线已弃用

export {KenBurns} from './KenBurns.jsx';
export {DrawSVG} from './DrawSVG.jsx';
export {BobbyCallout} from './BobbyCallout.jsx'; // Bobby AI 前置位：前 30 秒内 app icon + 字标露出（2026-09-10 起铁律）

// —— 2026-10-08 video-director 重构新增 ——
export {Camera, Parallax, Punch, useWhip} from './camera.jsx'; // 镜头层：缓推/漂移/重音冲击/快甩，兜底"万物皆动"
export {FONTS, SYS, T, PAIRS, PAIRS_AD, useFonts} from './type.js';      // 字体系统：public/fonts 打包的免费商用中文展示字体
export {Shot, LeakAt} from './seams.jsx';                      // 切点层：cut-the-curve/zoom/pull 接缝 + 官方光漏（LeakAt 需 --gl=angle）
export {Candles, SplitFlap} from './finance.jsx';              // 金融原生：K 线逐根生长（涨绿跌红）、机场翻牌数字
export {Morph, SHAPES, Burst, Ring, FlowLine, KineticWords, LiquidReveal, LottieClip} from './mg.jsx'; // MG 动画层（10-08）
// 3D 层是独立入口：import {ThreeStage, Number3D, Coin3D, IsoCity3D, Particles3D, Card3D, Bars3D, Globe3D} from '../motionkit/three/index.js'
export {SfxTrack, SFX, tickCues} from './sfx.jsx';             // 音效层：自合成 SFX（public/sfx），按峰值对齐切点/落地帧
export {ColorFlood, Carry, NestZoom} from './acts.jsx';          // 幕间：按幕换底 / 共享元素 / 上一场缩成卡片（10-08 Figma 广告拆解）
export {Cursor, SelectionBox, Toggle, ChatBubble, StickerPill, OrbitRing} from './uiprops.jsx'; // 界面当道具
export {BobbyBuddy} from './buddy.jsx';                          // 常驻小伙伴（海外/抖音可用，小红书不用）
