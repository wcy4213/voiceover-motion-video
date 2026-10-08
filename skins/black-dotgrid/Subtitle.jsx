import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { F } from "./theme.js";
import CUES from "../subs.json"; // 由 scripts/make_subs.py 生成（放在工程根目录）

// 烧录字幕：单行、无标点、纯白、贴底
// 时间轴来自 SeACo-Paraformer 字级对齐；全部落在 SAFE_BOTTOM(175px) 以下，不与动效重叠
export const Subtitle = () => {
  const frame = useCurrentFrame();
  const cue = CUES.find((c) => frame >= c.f0 && frame < c.f1);
  if (!cue) {
    return null;
  }
  const opacity = interpolate(frame - cue.f0, [0, 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      data-subtitle=""
      style={{
        position: "absolute",
        bottom: 46,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        opacity,
      }}
    >
      <span
        style={{
          fontFamily: F.cn,
          fontSize: 40,
          fontWeight: 600,
          color: "#FFFFFF",
          letterSpacing: 1,
          whiteSpace: "nowrap",
          textShadow: "0 2px 12px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.6)",
        }}
      >
        {cue.text}
      </span>
    </div>
  );
};
