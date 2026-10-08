// motionkit/acts.jsx — "转场从内容里长出来"三件套（2026-10-08，对标 Figma 动态广告拆解）
// 以前的切点（seams.jsx）是"上一场怎么走、下一场怎么来"；这里解决的是**两场之间有东西被带过去**：
//   ColorFlood  按幕换整块底色（斜向/竖向/液态扫入），不是换一团光晕 —— "换房间"的最便宜手段
//   Carry       共享元素：同一个元素跨场景连续运动（上一场的大数字飞到下一场的角落、logo 从中央缩进标题栏）
//   NestZoom    上一场整个画面缩成下一场里的一张卡片/缩略图（"welcome to Figma"→变成画布里的一块）
// 全部只依赖 useCurrentFrame。
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * <ColorFlood acts={[{at: 0, color: '#0E0E0E'}, {at: 120, color: '#F4F4F2', wipe: 'diagonal'}, {at: 240, color: '#6F00FF', wipe: 'up'}]} dur={14} />
 * 放在所有场景**下面**当底。wipe: diagonal（左下→右上斜扫）| up | left | iris（从 origin 圆形长出）
 */
export const ColorFlood = ({acts = [], dur = 14, origin = [540, 720], children}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  if (!acts.length) return null;
  const sorted = [...acts].sort((a, b) => a.at - b.at);
  return (
    <AbsoluteFill style={{background: sorted[0].color, overflow: 'hidden'}}>
      {sorted.slice(1).map((a, i) => {
        const p = interpolate(f - a.at, [0, dur], [0, 1], {...cl, easing: EXPO});
        if (p <= 0) return null;
        const wipe = a.wipe || 'diagonal';
        let style = {position: 'absolute', background: a.color};
        if (wipe === 'diagonal') {
          // 一块比画面大的平行四边形从左下扫到右上
          const travel = (W + H) * (1 - p);
          style = {...style, left: -W, top: -H, width: W * 3, height: H * 3, transform: `translate(${-travel}px, ${travel}px) skewX(-18deg)`, transformOrigin: '0 0'};
        } else if (wipe === 'up') {
          style = {...style, left: 0, right: 0, bottom: 0, height: H * p};
        } else if (wipe === 'left') {
          style = {...style, top: 0, bottom: 0, left: 0, width: W * p};
        } else if (wipe === 'iris') {
          const R = Math.hypot(Math.max(origin[0], W - origin[0]), Math.max(origin[1], H - origin[1])) * p;
          style = {...style, left: origin[0] - R, top: origin[1] - R, width: R * 2, height: R * 2, borderRadius: '50%'};
        }
        return <div key={i} style={style} />;
      })}
      {children}
    </AbsoluteFill>
  );
};

/**
 * <Carry keyframes={[{at: 0, x: 240, y: 500, w: 600, h: 200}, {at: 110, x: 72, y: 96, w: 220, h: 72}]} ease="expo">
 *   <Hero … />   ← 子元素按 100%×100% 填满盒子，自己用 fontSize 按 h 算
 * </Carry>
 * 放在场景 Sequence **外面**（顶层），这样它不会随场景切换被卸载；场景里对应位置留空。
 * keyframes 之间按 expo 插值，最后一帧之后保持；可加 {opacity} / {rot}。
 */
export const Carry = ({keyframes = [], ease = 'expo', dur = 18, children, style}) => {
  const f = useCurrentFrame();
  if (!keyframes.length) return null;
  const ks = [...keyframes].sort((a, b) => a.at - b.at);
  let cur = ks[0];
  for (let i = 1; i < ks.length; i++) {
    const a = ks[i - 1], b = ks[i];
    const p = interpolate(f - b.at, [0, dur], [0, 1], {...cl, easing: ease === 'linear' ? undefined : EXPO});
    if (f < b.at) break;
    cur = {
      x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p,
      opacity: (a.opacity ?? 1) + ((b.opacity ?? 1) - (a.opacity ?? 1)) * p, rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * p,
    };
  }
  if (f < ks[0].at) return null;
  return (
    <div style={{position: 'absolute', left: cur.x, top: cur.y, width: cur.w, height: cur.h, opacity: cur.opacity ?? 1, transform: `rotate(${cur.rot ?? 0}deg)`, transformOrigin: '50% 50%', ...style}}>
      {children}
    </div>
  );
};

/**
 * <NestZoom at={100} dur={22} to={{x: 300, y: 420, w: 480, h: 300}} radius={28}>…上一场整个画面…</NestZoom>
 * at 之前原样全屏；at 起整屏缩到 to 矩形（带圆角和投影），之后停在那里当下一场的一块。
 * 用法：上一场 Sequence 的 durationInFrames 要**延长** dur + 停留帧数，让它缩小后还在；下一场从 at 开始叠在下面/周围。
 */
export const NestZoom = ({at = 0, dur = 22, to, radius = 28, shadow = '0 30px 80px rgba(0,0,0,0.35)', fadeAfter, children}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const p = interpolate(f - at, [0, dur], [0, 1], {...cl, easing: EXPO});
  const sx = 1 + (to.w / W - 1) * p, sy = 1 + (to.h / H - 1) * p;
  const s = Math.min(sx, sy); // 等比缩放，按较小边
  const w = W * s, h = H * s;
  const x = (W - w) / 2 + (to.x + to.w / 2 - W / 2) * p, y = (H - h) / 2 + (to.y + to.h / 2 - H / 2) * p;
  const op = fadeAfter != null ? interpolate(f - at, [fadeAfter, fadeAfter + 10], [1, 0], cl) : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius * p, overflow: 'hidden', boxShadow: p > 0 ? shadow : 'none', opacity: op}}>
      <div style={{width: W, height: H, transform: `scale(${s})`, transformOrigin: '0 0'}}>{children}</div>
    </div>
  );
};
