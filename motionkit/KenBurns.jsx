// motionkit/KenBurns.jsx — 静态图片缓推缓移（editly 的 zoomDirection/zoomAmount 参数化）
// 规范：静态图片上片必须加运镜，不许静止怼屏（broll-assets.md）。
// 更强的 2.5D 视差效果用 broll_fetch.py animate（DepthFlow）预生成视频素材。
import React from 'react';
import {Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const KenBurns = ({
  src,
  direction = 'in',      // in | out | left | right | up | down
  amount = 1.1,          // 缩放量 1.06(轻)~1.15(明显)
  durationInFrames,      // 默认整个 Sequence 时长
  style = {},
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames: seqDur} = useVideoConfig();
  const dur = durationInFrames ?? seqDur;
  const t = interpolate(frame, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pan = (amount - 1) * 50; // 平移百分比，跟缩放量匹配保证不露边
  let transform;
  switch (direction) {
    case 'out':
      transform = `scale(${amount - (amount - 1) * t})`;
      break;
    case 'left':
      transform = `scale(${amount}) translateX(${pan - pan * 2 * t}%)`;
      break;
    case 'right':
      transform = `scale(${amount}) translateX(${-pan + pan * 2 * t}%)`;
      break;
    case 'up':
      transform = `scale(${amount}) translateY(${pan - pan * 2 * t}%)`;
      break;
    case 'down':
      transform = `scale(${amount}) translateY(${-pan + pan * 2 * t}%)`;
      break;
    case 'in':
    default:
      transform = `scale(${1 + (amount - 1) * t})`;
  }
  return (
    <div style={{overflow: 'hidden', width: '100%', height: '100%', ...style}}>
      <Img
        src={src}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform}}
      />
    </div>
  );
};
