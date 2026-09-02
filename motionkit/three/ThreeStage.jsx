// motionkit/three/ThreeStage.jsx — 3D 场景统一外壳（@remotion/three ThreeCanvas + 品牌灯光）
// 背景透明，叠在 NoiseBackdrop / Backdrop 之上；相机自动 lookAt target。
// 铁律：内部一切动画只依赖 useCurrentFrame()，禁用 R3F 的 useFrame()/clock（帧确定性）。
import React from 'react';
import {ThreeCanvas} from '@remotion/three';

export const ThreeStage = ({
  width,
  height,
  camera = {position: [0, 0, 320], fov: 40},
  target = [0, 0, 0],
  children,
}) => (
  <ThreeCanvas
    width={width}
    height={height}
    style={{backgroundColor: 'transparent'}}
    gl={{antialias: true, alpha: true}}
    camera={{near: 0.1, far: 4000, ...camera}}
    onCreated={({camera: cam}) => cam.lookAt(...target)}
  >
    {/* three r155+ 物理光照默认开启：只用 ambient/directional（不受距离衰减影响），不用 pointLight */}
    <ambientLight intensity={1.1} />
    <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffffff" />
    <directionalLight position={[-4, -1, -3]} intensity={0.9} color="#A050FF" />
    {children}
  </ThreeCanvas>
);
