import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, F, cardStyle } from "../theme.js";
import { TL } from "../timeline.js";
import { Chip, Kicker, Rise } from "../components/ui.jsx";
import { Logo } from "../components/TickerChip.jsx";

// S8：IBM / 通用 / 美国运通 快速三连卡
const IBM = TL.s8_ibm - TL.s8;
const GM = TL.s8_gm - TL.s8;
const AXP = TL.s8_axp - TL.s8;
const END = TL.s9 - TL.s8;

const CARDS = [
  {
    sym: "IBM",
    name: "IBM",
    emoji: "🖥️",
    time: "周三盘后 🌙",
    from: IBM,
    to: GM,
    rows: [
      { text: "预期 EPS $3.02 · 同比 +8%", num: true },
      { text: "AI 落地传统企业 IT，有多快？" },
    ],
  },
  {
    sym: "GM",
    name: "通用汽车",
    emoji: "🚙",
    time: "周二盘前 ☀️",
    from: GM,
    to: AXP,
    rows: [{ text: "电动车业务：亏损收窄了吗？🔋" }],
  },
  {
    sym: "AXP",
    name: "美国运通",
    emoji: "💳",
    time: "周五盘前 ☀️",
    from: AXP,
    to: END,
    rows: [
      { text: "高收入人群，还在花钱吗？" },
      { text: "美国消费信心的一扇窗 🪟", accent: true },
    ],
  },
];

const QuickCard = ({ card }) => {
  const frame = useCurrentFrame();
  // 从右滑入居中，到点后滑出左侧
  const x = interpolate(
    frame,
    [card.from, card.from + 14, card.to - 8, card.to + 4],
    [1100, 0, 0, -1150],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );
  const visible = frame >= card.from - 2 && frame <= card.to + 6;
  if (!visible) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        transform: `translateX(${x}px)`,
        width: 920,
        left: 80,
      }}
    >
      <div style={{ ...cardStyle, padding: "40px 48px", display: "flex", flexDirection: "column", gap: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Logo symbol={card.sym} size={104} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            <div style={{ fontFamily: F.cn, fontSize: 50, fontWeight: 600, color: C.white }}>
              {card.name}
              <span style={{ fontFamily: F.num, fontSize: 32, fontWeight: 700, color: C.blue2, marginLeft: 20 }}>${card.sym}</span>
            </div>
            <Chip size={26} color={C.blue3} style={{ alignSelf: "flex-start", padding: "6px 20px" }}>
              {card.time}
            </Chip>
          </div>
          <div style={{ fontSize: 80 }}>{card.emoji}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {card.rows.map((row, i) => (
            <div
              key={i}
              style={{
                fontFamily: row.num ? F.num : F.cn,
                fontSize: 40,
                fontWeight: 600,
                color: row.accent ? C.yellow : C.white,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ color: C.purpleBright, fontSize: 28 }}>◆</span>
              {row.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const S8QuickFire = () => {
  const frame = useCurrentFrame();
  // 三点进度指示
  const active = frame >= AXP ? 2 : frame >= GM ? 1 : 0;

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Rise delay={0} style={{ marginTop: 130 }}>
        <Kicker>本周还有 · 三家值得扫一眼</Kicker>
      </Rise>

      {CARDS.map((card) => (
        <QuickCard key={card.sym} card={card} />
      ))}

      {/* 进度点 */}
      <div style={{ position: "absolute", top: 830, display: "flex", gap: 22 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === active ? 52 : 18,
              height: 18,
              borderRadius: 999,
              background: i === active ? C.purpleBright : "rgba(160,80,255,0.3)",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
