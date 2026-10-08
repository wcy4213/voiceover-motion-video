import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme.js";
import { TL } from "../timeline.js";
import { Chip, CountUp, Kicker, Pop, Rise, useShake } from "../components/ui.jsx";
import { TickerChip } from "../components/TickerChip.jsx";

const DROP = TL.s2_drop - TL.s2; // 股价 -7.5%
const PRICE = TL.s2_price - TL.s2; // 低价换量？

// 车辆象形阵列：8 列 × 4 行 = 48万辆（每格 1.5 万）
const CAR_COLS = 8;
const CAR_ROWS = 4;

export const S2TeslaDelivery = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shake = useShake(DROP + 8, 12, 6);

  // Beat A 整组：DROP 时上移缩小让位，PRICE 时彻底退场
  const aShift = interpolate(frame, [DROP - 4, DROP + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bOut = interpolate(frame, [PRICE - 6, PRICE + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cIn = 1 - bOut;

  const redFlash = interpolate(frame, [DROP + 6, DROP + 10, DROP + 26], [0, 0.14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 剪刀切价签
  const cut = interpolate(frame, [PRICE + 16, PRICE + 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagFall = interpolate(frame, [PRICE + 46, PRICE + 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", transform: `translate(${shake.x}px, ${shake.y}px)` }}>
      {/* 红色冲击闪光 */}
      <AbsoluteFill style={{ background: C.down, opacity: redFlash, zIndex: 5 }} />

      {/* Beat A：交付成绩 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(${aShift * -96}px) scale(${1 - aShift * 0.3})`,
          opacity: (1 - aShift * 0.72) * bOut,
        }}
      >
        <div style={{ marginTop: 108, opacity: 1 - aShift }}>
          <TickerChip symbol="TSLA" name="特斯拉" delay={2} logoSize={116} nameSize={52} />
        </div>
        <Rise delay={26} style={{ marginTop: 22 }}>
          <Kicker>
            Q2 交付成绩 <Chip size={24} style={{ padding: "6px 18px" }} color={C.blue3}>7·2 已公布</Chip>
          </Kicker>
        </Rise>

        {/* 车辆阵列 */}
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: `repeat(${CAR_COLS}, 74px)`, gap: 3 }}>
          {Array.from({ length: CAR_COLS * CAR_ROWS }, (_, i) => {
            const p = spring({ frame: frame - 34 - i * 1.6, fps, config: { damping: 12 } });
            return (
              <div key={i} style={{ fontSize: 54, lineHeight: 1.15, transform: `scale(${p})`, textAlign: "center" }}>
                🚗
              </div>
            );
          })}
        </div>

        {/* 大数字 48万辆 + 徽章 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 16 }}>
          <CountUp
            to={48}
            delay={40}
            dur={44}
            style={{ fontSize: 140, fontWeight: 800, color: C.white, lineHeight: 1, textShadow: "0 0 80px rgba(160,80,255,0.5)" }}
          />
          <span style={{ fontFamily: F.cn, fontSize: 52, fontWeight: 600, color: C.white }}>万辆</span>
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 22 }}>
          <Pop delay={96}>
            <Chip size={32} border="rgba(46,189,133,0.65)" bg="rgba(46,189,133,0.13)" color={C.up}>
              同比 +25% ↑
            </Chip>
          </Pop>
          <Pop delay={112}>
            <Chip size={32} border="rgba(46,189,133,0.65)" bg="rgba(46,189,133,0.13)" color={C.up}>
              超预期 +7万辆
            </Chip>
          </Pop>
          <Pop delay={132}>
            <Chip size={32} border={C.yellow} bg="rgba(249,243,57,0.1)" color={C.yellow}>
              历史第二高 🥈
            </Chip>
          </Pop>
        </div>
      </div>

      {/* Beat B：但当天股价 -7.5% */}
      <div
        style={{
          position: "absolute",
          top: 596,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: frame >= DROP ? bOut : 0,
        }}
      >
        <Pop delay={DROP + 2} from={1.9} damping={11}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <span style={{ fontSize: 88, lineHeight: 1 }}>🔻</span>
            <span style={{ fontSize: 170, fontWeight: 800, fontFamily: F.num, color: C.down, textShadow: "0 0 90px rgba(246,70,93,0.45)", lineHeight: 1 }}>
              -7.5%
            </span>
          </div>
        </Pop>
        <Rise delay={DROP + 26} style={{ marginTop: 24 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Chip size={34} border="rgba(246,70,93,0.6)" bg="rgba(246,70,93,0.12)" color={C.white}>
              当天股价 · 近一年最差单日
            </Chip>
            <Rise delay={DROP + 60}>
              <div style={{ fontFamily: F.cn, fontSize: 40, fontWeight: 600, color: C.blue3 }}>
                交付大超 ✅ 股价大跌 ❓
              </div>
            </Rise>
          </div>
        </Rise>
      </div>

      {/* Beat C：低价换量？→ 单车利润 */}
      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: cIn,
        }}
      >
        <Rise delay={PRICE + 2}>
          <div style={{ fontFamily: F.cn, fontSize: 54, fontWeight: 600, color: C.white }}>
            市场在担心：<span style={{ color: C.yellow }}>低价换量？</span>
          </div>
        </Rise>

        {/* 价签被剪 */}
        <div style={{ position: "relative", marginTop: 70, height: 250 }}>
          <div
            style={{
              fontSize: 190,
              lineHeight: 1,
              transform: `rotate(${tagFall * 60}deg) translateY(${tagFall * 190}px)`,
              opacity: 1 - tagFall,
            }}
          >
            🏷️
          </div>
          <div
            style={{
              position: "absolute",
              left: -150 + cut * 210,
              top: 44,
              fontSize: 110,
              transform: "scaleX(-1) rotate(-14deg)",
              opacity: frame >= PRICE + 12 && cut < 1 ? 1 : 0,
            }}
          >
            ✂️
          </div>
        </div>

        <Pop delay={PRICE + 84} style={{ marginTop: 44 }}>
          <Chip size={40} border={C.purpleBright} bg="rgba(111,0,255,0.28)">
            现在更关键的是 → <span style={{ color: C.yellow, fontWeight: 600 }}>单车利润 💰</span>
          </Chip>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};
