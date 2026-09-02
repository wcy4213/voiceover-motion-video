// motionkit/DrawSVG.jsx — SVG 路径描边"画出来"动画（@remotion/paths evolvePath）
// 素材源：lucide 图标（1600+ 描边图标，含 candlestick-chart/banknote/trending-up 等金融类）。
// 用法：从 https://lucide.dev 拷贝图标的 path d（可多条），逐条错峰画出。
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';

export const DrawSVG = ({
  paths,               // string 或 string[]：SVG path 的 d
  size = 200,
  viewBox = '0 0 24 24', // lucide 默认 24x24
  stroke = '#F9F339',
  strokeWidth = 1.8,
  delay = 0,
  dur = 24,            // 单条路径画出时长（帧）
  stagger = 6,         // 多条路径错峰间隔（帧）
  fillAfter = null,    // 画完后填充色（可选）
  style = {},
}) => {
  const frame = useCurrentFrame();
  const ds = Array.isArray(paths) ? paths : [paths];
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" style={style}>
      {ds.map((d, i) => {
        const p = interpolate(frame, [delay + i * stagger, delay + i * stagger + dur], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const ev = evolvePath(p, d);
        const fillOp = fillAfter
          ? interpolate(frame, [delay + i * stagger + dur, delay + i * stagger + dur + 8], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          : 0;
        return (
          <React.Fragment key={i}>
            {fillAfter ? <path d={d} fill={fillAfter} opacity={fillOp} /> : null}
            <path
              d={d}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={ev.strokeDasharray}
              strokeDashoffset={ev.strokeDashoffset}
            />
          </React.Fragment>
        );
      })}
    </svg>
  );
};
