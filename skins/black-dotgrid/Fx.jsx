// Fx.jsx — 本片特效组件：CRT 雪花电视（闪回）+ WindOutline 人物风动描边
// 全部只依赖 useCurrentFrame，帧确定性，可并行渲染。
import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "./theme.js";

// ============================================================
// CRT — 雪花老电视外壳。讲"过去"的段落整段包进来。
// props:
//   on:  本地帧，从这一帧开始"开机"（白线展开+雪花爆闪，10帧）
//   off: 本地帧，从这一帧开始"关机"（画面收缩成白线，8帧）；不传=不关机
//   snow: 常驻雪花强度 0~1（默认 0.10）
// ============================================================
export const CRT = ({ on = 0, off = null, snow = 0.1, children }) => {
  const frame = useCurrentFrame();

  // —— 开机：亮度白闪 + 画面从一条白线纵向展开 ——
  const boot = interpolate(frame - on, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // —— 关机：画面纵向收缩回白线再熄灭 ——
  const shut =
    off == null
      ? 0
      : interpolate(frame - off, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const scaleY = boot * (1 - shut) || 0.004;
  const bright = 1 + (1 - boot) * 2.4 + shut * 2.4; // 开/关瞬间过曝

  // 开机头 20 帧雪花更重，之后回落到常驻值
  const snowNow =
    interpolate(frame - on, [0, 6, 20], [0.55, 0.35, snow], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * (1 - shut);

  // 整幅画面水平微抖（信号不稳）
  const jx = noise2D("crt-jx", frame * 0.35, 0) * 3;
  // 偶发"跳帧"：噪声超阈值时画面瞬间上跳
  const hop = noise2D("crt-hop", frame * 0.5, 7) > 0.82 ? 6 : 0;
  // 滚动亮带位置（周期 ~120 帧）
  const rollY = ((frame * 9) % 1400) - 200;
  // 雪花 seed 每 2 帧换一次
  const seed = Math.floor(frame / 2) * 7 + 3;

  return (
    <AbsoluteFill style={{ background: "#050008" }}>
      <AbsoluteFill
        style={{
          transform: `scaleY(${scaleY}) translateX(${jx}px) translateY(${hop}px)`,
          filter: `saturate(0.72) contrast(1.06) sepia(0.14) brightness(${bright})`,
          borderRadius: 44,
          overflow: "hidden",
        }}
      >
        {children}

        {/* 雪花噪点 */}
        <AbsoluteFill style={{ opacity: snowNow, mixBlendMode: "screen" }}>
          <svg width="100%" height="100%">
            <filter id="crtSnow">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="1"
                seed={seed}
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#crtSnow)" />
          </svg>
        </AbsoluteFill>

        {/* 扫描线 */}
        <AbsoluteFill
          style={{
            background:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 5px)",
          }}
        />

        {/* 滚动亮带 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: rollY,
            height: 170,
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.05), transparent)",
          }}
        />

        {/* 暗角 */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.42) 100%)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================
// Glitch — 信号故障闪切（进出 CRT 段用，套在整个场景外层几帧）
// props: at=触发帧, dur=持续帧数(默认6)
// ============================================================
export const Glitch = ({ at, dur = 6, children }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const active = t >= 0 && t < dur;
  if (!active) return <AbsoluteFill>{children}</AbsoluteFill>;
  // 三条横向切片随机错位
  const s1 = noise2D("gl1", t * 3, 0) * 46;
  const s2 = noise2D("gl2", t * 3, 5) * 60;
  const s3 = noise2D("gl3", t * 3, 9) * 38;
  const slice = (top, h, dx) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: `${top}%`,
    height: `${h}%`,
    overflow: "hidden",
    transform: `translateX(${dx}px)`,
  });
  const inner = (top) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: `-${top}%`,
    height: "1000%",
  });
  return (
    <AbsoluteFill>
      <div style={slice(0, 34, s1)}>
        <div style={inner(0)}>
          <AbsoluteFill>{children}</AbsoluteFill>
        </div>
      </div>
      <div style={slice(34, 30, s2)}>
        <div style={inner(113)}>
          <AbsoluteFill>{children}</AbsoluteFill>
        </div>
      </div>
      <div style={slice(64, 36, s3)}>
        <div style={inner(178)}>
          <AbsoluteFill>{children}</AbsoluteFill>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// WindOutline — 人物抠图 + 手绘感"沸腾"描边 + 随机微晃
// 描边是预生成的 ring png（scripts 里 PIL dilate 产物），
// 用 feTurbulence+feDisplacementMap 让线条沸腾（每 8 帧换 seed，手绘 on-3s 节奏），
// 人物整体再加 noise 驱动 ±sway px 晃动。原图保持锐利。
// props: src(抠图) outline(描边png) height id(每实例唯一) sway(默认3) delay
// ============================================================
export const WindOutline = ({
  src,
  outline,
  height = 560,
  id = "wo",
  sway = 3,
  swayRot = 0.9,
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor((frame - delay) / 8); // 沸腾节奏 on-8s
  const dx = noise2D(`${id}-x`, frame * 0.05, 0) * sway;
  const dy = noise2D(`${id}-y`, 0, frame * 0.05) * sway;
  const rot = noise2D(`${id}-r`, frame * 0.03, 3) * swayRot;
  // 描边独立再晃一点，和本体不同步 → 更"活"
  const ox = noise2D(`${id}-ox`, frame * 0.09, 1) * 2.5;
  const oy = noise2D(`${id}-oy`, 1, frame * 0.09) * 2.5;
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
        ...style,
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={id} x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.013 0.019"
              numOctaves="2"
              seed={seed * 13 + 5}
              result="t"
            />
            <feDisplacementMap in="SourceGraphic" in2="t" scale="9" />
          </filter>
        </defs>
      </svg>
      {/* 沸腾描边层（在后） */}
      <Img
        src={outline}
        style={{
          position: "absolute",
          height,
          left: ox,
          top: oy,
          filter: `url(#${id})`,
        }}
      />
      {/* 锐利本体（在前） */}
      <Img src={src} style={{ position: "relative", height }} />
    </div>
  );
};

// ============================================================
// DotGrid — 黑底 + 紫点阵微动效（全片基底；紫色只做点缀）
// 点阵缓慢漂移 + 一团低亮度紫光随 noise 游走
// ============================================================
export const DotGrid = ({ children }) => {
  const frame = useCurrentFrame();
  const shift = frame * 0.12;
  const gx = noise2D("dg-x", frame * 0.004, 0) * 130;
  const gy = noise2D("dg-y", 0, frame * 0.004) * 130;
  return (
    <AbsoluteFill style={{ background: "#050507" }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(160,80,255,0.15) 1.6px, transparent 1.6px)",
          backgroundSize: "46px 46px",
          backgroundPosition: `${shift}px ${shift * 0.55}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 140 + gx,
          top: 220 + gy,
          width: 940,
          height: 940,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(111,0,255,0.12) 0%, transparent 62%)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// ============================================================
// BreakingTag — 突发新闻红斜章
// ============================================================
export const BreakingTag = ({ text = "BREAKING", size = 34, style }) => (
  <div
    style={{
      display: "inline-block",
      padding: `${size * 0.32}px ${size * 0.85}px`,
      background: C.down,
      color: C.white,
      fontSize: size,
      fontWeight: 600,
      letterSpacing: 4,
      transform: "rotate(-4deg)",
      borderRadius: 10,
      boxShadow: "0 0 44px rgba(246,70,93,0.55)",
      ...style,
    }}
  >
    {text}
  </div>
);

// ============================================================
// DateStamp — 大日期章（7·30 这类时间钉子）
// ============================================================
export const DateStamp = ({ text, size = 56, color = C.white, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      padding: `${size * 0.22}px ${size * 0.55}px`,
      border: `3px solid ${color}`,
      borderRadius: 16,
      color,
      fontSize: size,
      fontWeight: 600,
      letterSpacing: 2,
      fontFamily:
        '-apple-system, "SF Pro Display", "Helvetica Neue", "PingFang SC", sans-serif',
      background: "rgba(0,0,0,0.25)",
      ...style,
    }}
  >
    {text}
  </div>
);
