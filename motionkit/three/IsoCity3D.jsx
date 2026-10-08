// IsoCity3D — 等距"数据城市"：每栋楼 = 一个数据点（市值/营收/持仓），从地面依次长出，相机缓慢环绕。
// <ThreeStage camera={{position:[12,11,12], fov:30}}><IsoCity3D data={[{value, color?, label?}]} cols={4} /></ThreeStage>
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const IsoCity3D = ({data = [], cols = 4, gap = 1.6, w = 1.05, maxH = 5, delay = 0, stagger = 3, orbit = 0.0025,
  base = '#14101F', palette = ['#6F00FF', '#A050FF', '#7C9CFD', '#5A3FB8'], highlight = -1}) => {
  // 品牌黄只给 highlight 那一栋（黄色纪律）
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const max = Math.max(...data.map((d) => d.value), 1);
  const rows = Math.ceil(data.length / cols);
  return (
    <group rotation={[0, f * orbit, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[cols * gap + 2, rows * gap + 2]} />
        <meshStandardMaterial color={base} roughness={0.95} />
      </mesh>
      {data.map((d, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const s = spring({frame: f - delay - i * stagger, fps, config: {damping: 18, mass: 0.8}});
        const h = Math.max(0.04, (d.value / max) * maxH * s);
        const col = d.color || (i === highlight ? '#F9F339' : palette[i % palette.length]);
        return (
          <mesh key={i} position={[(c - (cols - 1) / 2) * gap, h / 2, (r - (rows - 1) / 2) * gap]}>
            <boxGeometry args={[w, h, w]} />
            <meshStandardMaterial color={col} metalness={0.2} roughness={0.45} emissive={col} emissiveIntensity={i === highlight ? 0.45 : 0.1} />
          </mesh>
        );
      })}
    </group>
  );
};
