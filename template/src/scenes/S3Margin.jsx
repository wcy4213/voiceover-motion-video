import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, F, cardStyle } from "../theme.js";
import { Chip, Kicker, Pop, Rise } from "../components/ui.jsx";

// S3：周三真正要看 —— 汽车毛利率被挤压
export const S3Margin = () => {
  const frame = useCurrentFrame();
  const squeeze = interpolate(frame, [40, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const barW = 520 - squeeze * 200;
  const warn = frame > 100 ? 0.75 + 0.25 * Math.sin(frame / 6) : 0;

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Rise delay={0} style={{ marginTop: 96 }}>
        <Kicker>周三盘后 · 真正要看的</Kicker>
      </Rise>

      <Pop delay={8} style={{ marginTop: 34 }}>
        <div style={{ fontFamily: F.cn, fontSize: 80, fontWeight: 600, color: C.white, display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontSize: 72 }}>🚗</span> 汽车毛利率
        </div>
      </Pop>

      {/* 挤压动画 */}
      <div style={{ marginTop: 52, ...cardStyle, width: 860, padding: "44px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* 左箭头（挤压） */}
          <svg width={76} height={76} viewBox="0 0 90 90" style={{ transform: `translateX(${squeeze * 24}px)` }}>
            <path d="M12,17 L62,45 L12,73 Z" fill={C.purpleBright} opacity={0.95} />
            <rect x={68} y={33} width={12} height={24} rx={4} fill={C.purpleBright} opacity={0.5} />
          </svg>
          {/* 毛利率条 */}
          <div style={{ width: 540, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: barW,
                height: 92,
                borderRadius: 20,
                background: `linear-gradient(90deg, ${C.up}, rgba(46,189,133,0.55))`,
                boxShadow: "0 0 50px rgba(46,189,133,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.cn,
                fontSize: 38,
                fontWeight: 600,
                color: "#04321f",
              }}
            >
              毛利率
            </div>
          </div>
          {/* 右箭头（挤压） */}
          <svg width={76} height={76} viewBox="0 0 90 90" style={{ transform: `scaleX(-1) translateX(${squeeze * 24}px)` }}>
            <path d="M12,17 L62,45 L12,73 Z" fill={C.purpleBright} opacity={0.95} />
            <rect x={68} y={33} width={12} height={24} rx={4} fill={C.purpleBright} opacity={0.5} />
          </svg>
        </div>
        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 56, opacity: warn, transform: `scale(${0.9 + warn * 0.15})`, lineHeight: 1 }}>⚠️</div>
          <div style={{ fontFamily: F.cn, fontSize: 34, fontWeight: 600, color: C.white, opacity: warn }}>
            被明显压缩？
          </div>
        </div>
      </div>

      {/* 交付创纪录 ≠ 股价买账 */}
      <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 54 }}>
        <Pop delay={130}>
          <Chip size={38} border="rgba(46,189,133,0.6)" bg="rgba(46,189,133,0.12)">
            交付创纪录 ✅
          </Chip>
        </Pop>
        <Pop delay={148}>
          <span style={{ fontSize: 64, fontWeight: 800, color: C.yellow, fontFamily: F.num }}>≠</span>
        </Pop>
        <Pop delay={162}>
          <Chip size={38} border="rgba(246,70,93,0.6)" bg="rgba(246,70,93,0.12)">
            股价买账 ❌
          </Chip>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};
