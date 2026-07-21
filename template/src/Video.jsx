import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "./theme.js";
import { DUR_FRAMES, TL } from "./timeline.js";
import { Backdrop } from "./components/Backdrop.jsx";
import { Logo } from "./components/TickerChip.jsx";
import { S0Intro } from "./scenes/S0Intro.jsx";
import { S1Market } from "./scenes/S1Market.jsx";
import { S2TeslaDelivery } from "./scenes/S2TeslaDelivery.jsx";
import { S3Margin } from "./scenes/S3Margin.jsx";
import { S4Robotaxi } from "./scenes/S4Robotaxi.jsx";
import { S5Megapack } from "./scenes/S5Megapack.jsx";
import { S6Google } from "./scenes/S6Google.jsx";
import { S7Intel } from "./scenes/S7Intel.jsx";
import { S8QuickFire } from "./scenes/S8QuickFire.jsx";
import { S9Outro } from "./scenes/S9Outro.jsx";

const SCENES = [
  { from: TL.s0, to: TL.s1, Comp: S0Intro, name: "S0 开场" },
  { from: TL.s1, to: TL.s2, Comp: S1Market, name: "S1 背景" },
  { from: TL.s2, to: TL.s3, Comp: S2TeslaDelivery, name: "S2 特斯拉交付" },
  { from: TL.s3, to: TL.s4, Comp: S3Margin, name: "S3 毛利率" },
  { from: TL.s4, to: TL.s5, Comp: S4Robotaxi, name: "S4 Robotaxi" },
  { from: TL.s5, to: TL.s6, Comp: S5Megapack, name: "S5 储能" },
  { from: TL.s6, to: TL.s7, Comp: S6Google, name: "S6 谷歌" },
  { from: TL.s7, to: TL.s8, Comp: S7Intel, name: "S7 英特尔" },
  { from: TL.s8, to: TL.s9, Comp: S8QuickFire, name: "S8 快速过" },
  { from: TL.s9, to: TL.end, Comp: S9Outro, name: "S9 主线收尾" },
];

// 场景切点：涟漪擦除转场（切点前后各 14 帧，紫色圆形先盖住再揭开）
const WIPES = [TL.s1, TL.s2, TL.s3, TL.s4, TL.s5, TL.s6, TL.s7, TL.s8, TL.s9];
const WIPE_HALF = 14;

const RippleWipe = () => {
  const frame = useCurrentFrame(); // 0..28
  const p = interpolate(frame, [0, WIPE_HALF, WIPE_HALF * 2], [0, 1, 0], {
    easing: Easing.inOut(Easing.cubic),
  });
  const r = p * 1100;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.purpleBright} 0%, ${C.purple} 55%, #3a0a86 100%)`,
          boxShadow: `0 0 120px rgba(111,0,255,0.8)`,
        }}
      />
    </AbsoluteFill>
  );
};

// 顶部章节标签（帮观众定位当前讲到谁）
const CHAPTERS = [
  { from: TL.s2, to: TL.s6, sym: "TSLA", label: "特斯拉 · 周三盘后" },
  { from: TL.s6, to: TL.s7, sym: "GOOGL", label: "谷歌 · 周三盘后" },
  { from: TL.s7, to: TL.s8, sym: "INTC", label: "英特尔 · 周四盘后" },
  { from: TL.s8, to: TL.s9, sym: null, label: "⚡ 其他看点" },
  { from: TL.s9, to: TL.s9_end, sym: null, label: "🎯 本周主线" },
];

const ChapterTab = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chapter = CHAPTERS.find((c) => frame >= c.from && frame < c.to);
  if (!chapter) {
    return null;
  }
  const p = spring({ frame: frame - chapter.from - 16, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        transform: `translateY(${(1 - p) * -50}px)`,
        opacity: p,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(29,0,56,0.72)",
          border: "2px solid rgba(160,80,255,0.5)",
          borderRadius: 999,
          padding: "10px 24px",
          backdropFilter: "blur(6px)",
        }}
      >
        {chapter.sym ? <Logo symbol={chapter.sym} size={38} radius={0.3} /> : null}
        <span style={{ fontFamily: F.cn, fontSize: 26, fontWeight: 600, color: C.blue3 }}>{chapter.label}</span>
      </div>
    </div>
  );
};

export const EarningsVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Audio src={staticFile("audio/audio.mp3")} />
      <Backdrop />
      {SCENES.map(({ from, to, Comp, name }) => (
        <Sequence key={name} from={from} durationInFrames={to - from} name={name}>
          <Comp />
        </Sequence>
      ))}
      <ChapterTab />
      {WIPES.map((cut) => (
        <Sequence key={`wipe-${cut}`} from={cut - WIPE_HALF} durationInFrames={WIPE_HALF * 2} name={`转场@${cut}`}>
          <RippleWipe />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export { DUR_FRAMES };
