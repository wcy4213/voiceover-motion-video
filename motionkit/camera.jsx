// motionkit/camera.jsx — 镜头语言层（2026-10-08 video-director 重构）
// 动机：pace_check 实测老片静止段很多（be0924 前 5 分钟 39 段 >2s 静止）—— 元素入场完就"摆拍"。
// 用镜头运动兜底"万物皆动"：每个场景包一层 Camera，画面永远在缓推/漂移；口播重音处 Punch 一下。
// 全部只依赖 useCurrentFrame（Remotion 并行乱序渲染安全）。
//
//   <Camera move="push" from={0} dur={150}>…场景…</Camera>       // 缓推 1.00→1.06
//   <Camera move="drift" seed="s3">…</Camera>                    // noise 漂移（手持感，幅度很小）
//   <Punch at={[42, 118]}>…</Punch>                              // 重音帧瞬间放大 4% 再回弹（替代震屏的高级版）
//   <Parallax depth={0.3}>背景层</Parallax> <Parallax depth={1}>主体</Parallax>   // 同一 Camera 下的纵深分层
import React, {createContext, useContext} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const CamCtx = createContext({x: 0, y: 0, s: 1});

const MOVES = {
  // [scaleFrom, scaleTo, xFrom, xTo, yFrom, yTo]（x/y 单位 px）
  push: [1.0, 1.06, 0, 0, 0, 0],
  pull: [1.07, 1.0, 0, 0, 0, 0],
  panL: [1.06, 1.06, 30, -30, 0, 0],
  panR: [1.06, 1.06, -30, 30, 0, 0],
  rise: [1.05, 1.05, 0, 0, 26, -26],
  still: [1, 1, 0, 0, 0, 0],
};

export const Camera = ({move = 'push', from = 0, dur = 150, seed = 'cam', drift = 0, children, style}) => {
  const f = useCurrentFrame();
  const m = move === 'drift' ? [1.03, 1.03, 0, 0, 0, 0] : MOVES[move] || MOVES.push;
  const p = interpolate(f - from, [0, dur], [0, 1], {...cl, easing: Easing.inOut(Easing.sin)});
  const amp = move === 'drift' ? 10 : drift;
  const nx = amp ? noise2D(`${seed}x`, f * 0.012, 0) * amp : 0;
  const ny = amp ? noise2D(`${seed}y`, 0, f * 0.012) * amp : 0;
  const s = m[0] + (m[1] - m[0]) * p;
  const x = m[2] + (m[3] - m[2]) * p + nx;
  const y = m[4] + (m[5] - m[4]) * p + ny;
  return (
    <CamCtx.Provider value={{x, y, s}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: '50% 45%', ...style}}>
        {children}
      </div>
    </CamCtx.Provider>
  );
};

// 纵深分层：depth<1 的层跟镜头移动得更少（远景），>1 更多（前景）
export const Parallax = ({depth = 1, children, style}) => {
  const {x, y, s} = useContext(CamCtx);
  const k = depth - 1;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x * k}px, ${y * k}px) scale(${1 + (s - 1) * k})`, ...style}}>
      {children}
    </div>
  );
};

// 重音冲击：at 数组里每个帧号放大 amount 后 10 帧弹回（可叠多个重音）
export const Punch = ({at = [], amount = 0.045, children, style}) => {
  const f = useCurrentFrame();
  let k = 0;
  for (const a of at) {
    const t = f - a;
    if (t >= 0 && t < 14) k = Math.max(k, interpolate(t, [0, 3, 14], [0, 1, 0], {...cl, easing: Easing.out(Easing.cubic)}));
  }
  return <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + amount * k})`, ...style}}>{children}</div>;
};

// 快甩转场（whip pan）：在切点 at 前后 6 帧，整屏横向甩出 + 方向模糊；包住"切点两侧的两个场景"外层使用
export const useWhip = (at, dir = 1, half = 6) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < -half || t > half) return {};
  const p = t < 0 ? interpolate(t, [-half, 0], [0, 1], {easing: Easing.in(Easing.cubic)}) : interpolate(t, [0, half], [1, 0], {easing: Easing.out(Easing.cubic)});
  const off = (t < 0 ? -1 : 1) * dir * p * 380;
  return {transform: `translateX(${-off}px)`, filter: `blur(${p * 24}px)`};
};
