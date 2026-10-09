// 皮肤「暗夜金博物馆 Museum」（2026-10-09，对标 #vibe知识大赏 头部 12/23 条的共同画风）
// 画面态 = 一座夜里的博物馆：深棕/藏青底 + 金描边图形 + 宋体一行字幕（关键词换金/红）+ 左上年份 HUD + 右上文献角标 +
// 纸质论文卡 3D 翻入 + 片尾题名卡/文献卡。没有真人、没有实拍、没有写实 AI 画面。横屏 16:9 知识短片线默认皮肤（F21/F22/F23）。
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {T, useFonts} from '../../motionkit/type.js';

export const C = {
  bg: '#14110D',          // 深棕近黑
  bg2: '#0E1420',         // 藏青（换幕用）
  gold: '#C9A24A',        // 金描边
  goldBright: '#E8C76B',
  ink: '#F3EBD8',         // 米白字
  dim: '#8E8371',
  red: '#C8463A',         // 关键词红 / 跌
  green: '#5FA86E',       // 涨
  paper: '#EFE6D2',       // 纸卡
  paperInk: '#2B241B',
  purple: '#A050FF',      // Bobby 位专用，不进画面色板
  yellow: '#F9F339',
  up: '#5FA86E', down: '#C8463A',
};
// 宋体系：风雅宋做标题/字幕（OFL），数字用 Playfair（高对比衬线，和宋体同气质）
export const F = {title: T.fengya, body: T.fengya, num: T.playfair, mono: T.jbmono, sans: T.sourceR};

export const SKIN = {
  id: 'museum', name: '暗夜金博物馆', dark: true,
  line: '横屏无口播知识短片（F21 差一点 / F22 编年史 / F23 模拟）、历史与投教概念',
  pair: '风雅宋 + Playfair Black 数字',
  motion: '金线描边逐笔画出 · 纸卡 3D 翻入 · 年份 HUD 跳变 · 字幕逐词显影关键词换金 · 幕间暗场金线横扫',
};

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

export const Backdrop = ({seed = 'museum', width = 1920, height = 1080, tone = 'brown'}) => {
  useFonts(['fengya', 'playfair', 'jbmono', 'sourceR']);
  const f = useCurrentFrame();
  const base = tone === 'navy' ? C.bg2 : C.bg;
  const gx = width * (0.5 + 0.2 * Math.sin((f + random(seed) * 300) / 240));
  return (
    <AbsoluteFill style={{background: base, overflow: 'hidden'}}>
      {/* 顶光：一盏昏黄射灯 */}
      <div style={{position: 'absolute', left: gx - width * 0.45, top: -height * 0.5, width: width * 0.9, height: height * 1.1, background: 'radial-gradient(ellipse at 50% 35%, rgba(201,162,74,0.13) 0%, transparent 60%)'}} />
      {/* 纸纹颗粒（静态） */}
      <AbsoluteFill style={{opacity: 0.22, backgroundImage: 'radial-gradient(rgba(255,240,200,0.18) 0.6px, transparent 0.8px)', backgroundSize: '5px 5px'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.62) 100%)'}} />
      {/* 四角细金线框，博物馆展签感 */}
      <div style={{position: 'absolute', inset: 36, border: `1px solid rgba(201,162,74,0.22)`}} />
    </AbsoluteFill>
  );
};

// 签名入场：金色显影——从底部微升 + 模糊收束 + 一道金色扫光
export const Enter = ({delay = 0, dur = 16, still, children, style}) => {
  const f = useCurrentFrame();
  if (still) return <div style={{display: 'inline-block', ...style}}>{children}</div>;
  const p = interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: EXPO});
  if (p <= 0) return null;
  return <div style={{display: 'inline-block', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 18}px)`, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : 'none', ...style}}>{children}</div>;
};

export const Headline = ({children, accent, size = 96, still, delay = 0, color = C.ink}) => {
  const lines = String(children).split('\n');
  return (
    <div style={{fontFamily: F.title, fontSize: size, lineHeight: 1.25, color, letterSpacing: '0.04em'}}>
      {lines.map((l, i) => (
        <Enter key={i} still={still} delay={delay + i * 6} style={{display: 'block'}}>
          <span style={{whiteSpace: 'nowrap'}}>
            {accent && l.includes(accent) ? (<>{l.split(accent)[0]}<span style={{color: C.goldBright}}>{accent}</span>{l.split(accent)[1]}</>) : l}
          </span>
        </Enter>
      ))}
    </div>
  );
};

// 巨数字：金色、带细描边发光，count-up
export const Hero = ({value, prefix = '', suffix = '', decimals = 0, size = 180, delay = 0, dur = 34, color, still}) => {
  const f = useCurrentFrame();
  const p = still ? 1 : interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: EXPO});
  const col = color === 'down' ? C.red : color === 'up' ? C.green : color || C.goldBright;
  return (
    <div style={{fontFamily: F.num, fontSize: size, lineHeight: 0.95, color: col, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textShadow: `0 0 36px rgba(201,162,74,0.35)`}}>
      {prefix}{value < 0 ? '−' : ''}{Math.abs(value * p).toFixed(decimals)}<span style={{fontFamily: F.title, fontSize: size * 0.34, marginLeft: 10, color: C.ink}}>{suffix}</span>
    </div>
  );
};

// 展签式标签：细金框 + 宋体小字
export const Label = ({children}) => (
  <div style={{display: 'inline-block', fontFamily: F.title, fontSize: 26, color: C.goldBright, border: `1px solid ${C.gold}`, padding: '6px 18px', letterSpacing: '0.2em'}}>{children}</div>
);

export const Delta = ({value, size = 56}) => {
  const up = value >= 0;
  return <div style={{fontFamily: F.num, fontSize: size, color: up ? C.green : C.red, whiteSpace: 'nowrap'}}>{up ? '▲' : '▼'} {up ? '+' : '−'}{Math.abs(value).toFixed(1)}%</div>;
};

// 强调：金色细线框逐笔画出（左上→右下两段）
export const Mark = ({children, delay = 0}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, 14], [0, 1], {...cl, easing: EXPO});
  return (
    <div style={{position: 'relative', display: 'inline-block', padding: '12px 24px'}}>
      <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'}} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 100 L0 0 L100 0" fill="none" stroke={C.gold} strokeWidth="1.2" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
        <path d="M100 0 L100 100 L0 100" fill="none" stroke={C.gold} strokeWidth="1.2" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
      </svg>
      {children}
    </div>
  );
};

// 判词：金底深字展牌
export const Stamp = ({children, delay = 0}) => (
  <Enter delay={delay}>
    <div style={{fontFamily: F.title, fontSize: 54, letterSpacing: '0.12em', color: C.bg, background: C.goldBright, padding: '10px 34px'}}>{children}</div>
  </Enter>
);

// 纸质卡（论文 / 实验记录 / 文件）：米白纸 + 顶部小字眉 + 轻微旋转
export const Panel = ({children, w = 520, logo, title, rot = -1.2}) => (
  <div style={{width: w, background: C.paper, color: C.paperInk, padding: '34px 44px 40px', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', transform: `rotate(${rot}deg)`, borderTop: `6px solid ${C.gold}`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, fontFamily: F.mono, fontSize: 22, color: '#7A6E5C', letterSpacing: 3}}>
      {logo ? <Img src={staticFile(logo)} style={{width: 32, height: 32, borderRadius: 6}} /> : null}
      <span>{title}</span>
    </div>
    <div style={{fontFamily: F.title}}>{children}</div>
  </div>
);

// 人物：博物馆肖像——金框 + 暗棕衬 + 展签（抠图或老照片）
export const Photo = ({src, caption, w = 520, h = 680, style}) => (
  <div style={{width: w, height: h, position: 'relative', ...style}}>
    <div style={{position: 'absolute', left: w * 0.06, right: 0, top: h * 0.1, bottom: 0, border: `2px solid ${C.gold}`, background: 'rgba(0,0,0,0.35)'}} />
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', filter: 'sepia(0.5) contrast(1.1)'}} />
    {caption ? <div style={{position: 'absolute', left: w * 0.06, bottom: -8, fontFamily: F.title, fontSize: 22, letterSpacing: '0.15em', color: C.bg, background: C.goldBright, padding: '4px 14px'}}>{caption}</div> : null}
  </div>
);

// 封面日期：博物馆展签编号 "2026 · 10 · 09"
export const DateMark = ({text = '10·09'}) => (
  <div style={{display: 'inline-block', fontFamily: F.num, fontSize: 40, color: C.goldBright, letterSpacing: '0.2em', borderBottom: `1px solid ${C.gold}`, paddingBottom: 6}}>{text}</div>
);

// 左上年份 / 章节 HUD（知识短片的"时间标尺"）
export const ChapterMark = ({n, title, year}) => (
  <div style={{position: 'absolute', top: 64, left: 72, display: 'flex', alignItems: 'baseline', gap: 18}}>
    {year != null || n != null ? <span style={{fontFamily: F.num, fontSize: 54, color: C.goldBright, letterSpacing: '0.04em'}}>{year ?? String(n).padStart(2, '0')}</span> : null}
    {title ? <span style={{fontFamily: F.title, fontSize: 30, color: C.goldBright, letterSpacing: '0.2em', opacity: 0.85}}>{title}</span> : null}
  </div>
);

// 大章节转场：暗场 + 一道金线从左横扫
export const Wipe = ({at, half = 10}) => {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  const t = f - (at - half);
  if (t < 0 || t > half * 2) return null;
  const x = interpolate(t, [0, half * 2], [-80, width + 80], {easing: Easing.inOut(Easing.cubic)});
  const dark = t <= half ? interpolate(t, [0, half], [0, 0.9]) : interpolate(t, [half, half * 2], [0.9, 0]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: C.bg, opacity: dark}} />
      <div style={{position: 'absolute', top: 0, bottom: 0, left: x, width: 3, background: C.goldBright, boxShadow: `0 0 40px ${C.gold}`}} />
    </AbsoluteFill>
  );
};

export const Disclaimer = ({text = '内容仅供科普 · 不构成投资建议'}) => (
  <div style={{position: 'absolute', top: 44, right: 72, fontFamily: F.title, fontSize: 20, color: C.ink, opacity: 0.4, zIndex: 99, letterSpacing: '0.1em'}}>{text}</div>
);
