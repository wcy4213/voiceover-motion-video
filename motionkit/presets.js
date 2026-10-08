// motionkit/presets.js — 语义动画 preset 库（FFCreator "animate.css 语义名" 思路）
// 场景代码只填 preset 名，不手写关键帧；所有函数只依赖传入的 frame，帧独立可计算。
// 用法: <div style={{...enter('fadeInUp', frame, fps, {delay: TL.x - TL.scene})}}>
import {interpolate, spring} from 'remotion';

const clampEase = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

// 入场 preset：返回 style 对象。delay/dur 单位帧。
export const enter = (name, frame, fps, {delay = 0, dur = 12, dist = 60} = {}) => {
  const t = interpolate(frame, [delay, delay + dur], [0, 1], clampEase);
  // popIn 用弹簧，过冲钳制 ≤1.3（设计铁律）
  const sp = spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 160}});
  const pop = Math.min(sp, 1.3);
  switch (name) {
    case 'fadeIn':
      return {opacity: t};
    case 'fadeInUp':
      return {opacity: t, transform: `translateY(${(1 - t) * dist}px)`};
    case 'fadeInDown':
      return {opacity: t, transform: `translateY(${-(1 - t) * dist}px)`};
    case 'slideInLeft':
      return {opacity: Math.min(t * 2, 1), transform: `translateX(${-(1 - t) * dist * 2}px)`};
    case 'slideInRight':
      return {opacity: Math.min(t * 2, 1), transform: `translateX(${(1 - t) * dist * 2}px)`};
    case 'zoomIn':
      return {opacity: t, transform: `scale(${0.82 + t * 0.18})`};
    case 'popIn':
      return {opacity: Math.min(sp * 2, 1), transform: `scale(${pop})`};
    case 'blurIn':
      return {opacity: t, filter: `blur(${(1 - t) * 14}px)`};
    case 'wipeReveal': // 从左向右擦出，适合长条卡片/进度类元素
      return {clipPath: `inset(0 ${(1 - t) * 100}% 0 0)`, opacity: 1};
    case 'riseRotate': // 上浮+轻微转正，适合 logo 块/贴纸感元素
      return {opacity: t, transform: `translateY(${(1 - t) * dist}px) rotate(${(1 - t) * -6}deg)`};
    default:
      return {opacity: t};
  }
};

export const ENTER_PRESETS = [
  'fadeIn', 'fadeInUp', 'fadeInDown', 'slideInLeft', 'slideInRight',
  'zoomIn', 'popIn', 'blurIn', 'wipeReveal', 'riseRotate',
];

// 退场：t=0 完整可见, t=1 消失
export const exit = (name, frame, {start = 0, dur = 8} = {}) => {
  const t = interpolate(frame, [start, start + dur], [0, 1], clampEase);
  switch (name) {
    case 'fadeOut':
      return {opacity: 1 - t};
    case 'fadeOutUp':
      return {opacity: 1 - t, transform: `translateY(${-t * 40}px)`};
    case 'zoomOut':
      return {opacity: 1 - t, transform: `scale(${1 - t * 0.12})`};
    default:
      return {opacity: 1 - t};
  }
};
