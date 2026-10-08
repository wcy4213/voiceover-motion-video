// 皮肤「新粗野 Neo-brutal」（2026-10-08 video-director 新增）
// 画面态 = 平涂亮色块 + 5px 纯黑描边 + 硬投影（无模糊，10px 10px 0 #000）+ 圆角 18；元素像实体贴片"砸"上来再弹两下。
// 品牌紫/黄是主色而不是点缀 —— 这是唯一一套让品牌色"满屏"的皮肤。字体得意黑（斜切）+ 优设标题黑。
// 适用：投教轻松题、榜单/盘点、梗图式对比、"N 个误区"；年轻、有态度，和终端/玻璃的"高级冷"正好相反。
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {T, useFonts} from '../../motionkit/type.js';

export const C = {
  bg: '#FFF4D6',        // 奶油底
  dot: 'rgba(0,0,0,0.10)',
  ink: '#0A0A0A',
  purple: '#6F00FF',
  violet: '#A050FF',
  yellow: '#F9F339',
  mint: '#3DDC97',
  pink: '#FF8AD8',
  sky: '#7CC8FF',
  white: '#FFFFFF',
  up: '#14A05A',
  down: '#E5383B',
};
export const F = {title: T.youshe, body: T.sourceB, num: T.smiley, alt: T.jinbu};

export const SKIN = {
  id: 'brutal', name: '新粗野', dark: false,
  line: '投教轻松题 / 榜单盘点 / 误区 / 梗图式对比（浅底）',
  pair: '优设标题黑 + 得意黑数字 + 思源黑体 Bold',
  motion: '实体贴片砸入 + 两次弹跳（spring 低阻尼）· 硬投影随入场收紧 · 色块横推转场',
};

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const box = (bg = C.white, r = 18, sh = 10) => ({background: bg, border: `5px solid ${C.ink}`, borderRadius: r, boxShadow: `${sh}px ${sh}px 0 ${C.ink}`});

export const Backdrop = ({height = 1440}) => {
  useFonts(['youshe', 'sourceB', 'smiley', 'jinbu']);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${C.dot} 2.2px, transparent 2.4px)`, backgroundSize: '34px 34px'}} />
      {/* 角落几何色块（静态装饰，每期可换颜色/位置） */}
      <div style={{...box(C.mint, 0, 0), position: 'absolute', width: 180, height: 180, right: -60, top: height * 0.62, transform: 'rotate(18deg)'}} />
      <div style={{...box(C.pink, 999, 0), position: 'absolute', width: 120, height: 120, left: -40, bottom: 110}} />
    </AbsoluteFill>
  );
};

// 签名入场：从上方 -60px 砸下 + 低阻尼弹两下；硬投影 0→10px 收紧
export const Enter = ({delay = 0, still, children, style}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (still) return <div style={{display: 'inline-block', ...style}}>{children}</div>;
  const s = spring({frame: f - delay, fps, config: {damping: 8, stiffness: 170, mass: 0.7}});
  if (f - delay < 0) return null;
  const y = (1 - s) * -60;
  const rot = (1 - s) * -4;
  return <div style={{display: 'inline-block', transform: `translateY(${y}px) rotate(${rot}deg) scale(${0.85 + 0.15 * Math.min(s, 1.12)})`, opacity: Math.min(1, s * 3), ...style}}>{children}</div>;
};

// 大标题：accent 关键词放进黄色贴片（黑描边 + 硬投影，微倾斜）
export const Headline = ({children, accent, size = 120, still, delay = 0}) => {
  const lines = String(children).split('\n');
  return (
    <div style={{fontFamily: F.title, fontSize: size, lineHeight: 1.12, color: C.ink}}>
      {lines.map((l, i) => (
        <div key={i} style={{whiteSpace: 'nowrap'}}>
          {accent && l.includes(accent) ? (
            <>{l.split(accent)[0]}<Enter still={still} delay={delay + 6} style={{margin: '8px 0'}}>
              <span style={{...box(C.yellow, 16, 8), display: 'inline-block', padding: '0 22px', transform: 'rotate(-2.5deg)'}}>{accent}</span>
            </Enter>{l.split(accent)[1]}</>
          ) : l}
        </div>
      ))}
    </div>
  );
};

export const Hero = ({value, prefix = '', suffix = '', decimals = 0, size = 170, delay = 0, dur = 26, color, still}) => {
  const f = useCurrentFrame();
  const p = still ? 1 : interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const col = color === 'down' ? C.down : color === 'up' ? C.up : color || C.purple;
  return (
    <div style={{fontFamily: F.num, fontSize: size, lineHeight: 0.92, color: col, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', WebkitTextStroke: `4px ${C.ink}`, paintOrder: 'stroke fill', textShadow: `6px 6px 0 ${C.ink}`}}>
      {prefix}{value < 0 ? '−' : ''}{Math.abs(value * p).toFixed(decimals)}<span style={{fontFamily: F.title, fontSize: size * 0.36, marginLeft: 8, WebkitTextStroke: 0, textShadow: 'none', color: C.ink}}>{suffix}</span>
    </div>
  );
};

export const Label = ({children, bg = C.purple}) => (
  <div style={{...box(bg, 999, 6), display: 'inline-block', padding: '8px 26px', fontFamily: F.alt, fontSize: 32, color: C.white}}>{children}</div>
);

export const Delta = ({value, size = 60}) => {
  const up = value >= 0;
  return (
    <div style={{...box(up ? C.mint : C.pink, 14, 7), display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 22px', fontFamily: F.num, fontSize: size, color: C.ink}}>
      {up ? '↑' : '↓'} {up ? '+' : '−'}{Math.abs(value).toFixed(1)}%
    </div>
  );
};

// 强调：手绘感粗黑圈（SVG 描边画出）
export const Mark = ({children, delay = 0}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, 14], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'relative', display: 'inline-block', padding: '18px 34px'}}>
      <svg viewBox="0 0 200 100" preserveAspectRatio="none" style={{position: 'absolute', inset: -6, width: 'calc(100% + 12px)', height: 'calc(100% + 12px)', overflow: 'visible'}}>
        <path d="M18 52 C 20 12, 182 6, 186 48 C 190 92, 30 96, 12 60 C 6 40, 40 18, 90 14" fill="none" stroke={C.ink} strokeWidth="5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} vectorEffect="non-scaling-stroke" />
      </svg>
      {children}
    </div>
  );
};

export const Stamp = ({children, delay = 0}) => (
  <Enter delay={delay}>
    <div style={{...box(C.yellow, 22, 12), padding: '14px 40px', fontFamily: F.title, fontSize: 70, color: C.ink, transform: 'rotate(-3deg)'}}>{children}!</div>
  </Enter>
);

export const Panel = ({children, w = 440, logo, title}) => (
  <div style={{...box(C.white, 24, 12), width: w, overflow: 'hidden'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: C.sky, borderBottom: `5px solid ${C.ink}`}}>
      {logo ? <Img src={staticFile(logo)} style={{width: 48, height: 48, borderRadius: 12, border: `3px solid ${C.ink}`}} /> : null}
      <span style={{fontFamily: F.title, fontSize: 40, color: C.ink}}>{title}</span>
    </div>
    <div style={{padding: '22px 24px 28px'}}>{children}</div>
  </div>
);

// 人物：彩色底卡（紫）+ 黑描边硬投影，抠图冲出卡片上沿
export const Photo = ({src, caption, w = 600, h = 760, style}) => (
  <div style={{width: w, height: h, position: 'relative', ...style}}>
    <div style={{...box(C.purple, 36, 14), position: 'absolute', left: w * 0.06, right: 10, top: h * 0.26, bottom: 0}} />
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom'}} />
    {caption ? <div style={{...box(C.white, 12, 6), position: 'absolute', left: 0, bottom: 24, padding: '6px 18px', fontFamily: F.body, fontSize: 26, color: C.ink}}>{caption}</div> : null}
  </div>
);

// 封面日期：撕页日历（黑描边硬投影，顶部红条）
export const DateMark = ({text = '10·08'}) => {
  const [m, d] = text.split('·');
  return (
    <div style={{...box(C.white, 16, 8), width: 150, overflow: 'hidden', transform: 'rotate(-4deg)'}}>
      <div style={{background: C.down, borderBottom: `5px solid ${C.ink}`, textAlign: 'center', fontFamily: F.body, fontSize: 26, color: C.white, padding: '4px 0'}}>{Number(m)} 月</div>
      <div style={{textAlign: 'center', fontFamily: F.num, fontSize: 84, lineHeight: 1.1, color: C.ink}}>{d}</div>
    </div>
  );
};

export const ChapterMark = ({n = 1, title}) => (
  <div style={{...box(C.yellow, 999, 6), position: 'absolute', top: 70, left: 64, padding: '8px 24px', fontFamily: F.alt, fontSize: 30, color: C.ink}}>
    #{n} {title}
  </div>
);

// 大章节转场：三条彩色粗条依次横推覆盖再推走
export const Wipe = ({at, half = 10}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = f - (at - half);
  if (t < 0 || t > half * 2) return null;
  const cols = [C.purple, C.yellow, C.mint];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {cols.map((c, i) => {
        const local = t - i * 1.5;
        const x = local <= half ? interpolate(local, [0, half], [-width, 0], {...cl, easing: Easing.out(Easing.cubic)}) : interpolate(local, [half, half * 2], [0, width], {...cl, easing: Easing.in(Easing.cubic)});
        return <div key={i} style={{position: 'absolute', left: x, top: (height / 3) * i - 4, width, height: height / 3 + 8, background: c, borderTop: `5px solid ${C.ink}`, borderBottom: `5px solid ${C.ink}`}} />;
      })}
    </AbsoluteFill>
  );
};

export const Disclaimer = ({text = '内容仅供信息参考 · 不构成投资建议'}) => (
  <div style={{position: 'absolute', top: 30, right: 34, fontFamily: F.body, fontSize: 22, color: C.ink, opacity: 0.45, zIndex: 99}}>{text}</div>
);
