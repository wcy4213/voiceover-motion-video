// motionkit/three — 3D 动效组件层（2026-08 three.js 开源生态落地）
// 独立入口：只有用到 3D 的视频才 import，避免 2D 视频打包 three.js（~600KB）。
// 场景工程用法: import {ThreeStage, Bars3D, Globe3D} from '../motionkit/three/index.js';
// 渲染注意: 含 3D 的工程渲 still/render 时命令行加 --gl=angle
export {ThreeStage} from './ThreeStage.jsx';
export {Bars3D} from './Bars3D.jsx';
export {Globe3D} from './Globe3D.jsx';
