import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, F, cardStyle } from "../theme.js";
import { TL } from "../timeline.js";
import { Chip, CountUp, Kicker, Pop, Rise } from "../components/ui.jsx";
import { TickerChip } from "../components/TickerChip.jsx";

const VOL = TL.s7_vol - TL.s7; // ±15% 隐含波动
const EPS = TL.s7_eps - TL.s7; // EPS 扭亏
const A18 = TL.s7_18a - TL.s7; // 18A 制程

// 过山车折线：冲高 +163%，末端回撤 -13%
const UP_PTS = [
  [20, 330], [120, 320], [210, 290], [300, 240], [390, 200],
  [470, 140], [550, 90], [630, 60],
];
const DOWN_PTS = [[630, 60], [700, 78], [760, 120]];
const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");

export const S7Intel = () => {
  const frame = useCurrentFrame();

  const upDraw = interpolate(frame, [40, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const downDraw = interpolate(frame, [180, 215], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const aOut = interpolate(frame, [VOL - 10, VOL + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bOut = interpolate(frame, [EPS - 10, EPS + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cOut = interpolate(frame, [A18 - 10, A18 + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat B：大涨/大跌 交替脉冲
  const pulse = Math.sin((frame - VOL) / 9);

  // Beat C：硬币翻面（红 -$0.10 → 绿 +$2.20）
  const flip = interpolate(frame, [EPS + 14, EPS + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const rotY = flip * 540; // 一次半翻转，结束在背面
  const showBack = ((rotY + 90) % 360) > 180;

  // Beat D：晶圆旋转
  const waferSpin = (frame - A18) * 0.5;

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      {/* Beat A：过山车 */}
      <div style={{ position: "absolute", top: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: aOut }}>
        <div style={{ marginTop: 100, display: "flex", alignItems: "center", gap: 40 }}>
          <TickerChip symbol="INTC" name="英特尔" delay={2} logoSize={116} nameSize={52} />
          <Rise delay={24}>
            <Chip size={34} border={C.yellow} bg="rgba(249,243,57,0.09)" color={C.yellow}>
              本周 · 可能波动最大 🎢
            </Chip>
          </Rise>
        </div>

        <Pop delay={36} style={{ marginTop: 34 }}>
          <div style={{ ...cardStyle, width: 880, padding: "30px 40px 20px" }}>
            <svg width={800} height={310} viewBox="0 0 800 370" preserveAspectRatio="none">
              {[80, 170, 260, 350].map((y) => (
                <line key={y} x1={0} y1={y} x2={800} y2={y} stroke={C.purpleBright} strokeOpacity={0.15} strokeWidth={1.5} />
              ))}
              <path
                d={toPath(UP_PTS)}
                fill="none"
                stroke={C.up}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={900}
                strokeDashoffset={900 * (1 - upDraw)}
              />
              <path
                d={toPath(DOWN_PTS)}
                fill="none"
                stroke={C.down}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={200}
                strokeDashoffset={200 * (1 - downDraw)}
              />
              {downDraw > 0.95 ? (
                <circle cx={760} cy={120} r={12 + 3 * Math.sin(frame / 5)} fill={C.down} />
              ) : null}
            </svg>
          </div>
        </Pop>

        <div style={{ display: "flex", gap: 26, marginTop: 28 }}>
          <Pop delay={100}>
            <Chip size={34} border="rgba(46,189,133,0.65)" bg="rgba(46,189,133,0.13)" color={C.up}>
              一季报后 · 低点以来 +163% 🚀
            </Chip>
          </Pop>
          <Pop delay={205}>
            <Chip size={34} border="rgba(246,70,93,0.6)" bg="rgba(246,70,93,0.12)" color={C.down}>
              最近一周 -13%
            </Chip>
          </Pop>
        </div>
      </div>

      {/* Beat B：±15% 大涨或大跌 */}
      <div style={{ position: "absolute", top: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: frame >= VOL ? bOut : 0 }}>
        <Rise delay={VOL} style={{ marginTop: 108 }}>
          <Kicker>期权市场 · 已经承认了</Kicker>
        </Rise>
        <div style={{ display: "flex", gap: 40, marginTop: 48, alignItems: "center" }}>
          <Pop delay={VOL + 10}>
            <div
              style={{
                width: 280,
                height: 340,
                borderRadius: 36,
                background: "rgba(46,189,133,0.13)",
                border: `3px solid rgba(46,189,133,${0.5 + 0.4 * Math.max(0, pulse)})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                transform: `scale(${1 + Math.max(0, pulse) * 0.05})`,
              }}
            >
              <svg width={104} height={104} viewBox="0 0 130 130">
                <path d="M65,12 L118,80 L86,80 L86,118 L44,118 L44,80 L12,80 Z" fill={C.up} />
              </svg>
              <div style={{ fontFamily: F.cn, fontSize: 52, fontWeight: 600, color: C.up }}>大涨</div>
            </div>
          </Pop>
          <Pop delay={VOL + 18}>
            <div
              style={{
                fontFamily: F.num,
                fontSize: 70,
                fontWeight: 800,
                color: C.white,
                background: C.purple,
                borderRadius: 28,
                padding: "20px 28px",
                boxShadow: "0 0 70px rgba(111,0,255,0.6)",
                zIndex: 3,
              }}
            >
              ±15%
            </div>
          </Pop>
          <Pop delay={VOL + 10}>
            <div
              style={{
                width: 280,
                height: 340,
                borderRadius: 36,
                background: "rgba(246,70,93,0.13)",
                border: `3px solid rgba(246,70,93,${0.5 + 0.4 * Math.max(0, -pulse)})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                transform: `scale(${1 + Math.max(0, -pulse) * 0.05})`,
              }}
            >
              <svg width={104} height={104} viewBox="0 0 130 130" style={{ transform: "rotate(180deg)" }}>
                <path d="M65,12 L118,80 L86,80 L86,118 L44,118 L44,80 L12,80 Z" fill={C.down} />
              </svg>
              <div style={{ fontFamily: F.cn, fontSize: 52, fontWeight: 600, color: C.down }}>大跌</div>
            </div>
          </Pop>
        </div>
        <Rise delay={VOL + 60} style={{ marginTop: 44 }}>
          <div style={{ fontFamily: F.cn, fontSize: 44, fontWeight: 600, color: C.white }}>
            财报后隐含波动：<span style={{ color: C.yellow }}>不是大涨，就是大跌</span>
          </div>
        </Rise>
      </div>

      {/* Beat C：EPS 扭亏硬币翻面 */}
      <div style={{ position: "absolute", top: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: frame >= EPS ? cOut : 0 }}>
        <Rise delay={EPS} style={{ marginTop: 108 }}>
          <Kicker>先看 · 扭亏能不能坐实</Kicker>
        </Rise>
        <div style={{ marginTop: 44, perspective: 1400 }}>
          <div
            style={{
              width: 380,
              height: 380,
              position: "relative",
              transformStyle: "preserve-3d",
              transform: `rotateY(${rotY}deg)`,
            }}
          >
            {/* 正面：去年亏损 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, rgba(246,70,93,0.5), rgba(246,70,93,0.16) 70%)",
                border: `5px solid ${C.down}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backfaceVisibility: "hidden",
                opacity: showBack ? 0 : 1,
              }}
            >
              <div style={{ fontFamily: F.num, fontSize: 90, fontWeight: 800, color: C.down }}>-$0.10</div>
              <div style={{ fontFamily: F.cn, fontSize: 32, fontWeight: 600, color: C.grey, opacity: 0.85 }}>去年同期 EPS</div>
            </div>
            {/* 背面：本季预期 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, rgba(46,189,133,0.55), rgba(46,189,133,0.18) 70%)",
                border: `5px solid ${C.up}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                opacity: showBack ? 1 : 0,
              }}
            >
              <div style={{ fontFamily: F.num, fontSize: 90, fontWeight: 800, color: C.up }}>+$2.20</div>
              <div style={{ fontFamily: F.cn, fontSize: 32, fontWeight: 600, color: C.grey }}>本季预期 EPS</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 46 }}>
          <Pop delay={EPS + 130}>
            <Chip size={34} color={C.white}>
              营收预期 <span style={{ fontFamily: F.num, fontWeight: 800 }}>$144亿</span>
            </Chip>
          </Pop>
          <Pop delay={EPS + 146}>
            <Chip size={34} border="rgba(46,189,133,0.65)" bg="rgba(46,189,133,0.13)" color={C.up}>
              同比 +12%
            </Chip>
          </Pop>
        </div>
      </div>

      {/* Beat D：18A + 代工 */}
      <div style={{ position: "absolute", top: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: frame >= A18 ? 1 : 0 }}>
        <Rise delay={A18} style={{ marginTop: 108 }}>
          <Kicker>然后 · 看两件硬事</Kicker>
        </Rise>

        <div style={{ display: "flex", gap: 70, marginTop: 44, alignItems: "center" }}>
          <Pop delay={A18 + 8}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              {/* 晶圆 */}
              <svg width={270} height={270} viewBox="0 0 340 340">
                <circle cx={170} cy={170} r={158} fill="rgba(124,156,253,0.14)" stroke={C.blue1} strokeWidth={5} />
                <g transform={`rotate(${waferSpin} 170 170)`} opacity={0.8}>
                  {[-120, -80, -40, 0, 40, 80, 120].map((o) => (
                    <React.Fragment key={o}>
                      <line x1={170 + o} y1={30} x2={170 + o} y2={310} stroke={C.blue2} strokeWidth={2.5} opacity={0.55} clipPath="url(#wc)" />
                      <line x1={30} y1={170 + o} x2={310} y2={170 + o} stroke={C.blue2} strokeWidth={2.5} opacity={0.55} clipPath="url(#wc)" />
                    </React.Fragment>
                  ))}
                </g>
                <clipPath id="wc">
                  <circle cx={170} cy={170} r={152} />
                </clipPath>
              </svg>
              <Chip size={34}>
                18A 制程 · 良率 <span style={{ color: C.yellow }}>❓</span>
              </Chip>
            </div>
          </Pop>
          <Pop delay={A18 + 26}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <div style={{ fontSize: 160, lineHeight: "270px" }}>🤝</div>
              <Chip size={34}>代工客户 · 进展</Chip>
            </div>
          </Pop>
        </div>

        <Rise delay={A18 + 100} style={{ marginTop: 48 }}>
          <div style={{ fontFamily: F.cn, fontSize: 44, fontWeight: 600, color: C.white, textAlign: "center", lineHeight: 1.5 }}>
            <span style={{ fontFamily: F.num, fontWeight: 800, color: C.up }}>+163%</span> 的涨幅，基本面<span style={{ color: C.yellow }}>接得住吗？</span>
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};
