import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, F, cardStyle } from "../theme.js";
import { TL } from "../timeline.js";
import { Chip, CountUp, Kicker, Pop, Rise } from "../components/ui.jsx";

const FORK = TL.s1_fork - TL.s1; // 岔路口出现

// 纳指下行折线（示意）
const PTS = [
  [30, 90], [110, 70], [190, 120], [270, 100], [350, 160],
  [430, 140], [510, 210], [590, 250], [670, 232], [750, 300],
];
const pathD = PTS.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");

export const S1Market = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [10, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const aOut = interpolate(frame, [FORK - 10, FORK + 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const LINE_LEN = 1000;
  const tip = PTS[Math.min(PTS.length - 1, Math.floor(draw * (PTS.length - 1) + 0.999))];

  // 获利了结：飞走的钱袋
  const coins = [0, 1, 2].map((i) => {
    const t = interpolate(frame, [70 + i * 14, 120 + i * 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { t, key: i };
  });

  // 岔路：两条分支线
  const branch = interpolate(frame, [FORK + 4, FORK + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      {/* Beat A：上周复盘 */}
      <div style={{ opacity: aOut, position: "absolute", top: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Rise delay={0} style={{ marginTop: 60 }}>
          <Kicker>上周复盘</Kicker>
        </Rise>

        <Pop delay={6} style={{ marginTop: 30 }}>
          <div style={{ ...cardStyle, width: 860, padding: "34px 44px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontFamily: F.cn, fontSize: 40, fontWeight: 600, color: C.white }}>
                纳斯达克指数
              </div>
              <CountUp
                to={-2.9}
                decimals={1}
                delay={14}
                dur={40}
                suffix="%"
                style={{ fontSize: 80, fontWeight: 800, color: C.down }}
              />
            </div>
            <svg width={772} height={280} viewBox="0 0 780 330" preserveAspectRatio="none" style={{ marginTop: 6 }}>
              {[70, 150, 230, 310].map((y) => (
                <line key={y} x1={0} y1={y} x2={780} y2={y} stroke={C.purpleBright} strokeOpacity={0.16} strokeWidth={1.5} />
              ))}
              <path
                d={pathD}
                fill="none"
                stroke={C.down}
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={LINE_LEN}
                strokeDashoffset={LINE_LEN * (1 - draw)}
              />
              {draw > 0.05 ? (
                <circle cx={tip[0]} cy={tip[1]} r={12 + 3 * Math.sin(frame / 5)} fill={C.down} opacity={0.9} />
              ) : null}
            </svg>
          </div>
        </Pop>

        {/* 半导体获利了结 */}
        <Rise delay={64} style={{ marginTop: 30 }}>
          <div style={{ position: "relative", display: "flex", gap: 24, alignItems: "center" }}>
            <Chip size={34} border="rgba(246,70,93,0.55)" bg="rgba(246,70,93,0.12)">
              <span style={{ fontSize: 40 }}>💾</span> 半导体 · 获利了结
            </Chip>
            <Rise delay={150}>
              <Chip size={32} color={C.blue3}>市场情绪 · 偏谨慎 🫨</Chip>
            </Rise>
            {coins.map(({ t, key }) => (
              <div
                key={key}
                style={{
                  position: "absolute",
                  left: 380 + t * 170,
                  top: -t * 130 - key * 14,
                  fontSize: 40,
                  opacity: t === 0 ? 0 : 1 - t,
                  transform: `rotate(${t * 30}deg)`,
                }}
              >
                💰
              </div>
            ))}
          </div>
        </Rise>
      </div>

      {/* Beat B：本周财报 = 岔路口 */}
      <div style={{ opacity: 1 - aOut, position: "absolute", top: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Rise delay={FORK} style={{ marginTop: 92 }}>
          <Kicker>所以，这周的财报决定了</Kicker>
        </Rise>
        <Pop delay={FORK + 4} style={{ marginTop: 44 }}>
          <div
            style={{
              fontFamily: F.cn,
              fontSize: 56,
              fontWeight: 600,
              color: C.white,
              background: "rgba(111,0,255,0.3)",
              border: `3px solid ${C.purpleBright}`,
              borderRadius: 28,
              padding: "26px 52px",
              boxShadow: "0 0 70px rgba(111,0,255,0.5)",
            }}
          >
            AI 交易 · 走向何方
          </div>
        </Pop>

        {/* 两条分支 */}
        <svg width={900} height={185} viewBox="0 0 900 185" style={{ marginTop: -4 }}>
          <path
            d="M450,8 C450,90 250,75 250,162"
            fill="none"
            stroke={C.yellow}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={360}
            strokeDashoffset={360 * (1 - branch)}
            opacity={0.85}
          />
          <path
            d="M450,8 C450,90 650,75 650,162"
            fill="none"
            stroke={C.blue1}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={360}
            strokeDashoffset={360 * (1 - branch)}
            opacity={0.85}
          />
        </svg>

        <div style={{ display: "flex", gap: 120, marginTop: 0 }}>
          <Pop delay={FORK + 26}>
            <div style={{ width: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 104 }}>🔥</div>
              <Chip size={40} border={C.yellow} bg="rgba(249,243,57,0.1)" color={C.yellow}>
                重新点火
              </Chip>
            </div>
          </Pop>
          <Pop delay={FORK + 34}>
            <div style={{ width: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 104 }}>🧊</div>
              <Chip size={40} border="rgba(124,156,253,0.7)" bg="rgba(124,156,253,0.12)" color={C.blue2}>
                继续调整
              </Chip>
            </div>
          </Pop>
        </div>
      </div>
    </AbsoluteFill>
  );
};
