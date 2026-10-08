// Particles3D — 确定性粒子场：从散点云"聚合"成目标形状（球 / 环 / 平面网格），用于"资金汇聚 / 数据涌入 / AI 计算"类意象。
// 位置全部由 random(seed) + frame 算出（不用 useFrame / Math.random），并行渲染安全。
import React, {useMemo} from 'react';
import {Easing, interpolate, random, useCurrentFrame} from 'remotion';
import * as THREE from 'three';

const target = (shape, i, n) => {
  const t = i / n;
  if (shape === 'ring') {
    const a = t * Math.PI * 2 * 3;
    return [Math.cos(a) * 4, (random(`ry${i}`) - 0.5) * 0.4, Math.sin(a) * 4];
  }
  if (shape === 'grid') {
    const side = Math.ceil(Math.sqrt(n));
    return [((i % side) / side - 0.5) * 9, 0, (Math.floor(i / side) / side - 0.5) * 9];
  }
  // sphere（斐波那契球面均匀分布）
  const y = 1 - 2 * t;
  const r = Math.sqrt(1 - y * y);
  const phi = i * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(phi) * r * 3.6, y * 3.6, Math.sin(phi) * r * 3.6];
};

export const Particles3D = ({count = 1800, shape = 'sphere', seed = 'p', delay = 0, dur = 60, size = 0.09, color = '#A050FF', accent = '#F9F339', spin = 0.004}) => {
  const f = useCurrentFrame();
  const base = useMemo(() => {
    const from = new Float32Array(count * 3), to = new Float32Array(count * 3), col = new Float32Array(count * 3);
    const c1 = new THREE.Color(color), c2 = new THREE.Color(accent);
    for (let i = 0; i < count; i++) {
      from.set([(random(`${seed}x${i}`) - 0.5) * 30, (random(`${seed}y${i}`) - 0.5) * 30, (random(`${seed}z${i}`) - 0.5) * 30], i * 3);
      to.set(target(shape, i, count), i * 3);
      const c = random(`${seed}c${i}`) < 0.06 ? c2 : c1;
      col.set([c.r, c.g, c.b], i * 3);
    }
    return {from, to, col};
  }, [count, shape, seed, color, accent]);
  const p = interpolate(f - delay, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const pos = useMemo(() => {
    const out = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) out[i] = base.from[i] + (base.to[i] - base.from[i]) * p;
    return out;
  }, [base, p, count]);
  return (
    <points rotation={[0.2, f * spin, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[base.col, 3]} />
      </bufferGeometry>
      <pointsMaterial size={size} vertexColors sizeAttenuation transparent opacity={0.95} depthWrite={false} />
    </points>
  );
};
