import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F } from "../theme.js";
import { Chip, Kicker, Pop, Rise } from "../components/ui.jsx";

// S4：Robotaxi + FSD 撑起估值想象（热气球）
export const S4Robotaxi = () => {
  const frame = useCurrentFrame();
  const floatY = Math.sin(frame / 26) * 12;
  const sway = Math.sin(frame / 34) * 4;

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Rise delay={0} style={{ marginTop: 108 }}>
        <Kicker>看点二 · 未来的想象</Kicker>
      </Rise>

      {/* 热气球 = 估值想象 */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${floatY}px) rotate(${sway}deg)` }}>
        <Pop delay={8}>
          <div style={{ fontSize: 210, lineHeight: 1, filter: "drop-shadow(0 20px 60px rgba(249,243,57,0.25))" }}>🎈</div>
        </Pop>
        <Pop delay={20} style={{ marginTop: -16 }}>
          <Chip size={40} border={C.yellow} bg="rgba(29,0,56,0.75)" color={C.yellow}>
            估值想象 ☁️
          </Chip>
        </Pop>
      </div>

      {/* 拉住气球的两根绳 + 两个支点 */}
      <svg width={760} height={150} viewBox="0 0 760 150" style={{ marginTop: 12 }}>
        <line x1={380 + sway * 3} y1={floatY - 12} x2={175} y2={140} stroke={C.purpleBright} strokeWidth={4} strokeDasharray="14 12" opacity={0.75} />
        <line x1={380 + sway * 3} y1={floatY - 12} x2={585} y2={140} stroke={C.purpleBright} strokeWidth={4} strokeDasharray="14 12" opacity={0.75} />
      </svg>

      <div style={{ display: "flex", gap: 130, marginTop: 4 }}>
        <Pop delay={26}>
          <div style={{ width: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 100 }}>🤖</div>
            <Chip size={38}>Robotaxi</Chip>
          </div>
        </Pop>
        <Pop delay={38}>
          <div style={{ width: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 100 }}>🧠</div>
            <Chip size={38}>FSD</Chip>
          </div>
        </Pop>
      </div>

      <Rise delay={70} style={{ marginTop: 36 }}>
        <div style={{ fontFamily: F.cn, fontSize: 44, fontWeight: 600, color: C.white }}>
          这两个，快撑起了特斯拉的未来 🔭
        </div>
      </Rise>
    </AbsoluteFill>
  );
};
