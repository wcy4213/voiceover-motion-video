// motionkit/seams.jsx — 切点/接缝层（2026-10-08 video-director 重构；hyperframes 切点法移植到 Remotion）
// 理念：默认不用交叉淡化/白闪/黑场。上一场"加速离开"、下一场"同方向减速进来"，硬切落在速度峰值 —— 观众感觉不到切。
//
// 用法：每个场景 Sequence 里包一层 Shot（dur = 这个 Sequence 的 durationInFrames）
//   <Sequence from={TL.s3} durationInFrames={TL.s4 - TL.s3}>
//     <Shot dur={TL.s4 - TL.s3} enter="curve" exit="zoom" dir={1}> …场景… </Shot>
//   </Sequence>
// enter / exit 可选：
//   curve  — cut-the-curve：横移 12% 屏宽，poly4 in/out 各 9 帧，入场起始 opacity .35（默认，最常用）
//   rise   — 同上但纵向（向上 = 结论/升华）
//   zoom   — 穿越推进：出 1→1.2 + blur 10px（6 帧）；入 0.75→1 expo-out（15 帧）——"往下钻一层"
//   pull   — 反向拉远：出 1→0.8；入 1.25→1 ——只给 payoff 拍
//   none   — 硬切
// dir：1 = 内容向左推进（全片默认主方向），-1 = 向右（回溯/对比的另一边）
//
//   <LeakAt at={TL.s5} />   —— 在硬切上叠一道官方 WebGL 光漏（不占时长；需 --gl=angle）
import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {LightLeak} from '@remotion/light-leaks';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const OUT4 = Easing.out(Easing.poly(4));
const IN4 = Easing.in(Easing.poly(4));
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

const enterStyle = (kind, t, W, H, dir) => {
  if (kind === 'none') return {};
  if (kind === 'curve' || kind === 'rise') {
    const p = interpolate(t, [0, 9], [0, 1], {...cl, easing: OUT4});
    const off = (1 - p) * 0.12 * (kind === 'rise' ? H : W) * (kind === 'rise' ? 1 : dir);
    return {transform: kind === 'rise' ? `translateY(${off}px)` : `translateX(${off}px)`, opacity: 0.35 + 0.65 * p};
  }
  if (kind === 'zoom') {
    const p = interpolate(t, [0, 15], [0, 1], {...cl, easing: EXPO});
    return {transform: `scale(${0.75 + 0.25 * p})`, opacity: interpolate(t, [0, 4], [0, 1], cl)};
  }
  if (kind === 'pull') {
    const p = interpolate(t, [0, 15], [0, 1], {...cl, easing: EXPO});
    return {transform: `scale(${1.25 - 0.25 * p})`, opacity: interpolate(t, [0, 4], [0, 1], cl)};
  }
  return {};
};

const exitStyle = (kind, r, W, H, dir) => {
  // r = 距离场景结束还剩多少帧（最后一帧 r=1）
  if (kind === 'none') return {};
  if (kind === 'curve' || kind === 'rise') {
    const p = interpolate(9 - r, [0, 9], [0, 1], {...cl, easing: IN4}); // 行程进度（加速）
    const off = -p * 0.12 * (kind === 'rise' ? H : W) * (kind === 'rise' ? 1 : dir);
    return {transform: kind === 'rise' ? `translateY(${off}px)` : `translateX(${off}px)`, opacity: 1 - Math.min(1, p / 0.28)};
  }
  if (kind === 'zoom') {
    const p = interpolate(6 - r, [0, 6], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
    return {transform: `scale(${1 + 0.2 * p})`, filter: p > 0 ? `blur(${p * 10}px)` : undefined};
  }
  if (kind === 'pull') {
    const p = interpolate(8 - r, [0, 8], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
    return {transform: `scale(${1 - 0.2 * p})`, opacity: 1 - p * 0.5};
  }
  return {};
};

export const Shot = ({dur, enter = 'curve', exit = 'curve', dir = 1, still0 = false, children, style}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  // still0：封面场景（frame 0 必须完整）—— 不做入场
  const e = still0 ? {} : enterStyle(enter, f, W, H, dir);
  const x = dur ? exitStyle(exit, dur - f, W, H, dir) : {};
  const transform = [e.transform, x.transform].filter(Boolean).join(' ') || undefined;
  const opacity = (e.opacity ?? 1) * (x.opacity ?? 1);
  return (
    <AbsoluteFill style={{transform, opacity, filter: x.filter, transformOrigin: '50% 45%', ...style}}>
      {children}
    </AbsoluteFill>
  );
};

// 硬切上的光漏：at 前后各 half 帧（官方组件：前半程展开、后半程收回）
export const LeakAt = ({at, half = 15, seed = 0, hueShift = 0, opacity = 0.5}) => (
  <Sequence from={Math.max(0, at - half)} durationInFrames={half * 2} layout="none">
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity}}>
      <LightLeak durationInFrames={half * 2} seed={seed} hueShift={hueShift} />
    </AbsoluteFill>
  </Sequence>
);
