// Number3D — 立体挤出数字（count-up + 落地 + 缓转），金融片的"巨数字"3D 版。只放拉丁字符/数字；中文标签用 2D 叠在上面。
// <ThreeStage camera={{position:[0,0,14], fov:35}}><Number3D value={7.21} decimals={2} suffix="T" delay={6} /></ThreeStage>
import React, {useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import {getFont3D} from './useFont3D.js';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

export const Number3D = ({value, prefix = '', suffix = '', decimals = 0, delay = 0, dur = 36, size = 2.4, depth = 0.7,
  color = '#6F00FF', edge = '#F9F339', spin = 0.004, font = 'montserrat', fitWidth = 6}) => {
  const f = useCurrentFrame();
  const fnt = getFont3D(font);
  const p = interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const txt = `${prefix}${(value * p).toFixed(decimals)}${suffix}`;
  const geo = useMemo(() => {
    if (!fnt) return null;
    const g = new TextGeometry(txt, {font: fnt, size, depth, curveSegments: 8, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.04, bevelSegments: 3});
    g.center();
    return g;
  }, [fnt, txt, size, depth]);
  // 按最终数值的宽度一次性定缩放（不随 count-up 抖动），保证不出画：fitWidth = 允许的最大世界宽度
  const scale = useMemo(() => {
    if (!fnt) return 1;
    const g = new TextGeometry(`${prefix}${value.toFixed(decimals)}${suffix}`, {font: fnt, size, depth, curveSegments: 4});
    g.computeBoundingBox();
    const w = g.boundingBox.max.x - g.boundingBox.min.x;
    g.dispose();
    return Math.min(1, fitWidth / w);
  }, [fnt, prefix, value, decimals, suffix, size, depth, fitWidth]);
  if (!geo) return null;
  const drop = interpolate(f - delay, [0, 14], [3, 0], {...cl, easing: Easing.out(Easing.back(1.2))});
  const rotY = -0.35 + Math.sin((f - delay) * spin * 6) * 0.18;
  return (
    <group position={[0, drop, 0]} rotation={[0.12, rotY, 0]} scale={scale}>
      <mesh geometry={geo}>
        {/* 正面品牌紫，侧面（挤出）带一点亮色 —— 两种材质：0 = 正背面，1 = 侧面 */}
        <meshStandardMaterial attach="material-0" color={color} metalness={0.35} roughness={0.28} emissive={color} emissiveIntensity={0.18} />
        <meshStandardMaterial attach="material-1" color={edge} metalness={0.15} roughness={0.5} />
      </mesh>
    </group>
  );
};
