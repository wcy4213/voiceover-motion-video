// BobbyCallout — Bobby AI 前置位组件（2026-09-10 起铁律：每条视频前 30 秒内必出一次 app icon + 官方字标）
// 用法：<BobbyCallout from={口播说到"用 Bobby AI"的帧} hold={75} tone="light" corner="br" />
//   from   入场帧（对齐口播"用 Bobby AI …"那一拍）
//   hold   停留帧数，默认 75 ≈ 2.5s，到点自动滑出；不常驻
//   tone   light = 白字标（深底/黑点阵）；purple / ink = 浅底（纸面皮肤）
//   corner br / bl / tr / tl 四角；或传 style 覆盖定位
//   label  字标下一行小字，默认"整理"（来源署名语义），传 "" 关闭
// 素材：public/logos/BobbyAI_icon.png（独角兽 app icon）+ BobbyAI_light/purple/ink.png（官方字标）。禁手打 "Bobby AI" 文字。
import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

const CN = '"PingFang SC", "Hiragino Sans GB", "Heiti SC", sans-serif';

export const BobbyCallout = ({ from = 0, hold = 75, tone = "light", corner = "br", size = 1, label = "整理", style }) => {
  const f = useCurrentFrame();
  const t = f - from;
  if (t < 0 || t > hold + 14) return null;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
  const inP = interpolate(t, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const outP = interpolate(t, [hold, hold + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const fromRight = corner.endsWith("r");
  const dir = fromRight ? 1 : -1;
  const dx = ((1 - inP) * 140 + outP * 140) * dir;
  const iconPop = interpolate(t, [0, 10], [0.6, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const wordP = interpolate(t, [8, 18], [0, 1], clamp);
  const dark = tone === "light";
  const pos = { position: "absolute", ...(corner.startsWith("b") ? { bottom: 120 } : { top: 150 }), ...(fromRight ? { right: 56 } : { left: 56 }) };
  const iconPx = 84 * size;
  const wordmark = dark ? "logos/BobbyAI_light.png" : tone === "ink" ? "logos/BobbyAI_ink.png" : "logos/BobbyAI_purple.png";
  return (
    <div style={{ ...pos, display: "flex", alignItems: "center", gap: 16 * size, padding: `${12 * size}px ${22 * size}px ${12 * size}px ${12 * size}px`, borderRadius: 999,
      background: dark ? "rgba(20,10,40,0.82)" : "rgba(255,255,255,0.92)", border: `2px solid ${dark ? "rgba(160,80,255,0.55)" : "rgba(111,0,255,0.25)"}`,
      boxShadow: dark ? "0 12px 32px rgba(111,0,255,0.35)" : "0 10px 26px rgba(29,0,56,0.18)", backdropFilter: "blur(6px)",
      opacity: (1 - outP) * Math.min(1, inP * 1.4), transform: `translateX(${dx}px)`, ...style }}>
      <Img src={staticFile("logos/BobbyAI_icon.png")} style={{ width: iconPx, height: iconPx, borderRadius: iconPx * 0.24, background: "#fff", display: "block", transform: `scale(${iconPop})` }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 * size, opacity: wordP, transform: `translateX(${(1 - wordP) * -12}px)` }}>
        <Img src={staticFile(wordmark)} style={{ height: 40 * size, display: "block" }} />
        {label ? <div style={{ fontFamily: CN, fontSize: 22 * size, fontWeight: 600, letterSpacing: 2, color: dark ? "rgba(240,230,255,0.85)" : "rgba(29,0,56,0.7)" }}>{label}</div> : null}
      </div>
    </div>
  );
};
