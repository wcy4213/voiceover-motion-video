// 皮肤「数据终端 Terminal」（2026-10-08 video-director 新增）
// 画面态 = 一块彭博终端屏：近黑底 + 琥珀色等宽字 + 细网格 + 扫描线；数字先乱码滚动再锁定；
// 强调 = 反白色块（inverse video）；转场 = 一道扫描光带从上往下刷屏。
// 适用：投研热点线（宏观数据/财报/资金流/异动），和黑底点阵同属深色但质感完全不同（点阵=星空，终端=仪表）。
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {T, useFonts} from '../../motionkit/type.js';

export const C = {
  bg: '#07090A',
  grid: 'rgba(255,176,0,0.06)',
  amber: '#FFB000',      // 终端琥珀：主强调（替代品牌黄做"屏幕色"）
  amberDim: 'rgba(255,176,0,0.55)',
  ink: '#E9E4D8',        // 主文字（暖白，不用纯白）
  dim: '#7C786E',
  yellow: '#F9F339',     // 品牌黄：全片最关键 1–2 处
  purple: '#A050FF',     // 品牌紫：Bobby / 次强调
  up: '#2EBD85',
  down: '#F6465D',
};
export const F = {title: T.gaoduan, body: T.mono, num: T.din, cn: T.puhui};

export const SKIN = {
  id: 'terminal', name: '数据终端', dark: true,
  line: '投研热点（宏观数据 / 财报 / 资金流 / 异动榜）',
  pair: 'terminal（站酷高端黑 + Menlo + DIN Condensed）',
  motion: '逐字打出 + 方块光标；数字乱码滚动后锁定；扫描光带转场',
};

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const useFontsOnce = () => useFonts(['gaoduan', 'puhui']);

export const Backdrop = ({seed = 'terminal', width = 1080, height = 1440}) => {
  useFontsOnce();
  const f = useCurrentFrame();
  const tape = ' SPX 5,812.4 ▲0.6%   NDX 20,944 ▲0.9%   US10Y 4.12% ▼3bp   DXY 101.8 ▼0.2%   WTI 71.3 ▲1.1%   GOLD 2,684 ▲0.4%   BTC 67,210 ▼1.2%  ';
  const shift = (f * 2.2) % 1400;
  const glowY = height * (0.3 + 0.12 * Math.sin((f + random(seed) * 400) / 70));
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      <div style={{position: 'absolute', left: -200, top: glowY - 500, width: width + 400, height: 1000,
        background: 'radial-gradient(ellipse at center, rgba(255,176,0,0.07) 0%, transparent 60%)'}} />
      {/* 顶部行情带（常驻，帧驱动滚动） */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 44, background: 'rgba(255,176,0,0.08)', borderBottom: `1px solid ${C.amberDim}`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 9, left: -shift, whiteSpace: 'nowrap', fontFamily: F.body, fontSize: 21, color: C.amber, letterSpacing: 1}}>
          {tape.repeat(4)}
        </div>
      </div>
      {/* 扫描线 + 暗角 */}
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

// 签名入场：左→右逐列显影（clip-path）+ 末端方块光标，8 帧；still = frame 0 终态
export const Enter = ({delay = 0, dur = 9, still, children, style}) => {
  const f = useCurrentFrame();
  if (still) return <div style={style}>{children}</div>;
  const p = interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  if (p <= 0) return null;
  const cursor = p < 1 || (f - delay - dur) % 16 < 8;
  return (
    <div style={{position: 'relative', display: 'inline-block', ...style}}>
      <div style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>{children}</div>
      {p < 1 && cursor ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${p * 100}%`, width: 14, background: C.amber}} /> : null}
    </div>
  );
};

// 大标题：accent 关键词反白（琥珀底黑字）
export const Headline = ({children, accent, size = 104, still, delay = 0}) => {
  const f = useCurrentFrame();
  const lines = String(children).split('\n');
  const inv = still ? 1 : interpolate(f - delay, [6, 12], [0, 1], cl);
  const render = (line) => {
    if (!accent || !line.includes(accent)) return line;
    const [a, b] = line.split(accent);
    return (<>{a}<span style={{background: inv > 0.5 ? C.amber : 'transparent', color: inv > 0.5 ? C.bg : C.amber, padding: '0 10px', boxShadow: inv > 0.5 ? `0 0 40px rgba(255,176,0,0.35)` : 'none'}}>{accent}</span>{b}</>);
  };
  return (
    <div style={{fontFamily: F.title, fontSize: size, lineHeight: 1.08, color: C.ink, letterSpacing: '-0.01em', textShadow: '0 0 18px rgba(255,176,0,0.18)'}}>
      {lines.map((l, i) => <div key={i} style={{whiteSpace: 'nowrap'}}>{render(l)}</div>)}
    </div>
  );
};

// 巨数字：前 60% 时间乱码滚动（确定性 random），之后锁定为真值
export const Hero = ({value, prefix = '', suffix = '', decimals = 0, size = 160, delay = 0, dur = 34, color, still}) => {
  const f = useCurrentFrame();
  const t = still ? dur : f - delay;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const shown = value * p;
  let txt = Math.abs(shown).toFixed(decimals);
  if (p < 0.6 && !still) {
    txt = txt.split('').map((ch, i) => (/\d/.test(ch) ? Math.floor(random(`d${i}-${Math.floor(t / 2)}`) * 10) : ch)).join('');
  }
  const sign = value < 0 ? '−' : '';
  const col = color === 'down' ? C.down : color === 'up' ? C.up : color || C.amber;
  return (
    <div style={{fontFamily: F.num, fontSize: size, lineHeight: 0.9, color: col, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textShadow: `0 0 28px ${col}55`}}>
      <span style={{fontSize: size * 0.5, color: C.dim}}>{prefix}</span>{sign}{txt}<span style={{fontSize: size * 0.42, marginLeft: 8, fontFamily: F.cn}}>{suffix}</span>
    </div>
  );
};

// 功能键标签：[F1] 热点拆解
export const Label = ({children}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: F.cn, fontSize: 30, color: C.amber, border: `1.5px solid ${C.amberDim}`, padding: '6px 16px 6px 6px'}}>
    <span style={{background: C.amber, color: C.bg, fontFamily: F.body, fontSize: 20, padding: '3px 8px', fontWeight: 700}}>F1</span>{children}
  </div>
);

export const Delta = ({value, size = 64}) => {
  const up = value >= 0;
  return (
    <div style={{fontFamily: F.num, fontSize: size, color: up ? C.up : C.down, whiteSpace: 'nowrap'}}>
      {up ? '▲' : '▼'} {up ? '+' : '−'}{Math.abs(value).toFixed(1)}%
    </div>
  );
};

// 强调：四角括号逐个画出
export const Mark = ({children, delay = 0}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, 8], [0, 1], cl);
  const L = 22 * p;
  const corner = (pos) => <div style={{position: 'absolute', width: L, height: L, borderColor: C.yellow, borderStyle: 'solid', borderWidth: 0, ...pos}} />;
  return (
    <div style={{position: 'relative', padding: '10px 22px'}}>
      {corner({left: 0, top: 0, borderLeftWidth: 4, borderTopWidth: 4})}
      {corner({right: 0, top: 0, borderRightWidth: 4, borderTopWidth: 4})}
      {corner({left: 0, bottom: 0, borderLeftWidth: 4, borderBottomWidth: 4})}
      {corner({right: 0, bottom: 0, borderRightWidth: 4, borderBottomWidth: 4})}
      {children}
    </div>
  );
};

// 判词：反白块，入场时一次反色闪（单次，不频闪）
export const Stamp = ({children, delay = 0}) => {
  const f = useCurrentFrame();
  const t = f - delay;
  const flash = t >= 0 && t < 4;
  return (
    <div style={{fontFamily: F.title, fontSize: 64, padding: '10px 30px', background: flash ? C.ink : C.yellow, color: C.bg, boxShadow: '0 0 50px rgba(249,243,57,0.35)'}}>
      ■ {children}
    </div>
  );
};

// 窗口面板：标题栏 = "<logo> 英伟达  NVDA US Equity"
export const Panel = ({children, w = 440, logo, title}) => (
  <div style={{width: w, border: `1.5px solid ${C.amberDim}`, background: 'rgba(12,14,15,0.86)'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,176,0,0.12)', borderBottom: `1px solid ${C.amberDim}`}}>
      {logo ? <Img src={staticFile(logo)} style={{width: 40, height: 40, borderRadius: 8}} /> : null}
      <span style={{fontFamily: F.cn, fontSize: 30, color: C.ink}}>{title}</span>
      <span style={{marginLeft: 'auto', fontFamily: F.body, fontSize: 18, color: C.dim}}>EQUITY</span>
    </div>
    <div style={{padding: '26px 22px 30px'}}>{children}</div>
  </div>
);

// 人物：单色琥珀荧光处理 + 扫描线 + 角括号 + 等宽字说明
export const Photo = ({src, caption, w = 560, h = 700, style}) => (
  <div style={{width: w, height: h, ...style}}>
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', filter: 'grayscale(1) contrast(1.25) brightness(1.05) sepia(1) hue-rotate(-12deg) saturate(2.6)'}} />
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 4px)'}} />
      {caption ? <div style={{position: 'absolute', right: 24, bottom: -6, fontFamily: F.cn, fontSize: 24, color: C.bg, background: C.amber, padding: '4px 12px'}}>{caption}</div> : null}
    </div>
  </div>
);

// 封面日期：状态栏式时间戳 + 闪烁 LIVE 点（frame 0 点亮）
export const DateMark = ({text = '10·08', still}) => {
  const f = useCurrentFrame();
  const on = still || f % 30 < 20;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.body, fontSize: 28, color: C.amber, letterSpacing: 2}}>
      <span style={{fontFamily: F.num, fontSize: 64, color: C.ink, letterSpacing: 0}}>{text}</span>
      <span style={{width: 14, height: 14, borderRadius: 7, background: on ? C.down : 'transparent', boxShadow: on ? `0 0 14px ${C.down}` : 'none'}} />
      <span>LIVE · ET</span>
    </div>
  );
};

export const ChapterMark = ({n = 1, title}) => (
  <div style={{position: 'absolute', top: 76, left: 64, fontFamily: F.body, fontSize: 24, color: C.amberDim, letterSpacing: 2}}>
    {String(n).padStart(2, '0')} &lt;GO&gt; <span style={{fontFamily: F.cn, color: C.amber}}>{title}</span>
  </div>
);

// 大章节转场：一道亮扫描带从上刷到下，带走旧画面（前后各 10 帧）
export const Wipe = ({at, half = 10}) => {
  const f = useCurrentFrame();
  const {height} = useVideoConfig();
  const t = f - (at - half);
  if (t < 0 || t > half * 2) return null;
  const y = interpolate(t, [0, half * 2], [-120, height + 120], {easing: Easing.inOut(Easing.cubic)});
  const cover = t <= half ? interpolate(t, [0, half], [0, 1]) : interpolate(t, [half, half * 2], [1, 0]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: C.bg, opacity: cover * 0.92}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: y - 60, height: 120, background: `linear-gradient(180deg, transparent, rgba(255,176,0,0.55) 45%, ${C.amber} 50%, rgba(255,176,0,0.55) 55%, transparent)`}} />
    </AbsoluteFill>
  );
};

export const Disclaimer = ({text = '内容仅供信息参考 · 不构成投资建议'}) => (
  <div style={{position: 'absolute', top: 58, right: 34, fontFamily: F.cn, fontSize: 22, color: C.ink, opacity: 0.38, zIndex: 99}}>{text}</div>
);
