import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "../theme.js";

// —— 弹簧缩放入场 ——
export const Pop = ({
  delay = 0,
  children,
  style,
  damping = 13,
  from = 0.55,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping } });
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        transform: `scale(${from + (1 - from) * p})`,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// —— 上浮淡入 ——
export const Rise = ({ delay = 0, dist = 46, dur = 14, children, style }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{ transform: `translateY(${(1 - t) * dist}px)`, opacity: t, ...style }}
    >
      {children}
    </div>
  );
};

// —— 数字滚动 ——
export const CountUp = ({
  from = 0,
  to,
  delay = 0,
  dur = 34,
  decimals = 0,
  prefix = "",
  suffix = "",
  style,
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame - delay, [0, dur], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <span style={{ fontFamily: F.num, fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// —— 药丸 chip ——
export const Chip = ({ children, color = C.white, border, bg, size = 34, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 30px",
      borderRadius: 999,
      fontFamily: F.cn,
      fontSize: size,
      fontWeight: 600,
      color,
      background: bg ?? "rgba(160,80,255,0.16)",
      border: `2px solid ${border ?? "rgba(160,80,255,0.5)"}`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

// —— 小节标签（kicker）——
export const Kicker = ({ children, style }) => (
  <div
    style={{
      fontFamily: F.cn,
      fontSize: 34,
      fontWeight: 600,
      letterSpacing: 10,
      color: C.purpleBright,
      display: "flex",
      alignItems: "center",
      gap: 22,
      justifyContent: "center",
      ...style,
    }}
  >
    <span style={{ width: 56, height: 2.5, background: C.purpleBright, opacity: 0.6 }} />
    {children}
    <span style={{ width: 56, height: 2.5, background: C.purpleBright, opacity: 0.6 }} />
  </div>
);

// —— 屏幕轻微震动（冲击瞬间用）——
export const useShake = (start, dur = 10, amp = 5) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > dur) {
    return { x: 0, y: 0 };
  }
  const decay = 1 - t / dur;
  return {
    x: Math.sin(t * 2.7) * amp * decay,
    y: Math.cos(t * 3.3) * amp * 0.6 * decay,
  };
};
