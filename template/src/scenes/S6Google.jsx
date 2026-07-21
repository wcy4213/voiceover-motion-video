import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, F, cardStyle } from "../theme.js";
import { TL } from "../timeline.js";
import { Chip, CountUp, Kicker, Pop, Rise } from "../components/ui.jsx";
import { TickerChip } from "../components/TickerChip.jsx";

const EXPECT = TL.s6_expect - TL.s6; // 预期抬高
const C1 = TL.s6_c1 - TL.s6; // 看点①
const C2 = TL.s6_c2 - TL.s6; // 看点②
const C3 = TL.s6_c3 - TL.s6; // 看点③

const StatRow = ({ delay, emoji, label, children }) => (
  <Pop delay={delay}>
    <div
      style={{
        ...cardStyle,
        width: 860,
        padding: "22px 40px",
        display: "flex",
        alignItems: "center",
        gap: 28,
      }}
    >
      <div style={{ fontSize: 58 }}>{emoji}</div>
      <div style={{ fontFamily: F.cn, fontSize: 38, fontWeight: 600, color: C.white, flex: 1 }}>{label}</div>
      {children}
    </div>
  </Pop>
);

// 仪表盘（预期被抬得很高）
const Gauge = ({ start }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start + 10, start + 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const angle = -90 + t * 152; // 指到高位区
  const cx = 280;
  const cy = 264;
  const r = 206;
  const arc = (a0, a1, color, w) => {
    const p0 = [cx + r * Math.cos((a0 * Math.PI) / 180), cy + r * Math.sin((a0 * Math.PI) / 180)];
    const p1 = [cx + r * Math.cos((a1 * Math.PI) / 180), cy + r * Math.sin((a1 * Math.PI) / 180)];
    return <path d={`M${p0[0]},${p0[1]} A${r},${r} 0 0 1 ${p1[0]},${p1[1]}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />;
  };
  return (
    <svg width={560} height={330} viewBox="0 0 560 330">
      {arc(-180, -68, "rgba(160,80,255,0.35)", 30)}
      {arc(-68, 0, C.yellow, 30)}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r - 56) * Math.cos(((angle - 90) * Math.PI) / 180)}
        y2={cy + (r - 56) * Math.sin(((angle - 90) * Math.PI) / 180)}
        stroke={C.white}
        strokeWidth={11}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={22} fill={C.purpleBright} />
      <text x={cx + 165} y={92} fill={C.yellow} fontSize={38} fontWeight={700} fontFamily={F.num} textAnchor="middle">
        +20%
      </text>
    </svg>
  );
};

const CheckRow = ({ delay, num, emoji, title, children }) => {
  const frame = useCurrentFrame();
  const active = frame >= delay;
  return (
    <Pop delay={delay}>
      <div
        style={{
          ...cardStyle,
          width: 880,
          padding: "24px 36px",
          display: "flex",
          alignItems: "center",
          gap: 26,
          opacity: active ? 1 : 0,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: C.purple,
            color: C.white,
            fontFamily: F.num,
            fontSize: 32,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {num}
        </div>
        <div style={{ fontSize: 56 }}>{emoji}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
          <div style={{ fontFamily: F.cn, fontSize: 40, fontWeight: 600, color: C.white }}>{title}</div>
          {children}
        </div>
      </div>
    </Pop>
  );
};

export const S6Google = () => {
  const frame = useCurrentFrame();
  const aOut = interpolate(frame, [EXPECT - 10, EXPECT + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bOut = interpolate(frame, [C1 - 10, C1 + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      {/* Beat A：上季成绩单 */}
      <div style={{ position: "absolute", top: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: aOut }}>
        <div style={{ marginTop: 104 }}>
          <TickerChip symbol="GOOGL" name="谷歌" delay={2} logoSize={116} nameSize={52} />
        </div>
        <Rise delay={30} style={{ marginTop: 24 }}>
          <Kicker>上季度 · 交出的答卷 💯</Kicker>
        </Rise>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 34 }}>
          <StatRow delay={48} emoji="☁️" label="Cloud 收入">
            <CountUp to={63} delay={56} dur={36} prefix="+" suffix="%" style={{ fontSize: 72, fontWeight: 800, color: C.up }} />
          </StatRow>
          <StatRow delay={150} emoji="🚩" label="单季收入">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontFamily: F.num, fontSize: 60, fontWeight: 800, color: C.white }}>$200亿</span>
              <Chip size={24} border={C.yellow} color={C.yellow} bg="rgba(249,243,57,0.08)" style={{ padding: "6px 16px" }}>
                历史首次突破
              </Chip>
            </div>
          </StatRow>
          <StatRow delay={252} emoji="📦" label="在手订单">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
              {/* 近乎翻倍的两根柱 */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 100 }}>
                <div style={{ width: 42, height: 52, borderRadius: 8, background: "rgba(160,80,255,0.4)" }} />
                <div
                  style={{
                    width: 42,
                    height: interpolate(frame, [260, 300], [52, 98], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }),
                    borderRadius: 8,
                    background: C.purpleBright,
                    boxShadow: "0 0 26px rgba(160,80,255,0.5)",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontFamily: F.num, fontSize: 56, fontWeight: 800, color: C.white }}>$4600亿+</span>
                <Chip size={24} color={C.blue3} style={{ padding: "6px 16px" }}>一个季度 ≈ ×2</Chip>
              </div>
            </div>
          </StatRow>
        </div>
      </div>

      {/* Beat B：预期已被抬高 */}
      <div style={{ position: "absolute", top: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: frame >= EXPECT ? bOut : 0 }}>
        <Rise delay={EXPECT} style={{ marginTop: 108 }}>
          <Kicker>于是，市场预期被抬到 ⛰️</Kicker>
        </Rise>
        <Pop delay={EXPECT + 8} style={{ marginTop: 26 }}>
          <Gauge start={EXPECT} />
        </Pop>
        <Rise delay={EXPECT + 60} style={{ marginTop: 18 }}>
          <div style={{ fontFamily: F.cn, fontSize: 44, fontWeight: 600, color: C.white, textAlign: "center", lineHeight: 1.6 }}>
            一致预期：营收、利润 <span style={{ color: C.yellow, fontFamily: F.num, fontWeight: 800 }}>+20%</span> 以上
          </div>
        </Rise>
        <Pop delay={EXPECT + 150} style={{ marginTop: 36 }}>
          <Chip size={42} border={C.purpleBright} bg="rgba(111,0,255,0.28)">
            预期高 → 容错<span style={{ color: C.down, fontWeight: 600 }}>低</span> ⚖️
          </Chip>
        </Pop>
      </div>

      {/* Beat C：三个看点 */}
      <div style={{ position: "absolute", top: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: frame >= C1 ? 1 : 0 }}>
        <Rise delay={C1} style={{ marginTop: 108 }}>
          <Kicker>这次财报 · 看三个东西</Kicker>
        </Rise>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 40 }}>
          <CheckRow delay={C1 + 6} num="1" emoji="☁️" title="Cloud 增速，守得住高位吗？">
            <Chip size={26} color={C.blue3} style={{ alignSelf: "flex-start", padding: "6px 18px" }}>上季 +63%</Chip>
          </CheckRow>
          <CheckRow delay={C2 + 6} num="2" emoji="🔍" title="广告主的预算，缩不缩？">
            <div style={{ display: "flex", gap: 16 }}>
              <Chip size={26} color={C.blue3} style={{ padding: "6px 18px" }}>搜索广告 上季 +19%</Chip>
              <Pop delay={C2 + 130}>
                <Chip size={26} border="rgba(246,70,93,0.55)" bg="rgba(246,70,93,0.1)" color={C.blue3} style={{ padding: "6px 18px" }}>
                  ▶️ YouTube 上季略欠
                </Chip>
              </Pop>
            </div>
          </CheckRow>
          <CheckRow delay={C3 + 6} num="3" emoji="💸" title="资本支出，还在加码">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontFamily: F.num, fontSize: 46, fontWeight: 800, color: C.yellow, whiteSpace: "nowrap" }}>$1800–1900亿</span>
              <Pop delay={C3 + 120}>
                <Chip size={26} color={C.blue3} style={{ padding: "6px 18px" }}>2027 还要加 ↑</Chip>
              </Pop>
            </div>
          </CheckRow>
        </div>
      </div>
    </AbsoluteFill>
  );
};
