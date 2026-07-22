import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme.js";

// 高管出场：抠图照片从侧边弹入 + 引言气泡
// photo: public/ 下的相对路径（如 "myvideo/ceo.png"，rembg 抠图 png）；side: "right" | "left"
export const ExecQuote = ({
  photo,
  name,
  title,
  quote,
  delay = 0,
  photoH = 380,
  side = "right",
  bubbleDelay = 18,
  quoteSize = 33,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  const bp = spring({ frame: frame - delay - bubbleDelay, fps, config: { damping: 12 } });
  const dir = side === "right" ? 1 : -1;
  const bob = Math.sin((frame - delay) / 26) * 4; // 轻微呼吸浮动

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
      {/* 气泡 */}
      <div
        style={{
          transform: `scale(${bp})`,
          transformOrigin: side === "right" ? "bottom right" : "bottom left",
          opacity: interpolate(frame - delay - bubbleDelay, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          background: "rgba(243,240,255,0.96)",
          borderRadius: 26,
          padding: "18px 28px",
          maxWidth: 560,
          marginBottom: 18,
          boxShadow: "0 12px 50px rgba(0,0,0,0.4)",
          position: "relative",
        }}
      >
        <div style={{ fontFamily: F.cn, fontSize: quoteSize, fontWeight: 600, color: "#2A0B52", lineHeight: 1.45, whiteSpace: "nowrap" }}>
          {quote}
        </div>
        {/* 气泡尾巴 */}
        <div
          style={{
            position: "absolute",
            bottom: -14,
            [side === "right" ? "right" : "left"]: 64,
            width: 0,
            height: 0,
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: "16px solid rgba(243,240,255,0.96)",
          }}
        />
      </div>

      {/* 照片 + 姓名牌 */}
      <div
        style={{
          transform: `translateX(${(1 - p) * 220 * dir}px) translateY(${bob}px)`,
          opacity: interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Img
          src={staticFile(photo)}
          style={{
            height: photoH,
            filter: "drop-shadow(0 18px 50px rgba(0,0,0,0.55))",
          }}
        />
        <div
          style={{
            marginTop: -8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background: "rgba(29,0,56,0.85)",
            border: "2px solid rgba(160,80,255,0.55)",
            borderRadius: 16,
            padding: "8px 22px",
          }}
        >
          <span style={{ fontFamily: F.cn, fontSize: 26, fontWeight: 600, color: C.white, whiteSpace: "nowrap" }}>{name}</span>
          <span style={{ fontFamily: F.num, fontSize: 19, fontWeight: 600, color: C.blue2, letterSpacing: 1, whiteSpace: "nowrap" }}>{title}</span>
        </div>
      </div>
    </div>
  );
};
