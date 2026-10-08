// motionkit/three — 3D 动效组件层（2026-08 three.js 开源生态落地；2026-10-08 扩充）
// 独立入口：只有用到 3D 的视频才 import，避免 2D 视频打包 three.js（~600KB）。
// 场景工程用法: import {ThreeStage, Bars3D, Globe3D, Number3D, Coin3D, IsoCity3D, Particles3D, Card3D} from '../motionkit/three/index.js';
// 渲染注意: 含 3D 的工程渲 still/render 时命令行加 --gl=angle
export {ThreeStage} from './ThreeStage.jsx';
export {Bars3D} from './Bars3D.jsx';
export {Globe3D} from './Globe3D.jsx';
export {Number3D} from './Number3D.jsx';       // 立体挤出数字 count-up（拉丁/数字，typeface JSON 见 scripts/tools/ttf2typeface.mjs）
export {Coin3D} from './Coin3D.jsx';           // 抽象硬币翻转（无币种图案，合规）
export {IsoCity3D} from './IsoCity3D.jsx';     // 等距数据城市：每栋楼一个数据点
export {Particles3D} from './Particles3D.jsx'; // 粒子从散点聚合成球/环/网格
export {Card3D} from './Card3D.jsx';           // 漂浮 3D 卡片/屏幕（贴图）
