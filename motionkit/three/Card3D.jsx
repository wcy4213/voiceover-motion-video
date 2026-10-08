// Card3D — 漂浮的 3D 卡片/手机屏（贴一张图：logo、产品截图、Bobby 回答截图），入场从侧面转正 + 缓慢倾斜，带厚度和圆角感。
// 国内版注意：Bobby 产品界面截图只在海外版用（cn-platform-compliance-redline）。
import React from 'react';
import {Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useCanvasAsset} from './useCanvasAsset.js';

const useTex = (src) => useCanvasAsset(() => new THREE.TextureLoader().loadAsync(staticFile(src)).then((t) => {
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}), [src], `Card3D ${src}`);

export const Card3D = ({src, w = 4, h = 5.2, depth = 0.18, delay = 0, frame = '#1A1530', tilt = 0.12}) => {
  const f = useCurrentFrame();
  const tex = useTex(src);
  const p = interpolate(f - delay, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const rotY = (1 - p) * -1.2 + Math.sin((f - delay) / 40) * tilt;
  const rotX = Math.cos((f - delay) / 55) * tilt * 0.6;
  return (
    <group rotation={[rotX, rotY, 0]} position={[0, (1 - p) * -1.5, 0]}>
      <mesh>
        <boxGeometry args={[w + 0.24, h + 0.24, depth]} />
        <meshStandardMaterial color={frame} metalness={0.5} roughness={0.35} />
      </mesh>
      {tex ? (
        <mesh position={[0, 0, depth / 2 + 0.002]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};
