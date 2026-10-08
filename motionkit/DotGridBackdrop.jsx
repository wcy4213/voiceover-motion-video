// motionkit/DotGridBackdrop.jsx — 黑底 + 点阵（2026-08-10 起投研线标准背景，替代深空紫）
// 点阵给"数据终端"质感；漂移光晕位置走 noise，每期换 seed/gap 就和上期肉眼可辨地不同
// （防抖音同质化——黑底如果条条全同，和当初空紫底是一样的死法）。帧确定性（只依赖 frame）。
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';

export const DotGridBackdrop = ({
  seed = 'bobby',
  base = '#050505',            // 近黑：留压缩余量，纯黑易 banding
  gap = 46,                    // 点阵间距（每期可换 42-56）
  dot = 1.8,                   // 点半径 px
  dotColor = 'rgba(255,255,255,0.13)',
  glow = 0.07,                 // 漂移光晕强度（0=关）
  glowColor = '160,80,255',    // 光晕 rgb，默认留一丝品牌紫
  speed = 0.005,
  width = 1080,
  height = 1080,
  children,
}) => {
  const frame = useCurrentFrame();
  const gx = width * 0.5 + noise2D(`${seed}-gx`, frame * speed, 0) * width * 0.38;
  const gy = height * 0.42 + noise2D(`${seed}-gy`, 0, frame * speed) * height * 0.34;
  return (
    <AbsoluteFill style={{backgroundColor: base}}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} ${dot}px, transparent ${dot}px)`,
          backgroundSize: `${gap}px ${gap}px`,
          backgroundPosition: `${gap / 2}px ${gap / 2}px`,
        }}
      />
      {glow > 0 && (
        <div
          style={{
            position: 'absolute',
            left: gx - 520,
            top: gy - 520,
            width: 1040,
            height: 1040,
            background: `radial-gradient(circle, rgba(${glowColor},${glow}) 0%, transparent 62%)`,
          }}
        />
      )}
      {/* 四角 vignette 压边，突出中心内容 */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
