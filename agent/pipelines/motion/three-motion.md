# three.js 3D 动效手册（motionkit/three，2026-08 落地）

给投研剪辑线加的第三维画面类型：3D 场景（紫/黄元素色）叠在黑底点阵 DotGridBackdrop 之上，服务"每期 ≥60% 画面不同"。生态全 MIT 许可，可商用。

## 1. 已落地组件（`./motionkit/three/`）

```jsx
import {ThreeStage, Bars3D, Globe3D} from '../motionkit/three/index.js';

// 3D 地球：全球市场 / 资金流向 / 供应链 / 多地区业务
<ThreeStage width={width} height={height} camera={{position: [0, 50, 430], fov: 40}}>
  <Globe3D />   {/* 默认自带 8 大金融中心点位 + 5 条资金流弧线，可传 points/arcs 换数据 */}
</ThreeStage>

// 3D 柱阵：数据对比的差异化画面（和 2D 柱状图轮换用）
<ThreeStage width={width} height={height} camera={{position: [0, 5, 15], fov: 35}}>
  <Bars3D data={[{value: 38}, {value: 95, color: '#F9F339'}]} delay={4} />
</ThreeStage>
```

- `ThreeStage` — ThreeCanvas 外壳：透明背景（叠在黑底点阵上）、品牌灯光（白主光+紫补光）、相机自动 lookAt。**独立入口 `motionkit/three/index.js`**：只有用 3D 的视频才 import，2D 视频不背 three.js 的包体
- `Globe3D` — three-globe：紫球面+经纬线+紫色大气辉光+黄点位+紫→黄弧线，`spinSpeed` 每帧自转；确定性问题已在组件内封死（见 §3）
- `Bars3D` — 柱子 spring 错峰升起 + 整组缓转 + 地面参考盘；涨绿跌红/品牌紫黄由 data.color 控制
- 验证 demo：`REMOTION_ENTRY_POINT=./motionkit/demo3d/index.jsx node scripts/remotion-cli.mjs still ./motionkit/demo3d/index.jsx MotionKit3DDemo out/stills/mk3d.png --frame=60 --gl=angle`（f0-89 地球 / f90-179 柱阵）

## 2. 3D 渲染铁律

1. **含 3D 场景的工程，still/render 命令一律加 `--gl=angle`**（无头 Chrome 渲 WebGL 的官方要求；不加可能黑屏）
2. 动画只由 `useCurrentFrame()` 驱动（声明式写在 JSX 属性上），**禁用 R3F 的 `useFrame()`/clock**——渲染时 ThreeCanvas 是 `frameloop='never'`，每帧只手动画一笔，墙钟动画全部失效或不确定
3. `<Sequence>` 出现在 ThreeCanvas 内部时必须 `layout="none"`（否则 DOM 报错）；本手册的用法是把 Sequence 放 canvas 外面，每场景一个 canvas，更省心
4. drei 只用**静态 helpers**（RoundedBox / Text3D / Line / Environment）；自转类（Float、Sparkles 的 speed、OrbitControls）走墙钟，禁用
5. 一期最多 1–2 个 3D 场景——动效卡仍是主体，3D 是轮换用的差异化画面类型

## 3. 踩过的坑（2026-08 实测，都修在 Globe3D 里，新接库时照此排查）

- **three-globe 必须 `new ThreeGlobe({animateIn: false})`**：默认走墙钟 tween 从 0 缩放入场，截帧会逮到半大的球（首测就是一颗小米粒）
- **`pointsTransitionDuration(0)` / `arcsTransitionDuration(0)`**：数据层过渡动画同样走墙钟，必须置 0 让层一次成型
- **异步建场景的库要 `delayRender` + `advance()`**：three-globe 的层构建是 setTimeout 批处理，建完时 ThreeCanvas 那一笔已经画过了——delayRender 挡住截帧，轮询到 `globe.children.length > 0` 后 `useThree(s => s.advance)(performance.now())` 手动重画再放行。`invalidate()` 在 frameloop='never' 下是空操作，没用
- 确定性验收方法：**同一帧渲两次比 MD5**，必须逐字节一致

## 4. 开源项目清单（GitHub，均 MIT）

已装（`./package.json`）：

| 项目 | 版本 | 用途 |
|---|---|---|
| mrdoob/three.js | 0.185.1 | 3D 引擎本体；examples 目录是写法参考库 |
| remotion-dev @remotion/three | 4.0.438 | ThreeCanvas：R3F↔Remotion 桥，帧同步 |
| pmndrs/react-three-fiber | 9.7.0 | React 声明式写 three 场景（v9=React 19 版） |
| pmndrs/drei | 10.7.8 | 现成 helpers（几何/材质/文字），只用静态类 |
| vasturiano/three-globe | 2.45.2 | 数据可视化地球（点位/弧线/多边形层） |

备选（未装，需要时再拉）：

- **@react-three/postprocessing**（pmndrs，MIT）— bloom 辉光后处理，黄色点位/弧线发光升级
- **vasturiano/r3f-globe**（MIT）— three-globe 的 R3F 组件封装；目前直接用 `<primitive>` 已够
- **shuding/cobe**（MIT）— GitHub 首页同款点阵地球，5KB；`onRender` 回调里自己设 phi 可 frame 驱动，但要手动接 canvas 纹理
- **vantajs/vanta**（MIT）— 波浪/网格/光晕动态背景；内部 rAF 墙钟驱动**不能进 Remotion**，只能走"预生产：离线录 8–10s 循环 mp4 入素材池"（同 tsparticles 那条未做项）
- 需要国家轮廓地球（hexPolygons 层）时：three-globe 支持，但要配离线 countries GeoJSON 数据文件，别在渲染时走网络

## 5. 分镜表里怎么标

画面类型写 `3D动效(Globe3D)` / `3D动效(Bars3D)`，素材列标 `动效`。适用场景映射：

- **Globe3D**：全球市场开盘接力、资金流向、供应链分布、公司多地区营收
- **Bars3D**：财报数据对比、市占率排名、多标的横向比较（需要比 2D 柱状图更有冲击力的那一拍，如"第二钩子"位）
