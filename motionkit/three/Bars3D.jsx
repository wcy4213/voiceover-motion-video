// motionkit/three/Bars3D.jsx — 3D 柱阵（数据对比场景的 3D 版，替代平面柱状图的差异化画面）
// 柱子 spring 升起 + 整组缓慢旋转，全部由 frame 驱动，帧确定性。
// 用法：放进 <ThreeStage camera={{position:[0,4,11],fov:35}}> 内。
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

const PALETTE = ['#6F00FF', '#A050FF', '#2ebd85', '#F9F339', '#f6465d'];

export const Bars3D = ({
  data,            // [{value, color?}] value 为任意正数，内部按最大值归一
  delay = 0,       // 整组起始延迟（帧）
  stagger = 5,     // 相邻柱错峰（帧）
  gap = 1.5,       // 柱间距（world 单位）
  barW = 1,        // 柱宽
  maxH = 5.5,      // 最高柱高度
  spinFrom = -0.35, // 整组 Y 轴旋转起点（弧度）
  spinSpeed = 0.0022, // 每帧旋转增量（0=不转）
  yOffset = -2.4,  // 整组下移，给顶部留 HTML 标注位
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const max = Math.max(...data.map((d) => d.value));
  const rotY = spinFrom + frame * spinSpeed;
  return (
    <group rotation={[0, rotY, 0]} position={[0, yOffset, 0]}>
      {data.map((d, i) => {
        const s = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: {damping: 15, mass: 0.7},
        });
        const h = Math.max(0.02, (d.value / max) * maxH * s);
        const x = (i - (data.length - 1) / 2) * gap;
        return (
          <mesh key={i} position={[x, h / 2, 0]}>
            <boxGeometry args={[barW, h, barW]} />
            <meshStandardMaterial
              color={d.color ?? PALETTE[i % PALETTE.length]}
              metalness={0.25}
              roughness={0.35}
              emissive={d.color ?? PALETTE[i % PALETTE.length]}
              emissiveIntensity={0.12}
            />
          </mesh>
        );
      })}
      {/* 地面参考盘：半透明品牌紫，压住"悬空感" */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[(data.length * gap) / 2 + 1.6, 64]} />
        <meshStandardMaterial color="#2a0a52" transparent opacity={0.55} roughness={0.9} />
      </mesh>
    </group>
  );
};
