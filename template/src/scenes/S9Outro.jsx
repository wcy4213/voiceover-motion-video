import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F, cardStyle } from "../theme.js";
import { TL } from "../timeline.js";
import { Chip, Kicker, Pop, Rise } from "../components/ui.jsx";
import { Logo } from "../components/TickerChip.jsx";

const P1 = TL.s9_p1 - TL.s9; // 剧本①
const P2 = TL.s9_p2 - TL.s9; // 剧本②
const P3 = TL.s9_p3 - TL.s9; // 剧本③
const END = TL.s9_end - TL.s9; // 免责收尾

const Scenario = ({ delay, marks, label, arrow, result, border, bg }) => (
  <Pop delay={delay}>
    <div
      style={{
        ...cardStyle,
        border: `3px solid ${border}`,
        background: bg,
        width: 900,
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div style={{ fontSize: 40, letterSpacing: 4, flexShrink: 0 }}>{marks}</div>
      <div style={{ fontFamily: F.cn, fontSize: 36, fontWeight: 600, color: C.white, whiteSpace: "nowrap", flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 34, color: C.purpleBright, flexShrink: 0 }}>→</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 38 }}>{arrow}</span>
        <div style={{ fontFamily: F.cn, fontSize: 34, fontWeight: 600, color: C.white, whiteSpace: "nowrap" }}>{result}</div>
      </div>
    </div>
  </Pop>
);

export const S9Outro = () => {
  const frame = useCurrentFrame();

  // 问题从中央缩到上方
  const shrink = interpolate(frame, [P1 - 12, P1 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 收尾淡出剧本
  const treeOut = interpolate(frame, [END - 8, END + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 全片收黑前的整体淡出
  const finalFade = interpolate(frame, [END + 90, END + 112], [1, 0.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", opacity: finalFade }}>
      {/* 大问题 */}
      <div
        style={{
          position: "absolute",
          top: interpolate(shrink, [0, 1], [360, 64]),
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${1 - shrink * 0.4})`,
          opacity: treeOut,
        }}
      >
        <Rise delay={2} style={{ marginBottom: 26, opacity: 1 - shrink }}>
          <Kicker>这一周的主线 · 其实就一个问题</Kicker>
        </Rise>
        <Pop delay={10}>
          <div
            style={{
              fontFamily: F.cn,
              fontSize: 72,
              fontWeight: 600,
              color: C.yellow,
              textAlign: "center",
              lineHeight: 1.45,
              textShadow: "0 0 90px rgba(249,243,57,0.35)",
            }}
          >
            AI 投入的回报率
            <br />
            被高估了吗？🤔
          </div>
        </Pop>
      </div>

      {/* 两大变量 + 三个剧本 */}
      <div style={{ position: "absolute", top: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: frame >= P1 ? treeOut : 0 }}>
        <div style={{ marginTop: 292, display: "flex", alignItems: "center", gap: 22 }}>
          <Rise delay={P1}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Logo symbol="GOOGL" size={72} />
              <span style={{ fontFamily: F.num, fontSize: 36, fontWeight: 800, color: C.white }}>+</span>
              <Logo symbol="TSLA" size={72} />
              <Chip size={28} color={C.blue3} style={{ marginLeft: 10 }}>两大变量 · 三种剧本 🎬</Chip>
            </div>
          </Rise>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 42 }}>
          <Scenario
            delay={P1 + 10}
            marks="✅✅"
            label="都超预期"
            arrow="🔥"
            result={<span>Q3 · <span style={{ color: C.up }}>AI 主线延续</span></span>}
            border="rgba(46,189,133,0.6)"
            bg="rgba(46,189,133,0.10)"
          />
          <Scenario
            delay={P2 + 6}
            marks="✅❌"
            label="一超一不超"
            arrow="💧"
            result={<span>资金 · AI概念 → <span style={{ color: C.purpleBright }}>AI落地</span></span>}
            border="rgba(160,80,255,0.6)"
            bg="rgba(111,0,255,0.12)"
          />
          <Scenario
            delay={P3 + 6}
            marks="❌❌"
            label="都不及预期"
            arrow="📉"
            result={<span>科技调整 · 轮动 <span style={{ color: C.blue2 }}>🏦 金融 🛒 消费</span></span>}
            border="rgba(246,70,93,0.6)"
            bg="rgba(246,70,93,0.10)"
          />
        </div>
      </div>

      {/* 收尾：品牌 + 免责 */}
      <div style={{ position: "absolute", top: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: frame >= END ? 1 : 0 }}>
        {/* 涟漪呼应 */}
        {[0, 1].map((i) => {
          const r = ((frame * 2.2 + i * 150) % 300) + 60;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                border: `2.5px solid ${C.purpleBright}`,
                opacity: interpolate(r, [60, 360], [0.35, 0]),
              }}
            />
          );
        })}
        <Pop delay={END + 6}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{ fontSize: 64, color: C.yellow, textShadow: "0 0 50px rgba(249,243,57,0.6)", transform: `rotate(${frame}deg)`, lineHeight: 1 }}>✦</div>
            <div style={{ fontFamily: F.num, fontSize: 76, fontWeight: 800, color: C.white, letterSpacing: 2 }}>
              Bobby AI
            </div>
            <Chip size={28} color={C.blue3} style={{ marginTop: 6 }}>美股财报周 · 每周陪你划重点</Chip>
          </div>
        </Pop>
        <Rise delay={END + 26} style={{ position: "absolute", bottom: 70 }}>
          <div style={{ fontFamily: F.cn, fontSize: 26, fontWeight: 400, color: C.grey, opacity: 0.55 }}>
            以上内容仅供参考，不构成任何投资建议
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};
