import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme.js";

// 品牌母题：深空紫底 + 紫色涟漪径向扩散（低调、不抢戏、逐帧确定）
export const Backdrop = () => {
  const frame = useCurrentFrame();
  const cx = 540;
  const cy = 560;
  const RING_COUNT = 4;
  const PERIOD = 880; // 涟漪最大半径
  const SPACING = PERIOD / RING_COUNT;
  const SPEED = 1.1;

  const rings = Array.from({ length: RING_COUNT }, (_, i) => {
    const r = (frame * SPEED + i * SPACING) % PERIOD;
    const opacity = interpolate(r, [0, 180, PERIOD], [0, 0.13, 0]);
    return { r, opacity, key: i };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* 中心紫光晕 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(111,0,255,0.28) 0%, rgba(111,0,255,0.10) 34%, rgba(29,0,56,0) 62%)`,
        }}
      />
      {/* 顶部微光 */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% -10%, rgba(160,80,255,0.12) 0%, rgba(29,0,56,0) 45%)",
        }}
      />
      {rings.map(({ r, opacity, key }) => (
        <div
          key={key}
          style={{
            position: "absolute",
            left: cx - r,
            top: cy - r,
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            border: `2.5px solid ${C.purpleBright}`,
            opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
