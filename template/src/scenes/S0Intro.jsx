import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme.js";
import { TL } from "../timeline.js";
import { Chip, CountUp, Pop, Rise } from "../components/ui.jsx";
import { Logo } from "../components/TickerChip.jsx";

const CAL = TL.s0_calendar - TL.s0; // 日历入场
const Q = TL.s0_question - TL.s0; // “主要看什么”

const MATRIX = [
  "AAPL", "MSFT", "NVDA", "AMZN", "META", "NFLX", "JPM", "V",
  "KO", "MCD", "TSLA", "GOOGL", "INTC", "IBM", "GM", "AXP",
];

const DAYS = [
  { label: "周一", logos: [] },
  { label: "周二", logos: [] },
  { label: "周三", logos: ["GOOGL", "TSLA"], tag: "🌙 盘后", hot: true },
  { label: "周四", logos: ["INTC"], tag: "🌙 盘后" },
  { label: "周五", logos: [] },
];

const DayCell = ({ day, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 周三 logo 在 CAL+18 起弹入，周四在 CAL+72（对应口播“周四还有英特尔”）
  const stampAt = day.label === "周四" ? CAL + 72 : CAL + 18;
  const ringPulse = day.hot ? 0.5 + 0.5 * Math.sin((frame - CAL) / 7) : 0;
  return (
    <Rise delay={CAL + index * 3} dist={50}>
      <div
        style={{
          width: 170,
          height: 258,
          borderRadius: 26,
          background: day.logos.length
            ? "rgba(111,0,255,0.22)"
            : "rgba(160,80,255,0.07)",
          border: day.hot
            ? `3px solid rgba(249,243,57,${0.45 + 0.45 * ringPulse})`
            : "2px solid rgba(160,80,255,0.32)",
          boxShadow: day.hot
            ? `0 0 ${30 + 22 * ringPulse}px rgba(249,243,57,0.22)`
            : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 16,
          gap: 10,
        }}
      >
        <div style={{ fontFamily: F.cn, fontSize: 30, fontWeight: 600, color: day.logos.length ? C.white : C.blue2, opacity: day.logos.length ? 1 : 0.55 }}>
          {day.label}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          {day.logos.map((sym, i) => {
            const p = spring({ frame: frame - stampAt - i * 8, fps, config: { damping: 11 } });
            return (
              <div key={sym} style={{ transform: `scale(${p}) rotate(${(1 - p) * -10}deg)`, opacity: frame >= stampAt + i * 8 ? 1 : 0 }}>
                <Logo symbol={sym} size={62} />
              </div>
            );
          })}
        </div>
        {day.tag && frame >= stampAt + 14 ? (
          <div style={{ fontFamily: F.cn, fontSize: 22, fontWeight: 600, color: C.blue3, opacity: interpolate(frame, [stampAt + 14, stampAt + 22], [0, 0.9], { extrapolateRight: "clamp" }) }}>
            {day.tag}
          </div>
        ) : null}
      </div>
    </Rise>
  );
};

export const S0Intro = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      {/* logo 列队（8×2，陪衬 407 家，日历出现前淡出） */}
      <div
        style={{
          position: "absolute",
          top: 556,
          display: "grid",
          gridTemplateColumns: "repeat(8, 84px)",
          gap: 22,
          opacity: interpolate(frame, [40, 60, CAL - 16, CAL - 2], [0, 1, 1, 0]),
        }}
      >
        {MATRIX.map((sym, i) => (
          <Rise key={sym} delay={44 + i * 2} dist={30}>
            <div style={{ transform: `translateY(${Math.sin(frame / 34 + i * 1.7) * 5}px)`, opacity: 0.55 }}>
              <Logo symbol={sym} size={84} />
            </div>
          </Rise>
        ))}
      </div>

      {/* 星芒 + 标题 */}
      <Pop delay={2} style={{ marginTop: 42 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div
            style={{
              fontSize: 46,
              color: C.yellow,
              transform: `rotate(${frame * 0.8}deg)`,
              textShadow: "0 0 40px rgba(249,243,57,0.6)",
              lineHeight: 1,
            }}
          >
            ✦
          </div>
          <div style={{ fontFamily: F.cn, fontSize: 84, fontWeight: 600, color: C.white, letterSpacing: 4, textShadow: "0 6px 60px rgba(111,0,255,0.8)" }}>
            Q2 财报季
          </div>
          <Chip size={30} style={{ marginTop: 4, padding: "10px 26px" }} color={C.blue3}>
            美股 · 本周迎来高峰 🏔️
          </Chip>
        </div>
      </Pop>

      {/* 407 家 大数字 */}
      <Rise delay={46} style={{ marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, justifyContent: "center" }}>
          <CountUp
            to={407}
            delay={50}
            dur={40}
            style={{ fontSize: 150, fontWeight: 800, color: C.yellow, textShadow: "0 0 90px rgba(249,243,57,0.35)", lineHeight: 1 }}
          />
          <span style={{ fontFamily: F.cn, fontSize: 44, fontWeight: 600, color: C.white }}>家</span>
          <span style={{ fontFamily: F.cn, fontSize: 34, fontWeight: 600, color: C.blue3, opacity: 0.9 }}>
            公司本周交卷 📝
          </span>
        </div>
      </Rise>

      {/* 本周日历 */}
      <div style={{ position: "absolute", top: 556, display: "flex", gap: 20 }}>
        {DAYS.map((d, i) => (
          <DayCell key={d.label} day={d} index={i} />
        ))}
      </div>

      {/* 这周财报主要看什么 */}
      <Rise delay={Q} style={{ position: "absolute", top: 892 }}>
        <div style={{ fontFamily: F.cn, fontSize: 52, fontWeight: 600, color: C.white, display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontSize: 56 }}>👀</span>
          这周财报，主要看什么？
        </div>
      </Rise>
    </AbsoluteFill>
  );
};
