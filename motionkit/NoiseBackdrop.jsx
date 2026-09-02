// motionkit/NoiseBackdrop.jsx — 深空紫底 + Simplex noise 漂移光斑（治"静态紫底一成不变"）
// 每期换 seed 就得到不同的底色流动，帧确定性（只依赖 frame）。
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';

const BLOBS = [
  {r: 620, color: 'rgba(111,0,255,0.28)'},   // #6F00FF
  {r: 520, color: 'rgba(160,80,255,0.16)'},  // #A050FF
  {r: 700, color: 'rgba(111,0,255,0.12)'},
];

export const NoiseBackdrop = ({
  seed = 'bobby',
  base = '#1D0038',
  speed = 0.006,   // 越小越慢；0.006 ≈ 缓慢呼吸感
  drift = 260,     // 光斑漂移半径 px
  width = 1080,
  height = 1080,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: base}}>
      {BLOBS.map((b, i) => {
        const x = width * (0.25 + i * 0.25) + noise2D(`${seed}-x${i}`, frame * speed, 0) * drift;
        const y = height * (0.3 + (i % 2) * 0.4) + noise2D(`${seed}-y${i}`, 0, frame * speed) * drift;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - b.r,
              top: y - b.r,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${b.color} 0%, transparent 68%)`,
            }}
          />
        );
      })}
      {children}
    </AbsoluteFill>
  );
};
