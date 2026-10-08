// Coin3D — 一枚抽象硬币（品牌紫面 + 黄色描边环，无币种无真钞图案，合规）：翻转/滚动/落下堆叠。
// 用途："费用/收益/成本"的图形化道具，替代 💰 emoji。
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

export const Coin3D = ({delay = 0, flips = 2, dur = 40, radius = 1.0, thickness = 0.16, face = '#6F00FF', rim = '#F9F339', position = [0, 0, 0], idle = 0.02}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const rotX = Math.PI / 2 + p * flips * Math.PI * 2 + Math.max(0, f - delay - dur) * idle;
  const y = interpolate(f - delay, [0, dur * 0.5, dur], [2.2, 3, 0], {...cl, easing: Easing.inOut(Easing.quad)});
  return (
    <group position={[position[0], position[1] + y, position[2]]} rotation={[rotX, 0.3, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, thickness, 64]} />
        <meshStandardMaterial attach="material-0" color={rim} metalness={0.2} roughness={0.4} />
        <meshStandardMaterial attach="material-1" color={face} metalness={0.2} roughness={0.35} emissive={face} emissiveIntensity={0.15} />
        <meshStandardMaterial attach="material-2" color={face} metalness={0.2} roughness={0.35} emissive={face} emissiveIntensity={0.15} />
      </mesh>
      {/* 面上的内圈浮雕环 */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, (thickness / 2 + 0.005) * s, 0]} rotation={[-Math.PI / 2 * s, 0, 0]}>
          <ringGeometry args={[radius * 0.62, radius * 0.72, 64]} />
          <meshStandardMaterial color={rim} metalness={0.2} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};
