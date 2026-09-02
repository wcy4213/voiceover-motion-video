import React from "react";
import {
  AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, random, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import { C, F, H, W, SAFE_BOTTOM } from "./theme.js";

// ---------- 通用小工具 ----------
export const kick = (frame, at, decay = 9, freq = 2.2) => {
  const t = frame - at;
  if (t < 0) return 0;
  return Math.exp(-t / decay) * Math.sin(t / freq);
};

export const useShake = (start, dur = 10, amp = 5) => {
  const f = useCurrentFrame();
  const t = f - start;
  if (t < 0 || t > dur) return { x: 0, y: 0 };
  const d = 1 - t / dur;
  return { x: Math.sin(t * 2.4) * amp * d, y: Math.cos(t * 3.1) * amp * d };
};

// 拍点：from..to 之间可见，两端淡入淡出（to 一律等于下一拍起始常量，不加偏移）
export const Beat = ({ from, to, fade = 7, children, style }) => {
  const f = useCurrentFrame();
  if (f < from - 1 || f > to) return null;
  const op = interpolate(f, [from, from + fade, to - fade, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity: op, ...style }}>{children}</AbsoluteFill>;
};

export const Rise = ({ delay = 0, dist = 40, dur = 13, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * dist}px)`, ...style }}>{children}</div>
  );
};

export const Pop = ({ delay = 0, from = 1.22, children, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 13, mass: 0.62 }, durationInFrames: 20 });
  const sc = interpolate(s, [0, 1], [from, 1]);
  return (
    <div style={{ opacity: interpolate(f, [delay, delay + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `scale(${sc})`, ...style }}>
      {children}
    </div>
  );
};

export const FloatWrap = ({ amp = 7, speed = 0.05, phase = 0, rot = 0, children, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ transform: `translateY(${Math.sin(f * speed + phase) * amp}px) rotate(${Math.sin(f * speed * 0.7 + phase) * rot}deg)`, ...style }}>
      {children}
    </div>
  );
};

export const CountUp = ({ to, from = 0, delay = 0, dur = 26, dec = 0, suffix = "", prefix = "", style }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [delay, delay + dur], [from, to], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  return <span style={{ fontFamily: F.num, fontVariantNumeric: "tabular-nums", ...style }}>{prefix}{v.toFixed(dec)}{suffix}</span>;
};

// ---------- 纸面背景（纤维噪点 + 暗角）----------
export const PaperBackdrop = ({ seed = 7, tint = C.paper }) => {
  const f = useCurrentFrame();
  const drift = Math.sin(f * 0.006) * 8;
  return (
    <AbsoluteFill style={{ background: tint }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        <filter id={`fiber${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="4" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter={`url(#fiber${seed})`} opacity="0.14" />
      </svg>
      {/* 横向纸纹 */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
        <filter id={`grain${seed}`}>
          <feTurbulence type="turbulence" baseFrequency="0.006 0.42" numOctaves="2" seed={seed + 3} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter={`url(#grain${seed})`} />
      </svg>
      {/* 暗角 + 漂移暖光 */}
      <AbsoluteFill style={{ background: `radial-gradient(120% 90% at ${50 + drift * 0.4}% 34%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 46%), radial-gradient(130% 100% at 50% 50%, rgba(0,0,0,0) 52%, rgba(60,48,20,0.13) 100%)` }} />
    </AbsoluteFill>
  );
};

// ---------- 纸卡：从上方拍落（drop + 阴影 + 微弹）----------
export const PaperCard = ({
  delay = 0, w = 420, rot = -1.4, tone = "#FCFAF4", pad = 24, children, style,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 12, mass: 0.7 }, durationInFrames: 18 });
  const y = interpolate(s, [0, 1], [-70, 0]);
  const sc = interpolate(s, [0, 0.7, 1], [1.14, 1.02, 1]);
  const shadow = interpolate(s, [0, 1], [46, 18]);
  return (
    <div
      style={{
        width: w, padding: pad, background: tone, borderRadius: 10,
        opacity: interpolate(f, [delay, delay + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `translateY(${y}px) scale(${sc}) rotate(${rot}deg)`,
        boxShadow: `0 ${shadow}px ${shadow * 1.7}px rgba(26,22,10,0.24), 0 2px 5px rgba(26,22,10,0.14)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------- 拍立得：照片 + 图钉 ----------
export const Polaroid = ({
  src, delay = 0, w = 330, rot = -3, caption, imgH, objPos = "50% 32%", style, children,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 11, mass: 0.8 }, durationInFrames: 22 });
  const r = interpolate(s, [0, 1], [rot - 16, rot]);
  const sc = interpolate(s, [0, 0.75, 1], [1.3, 1.03, 1]);
  const ih = imgH ?? Math.round(w * 1.02);
  return (
    <div
      style={{
        width: w, background: "#FFFDF7", padding: 14, paddingBottom: caption ? 52 : 24,
        borderRadius: 4, opacity: interpolate(f, [delay, delay + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `rotate(${r}deg) scale(${sc})`,
        boxShadow: "0 16px 34px rgba(26,22,10,0.26), 0 2px 6px rgba(26,22,10,0.16)",
        position: "relative", ...style,
      }}
    >
      <div style={{ width: "100%", height: ih, overflow: "hidden", background: "#DED8C8", position: "relative" }}>
        {src ? (
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: objPos }} />
        ) : null}
        {children}
      </div>
      {caption ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: F.cn, fontSize: 26, fontWeight: 600, color: C.ink2 }}>{caption}</div>
      ) : null}
      {/* 图钉 */}
      <div style={{ position: "absolute", top: -13, left: "50%", marginLeft: -13, width: 26, height: 26, borderRadius: "50%", background: `radial-gradient(circle at 34% 30%, ${C.purpleSoft}, ${C.purple})`, boxShadow: "0 4px 9px rgba(0,0,0,0.34)" }} />
    </div>
  );
};

// ---------- 荧光笔：黄色涂层从左扫过文字 ----------
export const Highlighter = ({ delay = 0, dur = 20, children, color = C.highlight, h = "72%", style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad),
  });
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span style={{ position: "absolute", left: -6, bottom: "6%", width: `calc((100% + 12px) * ${p})`, height: h, background: color, borderRadius: 3, zIndex: 0 }} />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};

// ---------- 红笔手绘圈（椭圆逐段画出）----------
export const InkCircle = ({ delay = 0, dur = 22, w = 300, h = 110, color = C.red, sw = 7, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad),
  });
  const len = Math.PI * 2 * Math.sqrt((w * w + h * h) / 8) * 1.08;
  return (
    <svg width={w + 28} height={h + 28} style={{ position: "absolute", pointerEvents: "none", ...style }}>
      <ellipse
        cx={(w + 28) / 2} cy={(h + 28) / 2} rx={w / 2} ry={h / 2}
        fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
        transform={`rotate(-4 ${(w + 28) / 2} ${(h + 28) / 2})`}
        strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={0.92}
      />
    </svg>
  );
};

// ---------- 印章：砸下 + 轻转 ----------
export const Stamp = ({ children, delay = 0, color = C.red, size = 58, rotate = -8, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 9.5, mass: 0.5 }, durationInFrames: 15 });
  const sc = interpolate(s, [0, 0.6, 1], [2.5, 1.06, 1]);
  const op = interpolate(f, [delay, delay + 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: op, transform: `scale(${sc}) rotate(${rotate}deg)`, ...style }}>
      <div style={{ fontFamily: F.cn, fontSize: size, fontWeight: 800, color, letterSpacing: 3, padding: "8px 22px", border: `${Math.max(4, size / 12)}px solid ${color}`, borderRadius: 8, opacity: 0.92, whiteSpace: "nowrap", textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}>
        {children}
      </div>
    </div>
  );
};

// ---------- 便签（斜贴 + 微晃）----------
export const StickyNote = ({ delay = 0, w = 330, rot = 3, tone = "#FFF6A8", children, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 10, mass: 0.6 }, durationInFrames: 18 });
  const r = interpolate(s, [0, 1], [rot - 22, rot]) + Math.sin((f - delay) * 0.07) * 0.6;
  const x = interpolate(s, [0, 1], [90, 0]);
  return (
    <div style={{ width: w, padding: "18px 20px", background: tone, transform: `translateX(${x}px) rotate(${r}deg)`, opacity: interpolate(f, [delay, delay + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), boxShadow: "0 12px 24px rgba(26,22,10,0.22)", fontFamily: F.cn, fontSize: 30, fontWeight: 600, color: C.ink, lineHeight: 1.34, ...style }}>
      {children}
    </div>
  );
};

// ---------- 章节索引标签（纸右缘）----------
export const Tab = ({ label, active = false, delay = 0, top = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 12 }, durationInFrames: 16 });
  const x = interpolate(s, [0, 1], [70, 0]);
  return (
    <div style={{ position: "absolute", right: 0, top, transform: `translateX(${x}px)`, opacity: interpolate(f, [delay, delay + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), background: active ? C.purple : "#D9D2C2", color: active ? "#fff" : C.ink2, fontFamily: F.cn, fontSize: 44, fontWeight: 800, padding: "18px 26px 18px 34px", borderRadius: "20px 0 0 20px", letterSpacing: 2, whiteSpace: "nowrap", boxShadow: active ? `0 10px 26px rgba(111,0,255,0.40)` : "0 6px 14px rgba(0,0,0,0.16)", ...style }}>
      {label}
    </div>
  );
};

// ---------- 三角箭头 ----------
export const TriUp = ({ size = 40, color = C.up, style }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={style}><path d="M20 5 L36 33 L4 33 Z" fill={color} /></svg>
);
export const TriDown = ({ size = 40, color = C.down, style }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={style}><path d="M20 35 L4 7 L36 7 Z" fill={color} /></svg>
);

// ---------- 大箭头（带杆，用于砸下/挑起）----------
export const BigArrow = ({ dir = "down", delay = 0, w = 92, len = 210, color = C.down, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 11, mass: 0.55 }, durationInFrames: 16 });
  const dy = interpolate(s, [0, 1], [dir === "down" ? -120 : 120, 0]);
  const down = dir === "down";
  return (
    <svg width={w} height={len} viewBox={`0 0 92 210`} style={{ transform: `translateY(${dy}px)`, opacity: interpolate(f, [delay, delay + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), ...style }}>
      <rect x="34" y={down ? 0 : 60} width="24" height="150" fill={color} rx="6" />
      {down ? <path d="M46 208 L6 132 L86 132 Z" fill={color} /> : <path d="M46 2 L86 78 L6 78 Z" fill={color} />}
    </svg>
  );
};

// ---------- 免责水印（浅底 → 深灰）----------
export const Disclaimer = ({ text = "内容仅供科普 · 不构成投资建议" }) => (
  <div data-disclaimer="" style={{ position: "absolute", top: 24, right: 30, zIndex: 9999, pointerEvents: "none", fontFamily: F.cn, fontSize: 24, fontWeight: 600, color: "#5A554A", opacity: 0.5, whiteSpace: "nowrap" }}>
    {text}
  </div>
);

// ---------- 烧录字幕（零动效瞬切，LEAD 2 帧）----------
const LEAD = 2;
export const Subtitle = ({ cues }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (f + LEAD) / fps;
  const cue = cues.find((c) => t >= c.start && t <= c.end);
  if (!cue) return null;
  return (
    <div data-subtitle="" style={{ position: "absolute", left: 0, right: 0, bottom: 54, textAlign: "center", zIndex: 9000, pointerEvents: "none" }}>
      <span style={{ display: "inline-block", fontFamily: F.cn, fontSize: 46, fontWeight: 700, color: "#FFFFFF", letterSpacing: 1, WebkitTextStroke: `11px ${C.purple}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
        {cue.text}
      </span>
    </div>
  );
};

// ---------- 翻页转场 ----------
export const PageFlip = ({ dur = 18 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const deg = interpolate(p, [0, 1], [0, -168]);
  const shade = Math.sin(p * Math.PI);
  return (
    <AbsoluteFill style={{ perspective: 2200, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "left center", transform: `rotateY(${deg}deg)`, backfaceVisibility: "hidden", background: `linear-gradient(100deg, ${C.paperDeep} 0%, ${C.paper} 42%, #FFFDF6 100%)`, boxShadow: `${18 * shade}px 0 ${60 * shade}px rgba(0,0,0,${0.32 * shade})` }} />
      <AbsoluteFill style={{ background: `rgba(30,24,10,${0.2 * shade})` }} />
    </AbsoluteFill>
  );
};


// ---------- 纸面小窗（实拍嵌入纸里，圆角+内衬+轻做旧）----------
export const Window = ({ src, w, h, delay = 0, rot = -1, startFrom = 0, style, objPos = "50% 50%", grayscale = false }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [delay, delay + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sc = interpolate(f, [delay, delay + 14], [1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ width: w, height: h, borderRadius: 8, overflow: "hidden", opacity: op, transform: `rotate(${rot}deg) scale(${sc})`, boxShadow: "0 14px 30px rgba(26,22,10,0.28), inset 0 0 0 6px #FFFDF7", background: "#DED8C8", ...style }}>
      <OffthreadVideo muted src={staticFile(`druck07/broll/${src}`)} startFrom={startFrom} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: objPos, filter: `saturate(0.88) contrast(1.04) sepia(0.08)${grayscale ? " grayscale(0.9)" : ""}` }} />
    </div>
  );
};

// ---------- 底部常驻章节纸条（对标装置：五格进度索引，属"桌面"不随翻页）----------
export const ChapterBar = ({ chapters, total, appear = 560 }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [appear, appear + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (op <= 0) return null;
  const first = chapters[0].from;
  const prog = interpolate(f, [first, total], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div data-chapterbar="" style={{ position: "absolute", left: 40, right: 40, bottom: SAFE_BOTTOM, height: 40, opacity: op, zIndex: 8000, display: "flex", borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 20px rgba(26,22,10,0.22)" }}>
      {chapters.map((c, i) => {
        const active = f >= c.from && f < c.to;
        return (
          <div key={i} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: active ? C.purple : "#E3DCCB", color: active ? "#fff" : C.ink2, fontFamily: F.cn, fontSize: 23, fontWeight: 800, letterSpacing: 1, whiteSpace: "nowrap", borderRight: i < chapters.length - 1 ? "2px solid rgba(26,22,10,0.10)" : "none", transition: "none" }}>
            {c.label}
          </div>
        );
      })}
      {/* 黄荧光进度线 */}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 5, width: `${prog * 100}%`, background: C.yellow, opacity: 0.95 }} />
    </div>
  );
};

// ---------- 动画 emoji（弹入 + 浮动 + 可选脉冲）替代大段文字 ----------
export const Emo = ({ children, size = 120, delay = 0, amp = 9, speed = 0.052, phase = 0, rot = 3, pulse = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 10, mass: 0.6 }, durationInFrames: 20 });
  const sc = interpolate(s, [0, 0.72, 1], [0.2, 1.16, 1]);
  const t = f - delay;
  const beat = pulse > 0 ? 1 + Math.sin(t * 0.16) * pulse : 1;
  return (
    <div style={{ fontSize: size, lineHeight: 1, opacity: interpolate(f, [delay, delay + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${Math.sin(t * speed + phase) * amp}px) rotate(${Math.sin(t * speed * 0.7 + phase) * rot}deg) scale(${sc * beat})`, ...style }}>
      {children}
    </div>
  );
};
