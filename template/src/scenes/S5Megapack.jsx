import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme.js";
import { Chip, CountUp, Kicker, Pop, Rise } from "../components/ui.jsx";

// S5：容易被忽略的储能 —— Megapack 电池块堆叠
const COLS = 6;
const ROWS = 3;

export const S5Megapack = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bolt = frame > 60 ? 0.8 + 0.2 * Math.sin(frame / 5) : 0;

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Rise delay={0} style={{ marginTop: 108 }}>
        <Kicker>还有一块 · 容易被忽略 🔋</Kicker>
      </Rise>

      <Pop delay={8} style={{ marginTop: 18 }}>
        <div style={{ fontFamily: F.cn, fontSize: 72, fontWeight: 600, color: C.white }}>
          储能 Megapack
        </div>
      </Pop>

      {/* 电池块自下而上逐块点亮 */}
      <div style={{ marginTop: 78, position: "relative" }}>
        <div style={{ position: "absolute", top: -74, left: "50%", transform: `translateX(-50%) scale(${0.9 + bolt * 0.2})`, fontSize: 64, opacity: bolt, lineHeight: 1 }}>
          ⚡
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 106px)`,
            gap: 10,
            padding: 22,
            borderRadius: 26,
            border: `3px solid rgba(160,80,255,0.5)`,
            background: "rgba(111,0,255,0.10)",
          }}
        >
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            // 从底行开始点亮
            const row = Math.floor(i / COLS);
            const order = (ROWS - 1 - row) * COLS + (i % COLS);
            const p = spring({ frame: frame - 22 - order * 2.2, fps, config: { damping: 13 } });
            return (
              <div
                key={i}
                style={{
                  width: 106,
                  height: 72,
                  borderRadius: 12,
                  background: `linear-gradient(180deg, ${C.up}, #1b8f63)`,
                  boxShadow: "0 0 22px rgba(46,189,133,0.35)",
                  transform: `scale(${p})`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 13.5 GWh */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 40 }}>
        <CountUp
          to={13.5}
          decimals={1}
          delay={54}
          dur={40}
          style={{ fontSize: 128, fontWeight: 800, color: C.white, lineHeight: 1 }}
        />
        <span style={{ fontFamily: F.num, fontSize: 52, fontWeight: 700, color: C.blue2 }}>GWh</span>
        <span style={{ fontFamily: F.cn, fontSize: 32, fontWeight: 600, color: C.blue3, opacity: 0.9 }}>
          二季度部署量
        </span>
      </div>

      <div style={{ display: "flex", gap: 24, marginTop: 34 }}>
        <Pop delay={92}>
          <Chip size={36} border="rgba(46,189,133,0.65)" bg="rgba(46,189,133,0.13)" color={C.up}>
            同比 +40% ↑
          </Chip>
        </Pop>
        <Pop delay={108}>
          <Chip size={36} color={C.blue3}>略超预期 ✅</Chip>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};
