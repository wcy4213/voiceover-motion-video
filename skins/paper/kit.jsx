import React from "react";
import { interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { C, F } from "./theme.js";

// 本片资产（把 SLUG 改成你的工程 slug，对应 public/<slug>/）
const SLUG = "my-video";
export const asset = (n) => staticFile(`${SLUG}/${n}`);
export const logo = (n) => staticFile(`logos/${n}`);

// 纸面小窗（实拍嵌入纸里，圆角+内衬+轻做旧）
export const Window = ({ src, w, h, delay = 0, rot = -1, startFrom = 0, style, objPos = "50% 50%", filter = "saturate(0.88) contrast(1.04) sepia(0.08)" }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [delay, delay + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sc = interpolate(f, [delay, delay + 14], [1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ width: w, height: h, borderRadius: 8, overflow: "hidden", opacity: op, transform: `rotate(${rot}deg) scale(${sc})`, boxShadow: "0 14px 30px rgba(26,22,10,0.28), inset 0 0 0 6px #FFFDF7", background: "#DED8C8", ...style }}>
      <OffthreadVideo muted src={src} startFrom={startFrom} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: objPos, filter }} />
    </div>
  );
};

// 大标题 / 次级文字
export const H1 = ({ children, size = 66, color = C.ink, style }) => (
  <div style={{ fontFamily: F.cn, fontSize: size, fontWeight: 800, color, lineHeight: 1.24, letterSpacing: 1, ...style }}>{children}</div>
);
export const Label = ({ children, size = 34, color = C.ink2, style }) => (
  <div style={{ fontFamily: F.cn, fontSize: size, fontWeight: 600, color, lineHeight: 1.35, ...style }}>{children}</div>
);
export const Num = ({ children, size = 66, color = C.ink, weight = 800, style }) => (
  <span style={{ display: "inline-block", fontFamily: F.num, fontSize: size, fontWeight: weight, color, fontVariantNumeric: "tabular-nums", lineHeight: 1.1, ...style }}>{children}</span>
);

// 手写批注体（红笔/铅笔）
export const Hand = ({ children, size = 40, color = C.red, rot = -2, style }) => (
  <div style={{ fontFamily: '"Hannotate SC", "HanziPen SC", "PingFang SC", cursive', fontSize: size, fontWeight: 600, color, transform: `rotate(${rot}deg)`, lineHeight: 1.3, ...style }}>{children}</div>
);

// logo 药丸（公司=logo圆角块+代码）
export const TickerPill = ({ src, code, delay = 0, size = 56, style }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [delay, delay + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [delay, delay + 12], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#FCFAF4", borderRadius: 16, padding: "10px 20px 10px 12px", boxShadow: "0 8px 18px rgba(26,22,10,0.18)", opacity: op, transform: `translateY(${y}px)`, ...style }}>
      <img src={src} style={{ width: size, height: size, borderRadius: 12 }} />
      <span style={{ display: "inline-block", fontFamily: F.num, fontSize: size * 0.62, fontWeight: 800, color: C.ink }}>{code}</span>
    </div>
  );
};

// SVG 折线逐段画出
export const DrawLine = ({ points, delay = 0, dur = 30, color = C.red, sw = 8, w, h, dash, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const d = points.map((pt, i) => `${i === 0 ? "M" : "L"}${pt[0]} ${pt[1]}`).join(" ");
  const len = points.reduce((acc, pt, i) => i === 0 ? 0 : acc + Math.hypot(pt[0] - points[i - 1][0], pt[1] - points[i - 1][1]), 0);
  return (
    <svg width={w} height={h} style={{ overflow: "visible", ...style }}>
      <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={dash ? `${dash} ${dash}` : len} strokeDashoffset={dash ? 0 : len * (1 - p)} opacity={dash ? p : 1} />
    </svg>
  );
};
