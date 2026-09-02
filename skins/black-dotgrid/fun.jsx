import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "./theme.js";

// ============================================================
// 趣味动效组件库 —— 本次视觉返工的核心（2026-08-05 用户四条反馈：
// 画面不吸引/没趣味/动效少/文字多）。原则：
//   ① 每场一个图形主角，能画的绝不写字
//   ② 一切都在动：FloatWrap 兜底，任何元素静止不超过 2 秒
//   ③ emoji 当插图（探针已验证全量可渲），大尺寸使用
//   ④ 全部纯 frame 函数，伪随机用 hash(i)，禁 Math.random
// ============================================================

// 确定性伪随机（0~1）
export const rand = (i, seed = 0) => {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ——— 万物皆浮动：给任何子元素持续的呼吸/漂浮 ———
export const FloatWrap = ({ amp = 8, speed = 0.055, phase = 0, rot = 0, children, style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        transform: `translateY(${Math.sin(frame * speed + phase) * amp}px) rotate(${
          Math.sin(frame * speed * 0.8 + phase) * rot
        }deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ——— 星光闪烁：在一个区域里随机位置的 ✦ 轮流亮 ———
export const Sparkles = ({ w = 600, h = 400, n = 7, color = C.yellow, seed = 1, size = 22 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", width: w, height: h, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const tw = 0.5 + 0.5 * Math.sin(frame * (0.09 + rand(i, seed) * 0.07) + rand(i, seed + 9) * 6.28);
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: rand(i, seed) * w,
              top: rand(i, seed + 3) * h,
              fontSize: size * (0.6 + rand(i, seed + 5) * 0.8),
              color,
              opacity: tw * 0.85,
              transform: `scale(${0.6 + tw * 0.5}) rotate(${rand(i, seed + 7) * 40 - 20}deg)`,
            }}
          >
            ✦
          </span>
        );
      })}
    </div>
  );
};

// ——— 钱雨：💰💵 从天而降，循环不断 ———
// h 默认 870：裁在底部字幕安全区（905）之上，钱币不会砸到烧录字幕
export const MoneyRain = ({ n = 12, w = 1080, h = 870, size = 52, opacity = 0.8, seed = 2 }) => {
  const frame = useCurrentFrame();
  const GLYPHS = ["💰", "💵", "💰", "💵", "💰"];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const sp = 3.2 + rand(i, seed) * 3.4;
        const x = rand(i, seed + 1) * (w - 80) + 10;
        const y = ((frame * sp + rand(i, seed + 2) * (h + 240)) % (h + 240)) - 140;
        const rot = Math.sin(frame * 0.05 + i * 2.1) * 24;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontSize: size * (0.65 + rand(i, seed + 4) * 0.7),
              transform: `rotate(${rot}deg)`,
              opacity,
            }}
          >
            {GLYPHS[i % GLYPHS.length]}
          </span>
        );
      })}
    </div>
  );
};

// ——— 彩纸迸发：delay 时刻从中心炸开一圈色块 ———
export const ConfettiBurst = ({ delay = 0, n = 22, dist = 360, seed = 3 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  if (t <= 0) return null;
  const COLORS = [C.yellow, C.purpleBright, C.up, "#FFFFFF", C.blue1];
  return (
    <div style={{ position: "absolute", pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const ang = rand(i, seed) * Math.PI * 2;
        const d = dist * (0.5 + rand(i, seed + 1) * 0.5) * t;
        const fall = 90 * t * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: Math.cos(ang) * d,
              top: Math.sin(ang) * d * 0.7 + fall,
              width: 10 + rand(i, seed + 2) * 10,
              height: 7 + rand(i, seed + 3) * 8,
              borderRadius: 2,
              background: COLORS[i % COLORS.length],
              opacity: 1 - t * 0.85,
              transform: `rotate(${rand(i, seed + 4) * 360 + t * 300}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

// ——— 电量条：只够撑 90 天 → 电量从满格掉到红色低格 ———
export const Battery = ({ delay = 0, dur = 56, w = 300, h = 128 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const lvl = 1 - t * 0.9; // 100% → 10%
  const col = lvl > 0.5 ? C.up : lvl > 0.25 ? C.yellow : C.down;
  const blink = lvl <= 0.12 ? 0.55 + 0.45 * Math.sin(frame * 0.5) : 1;
  const innerW = (w - 26) * lvl;
  return (
    <div style={{ position: "relative", width: w + 18, height: h }}>
      <div
        style={{
          position: "absolute",
          inset: `0 18px 0 0`,
          border: `6px solid rgba(242,242,242,0.8)`,
          borderRadius: 22,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: h / 2 - 22,
          width: 14,
          height: 44,
          borderRadius: 6,
          background: "rgba(242,242,242,0.8)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 13,
          top: 13,
          width: Math.max(14, innerW),
          height: h - 26,
          borderRadius: 12,
          background: col,
          opacity: blink,
          boxShadow: `0 0 26px ${col}88`,
        }}
      />
    </div>
  );
};

// ——— 心电图：跳两下 → 拉直（1997 濒死）———
export const EKG = ({ delay = 0, dur = 70, w = 760, h = 170, color = C.down }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mid = h / 2;
  const beat = (x0) =>
    `L${x0},${mid} L${x0 + 22},${mid - 8} L${x0 + 40},${mid + 52} L${x0 + 58},${mid - 62} L${x0 + 74},${mid + 16} L${x0 + 92},${mid}`;
  const d = `M0,${mid} ${beat(70)} ${beat(300)} L${w * 0.62},${mid} L${w},${mid}`;
  const LEN = 1700;
  const headT = Math.min(1, t * 1.06);
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={LEN}
        strokeDashoffset={LEN * (1 - headT)}
        style={{ filter: `drop-shadow(0 0 12px ${color})` }}
      />
      {/* 走完后尾端的"滴——"闪烁圆点 */}
      {t > 0.97 ? (
        <circle cx={w - 4} cy={mid} r={8} fill={color} opacity={0.5 + 0.5 * Math.sin(frame * 0.4)} />
      ) : null}
    </svg>
  );
};

// ——— 救生圈：红白分段圆环，沿抛物线扔过去 ———
export const Lifebuoy = ({ size = 120 }) => {
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F4F1EA" strokeWidth={22} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E8433F"
        strokeWidth={22}
        strokeDasharray={`${circ / 8} ${circ / 8}`}
        strokeDashoffset={circ / 16}
      />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} />
    </svg>
  );
};

// ——— 水面：两层正弦波，前层慢滚 ———
export const Waves = ({ w = 1080, h = 130, y = 0, color = "rgba(111,0,255,0.5)", speed = 1.6 }) => {
  const frame = useCurrentFrame();
  const path = (amp, lambda, phase, base) => {
    let d = `M0,${base}`;
    for (let x = 0; x <= w; x += 20) {
      d += ` L${x},${base + Math.sin((x / lambda) * Math.PI * 2 + frame * 0.06 * speed + phase) * amp}`;
    }
    d += ` L${w},${h + 60} L0,${h + 60} Z`;
    return d;
  };
  return (
    <svg width={w} height={h + 60} style={{ position: "absolute", top: y, left: 0, overflow: "visible" }}>
      <path d={path(13, 300, 0, 34)} fill={color} opacity={0.5} />
      <path d={path(17, 420, 2.2, 52)} fill={color} />
    </svg>
  );
};

// ——— 印章斩落：✓ / ✕ / 文字，大 → 砸到位 + 微尘 ———
export const SlamStamp = ({ children, delay = 0, color = C.down, size = 64, rotate = -9, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 160 } });
  if (frame < delay) return null;
  const scale = interpolate(p, [0, 1], [2.1, 1]);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: `5px solid ${color}`,
        borderRadius: 18,
        padding: `${size * 0.14}px ${size * 0.34}px`,
        fontFamily: F.cn,
        fontSize: size,
        fontWeight: 600,
        color,
        background: "rgba(5,5,7,0.55)",
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity: Math.min(1, p * 1.6),
        boxShadow: `0 0 34px ${color}66`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ——— 硬币逐枚落下堆高 ———
export const CoinStack = ({ delay = 0, n = 7, coinW = 74, coinH = 22, gap = 3, step = 5 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: coinW + 20, height: n * (coinH + gap) + 30 }}>
      {Array.from({ length: n }).map((_, i) => {
        const t = interpolate(frame - delay - i * step, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        });
        if (t <= 0) return null;
        const yTarget = n * (coinH + gap) - (i + 1) * (coinH + gap) + 20;
        const y = yTarget - (1 - t) * 120;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 10 + Math.sin(i * 2.7) * 5,
              top: y,
              width: coinW,
              height: coinH,
              borderRadius: "50% / 42%",
              background: "linear-gradient(180deg, #FFE873, #E4B42B)",
              border: "2.5px solid #B8860B",
              opacity: t,
              boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
            }}
          />
        );
      })}
    </div>
  );
};

// ——— 汗滴：从盒子边缘弹出的 💧（紧张）———
export const SweatDrops = ({ delay = 0, n = 5, seed = 6 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const cycle = 46 + Math.floor(rand(i, seed) * 26);
        const local = (frame - delay + Math.floor(rand(i, seed + 1) * cycle)) % cycle;
        const t = interpolate(local, [0, cycle * 0.55], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (frame < delay) return null;
        const side = rand(i, seed + 2) > 0.5 ? 1 : -1;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${50 + side * (28 + rand(i, seed + 3) * 22)}%`,
              top: `${8 + rand(i, seed + 4) * 22}%`,
              fontSize: 30 + rand(i, seed + 5) * 16,
              opacity: t < 0.12 ? t * 8 : 1 - t,
              transform: `translate(${side * t * 66}px, ${t * t * 130 - t * 30}px) rotate(${side * t * 24}deg)`,
            }}
          >
            💧
          </span>
        );
      })}
    </div>
  );
};

// ——— 问号乱蹦：多个 ? 在区域内错峰弹出 ———
export const QuestionScatter = ({ delay = 0, n = 5, w = 700, h = 420, seed = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", width: w, height: h, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const p = spring({ frame: frame - delay - i * 5, fps, config: { damping: 9 } });
        if (frame < delay + i * 5) return null;
        const bob = Math.sin(frame * 0.08 + i * 1.9) * 7;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: rand(i, seed) * (w - 90),
              top: rand(i, seed + 2) * (h - 120) + bob,
              fontFamily: F.num,
              fontSize: 54 + rand(i, seed + 4) * 66,
              fontWeight: 800,
              color: i % 2 ? C.purpleBright : "rgba(249,243,57,0.75)",
              transform: `scale(${p}) rotate(${(rand(i, seed + 5) - 0.5) * 38}deg)`,
              textShadow: "0 0 22px rgba(160,80,255,0.5)",
            }}
          >
            ?
          </span>
        );
      })}
    </div>
  );
};

// ——— 光泽扫过：给关键卡片加一道流动高光 ———
export const Shimmer = ({ period = 90, w = 560, style }) => {
  const frame = useCurrentFrame();
  const x = ((frame % period) / period) * (w + 300) - 150;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", pointerEvents: "none", ...style }}>
      <div
        style={{
          position: "absolute",
          top: -40,
          bottom: -40,
          left: x,
          width: 90,
          transform: "rotate(14deg)",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
        }}
      />
    </div>
  );
};

// ——— 打字中：三个跳动的圆点（Bobby 回答前）———
export const TypingDots = ({ delay = 0, until = 9999 }) => {
  const frame = useCurrentFrame();
  if (frame < delay || frame > until) return null;
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "flex",
        gap: 9,
        padding: "18px 24px",
        borderRadius: 24,
        borderTopLeftRadius: 8,
        background: "rgba(12,8,24,0.9)",
        border: "2px solid rgba(160,80,255,0.45)",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: C.purpleBright,
            transform: `translateY(${Math.sin(frame * 0.32 - i * 0.9) * 5}px)`,
            opacity: 0.55 + 0.45 * Math.sin(frame * 0.32 - i * 0.9),
          }}
        />
      ))}
    </div>
  );
};
