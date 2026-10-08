// 皮肤「液态玻璃 Glass」（2026-10-08 video-director 新增）
// 画面态 = 偏紫近黑底 + 一盏左上冷顶光 + 一团很淡的品牌紫地光，上面漂磨砂玻璃面板：backdrop blur + 1px 高光边 + 内反光；
// 字体干净现代（MiSans Heavy + HarmonyOS Black）；入场 = 模糊→清晰 + 轻微上浮（"对焦"）；转场 = 一块全屏玻璃横扫折射。
// 适用：AI / 科技 / 新产品 / IPO / 高端品牌题；"前沿高级感"担当。性能：backdrop-filter 偏重，单屏玻璃面板 ≤4 块。
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {T, useFonts} from '../../motionkit/type.js';

export const C = {
  bg: '#0B0A10',          // 偏紫的近黑（中性色向品牌色轻微着色，不用纯黑）
  ink: '#F6F3FF',
  dim: 'rgba(246,243,255,0.62)',
  purple: '#6F00FF',
  violet: '#A050FF',
  blue: '#3D5BFF',
  cyan: '#22D3EE',
  yellow: '#F9F339',
  up: '#34D399',
  down: '#FB7185',
};
export const F = {title: T.misans, body: T.puhui, num: T.harmony};

export const SKIN = {
  id: 'glass', name: '液态玻璃', dark: true,
  line: 'AI / 科技 / 新产品 / IPO / 高端品牌题',
  pair: 'MiSans Heavy + 普惠体 + HarmonyOS Black 数字',
  motion: '模糊→对焦入场 · 单光源缓慢漂移 · 玻璃横扫转场 · 强调用实色品牌黄（不用紫青渐变字/满屏极光——那是 AI 默认审美）',
};

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const expo = Easing.bezier(0.16, 1, 0.3, 1);

const glassStyle = (r = 34) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 100%)',
  backdropFilter: 'blur(28px) saturate(1.6)',
  WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
  border: '1.5px solid rgba(255,255,255,0.28)',
  borderRadius: r,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -18px 40px rgba(111,0,255,0.12), 0 30px 80px rgba(0,0,0,0.45)',
});

export const Backdrop = ({seed = 'glass', width = 1080, height = 1440}) => {
  useFonts(['misans', 'puhui', 'harmony']);
  const f = useCurrentFrame();
  const blob = (k, color, size, bx, by) => {
    const x = width * bx + noise2D(`${seed}${k}x`, f * 0.004, 0) * width * 0.35;
    const y = height * by + noise2D(`${seed}${k}y`, 0, f * 0.004) * height * 0.25;
    return <div key={k} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, transparent 65%)`, opacity: 0.85}} />;
  };
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {blob('a', 'rgba(111,0,255,0.42)', 1500, 0.3, 0.78)}
      {/* 顶光：一盏冷白柔光从左上打下（光源固定，玻璃高光方向与之一致） */}
      <div style={{position: 'absolute', left: -width * 0.3, top: -height * 0.35, width: width * 1.3, height: height * 0.9, background: 'radial-gradient(ellipse at 35% 40%, rgba(226,222,255,0.16) 0%, transparent 60%)'}} />
      {/* 细噪点防 banding（静态） */}
      <AbsoluteFill style={{opacity: 0.16, backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 0.6px, transparent 0.7px)', backgroundSize: '4px 4px'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

export const Enter = ({delay = 0, dur = 18, still, children, style}) => {
  const f = useCurrentFrame();
  const p = still ? 1 : interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: expo});
  if (p <= 0) return null;
  return <div style={{display: 'inline-block', opacity: Math.min(1, p * 1.6), filter: p < 1 ? `blur(${(1 - p) * 18}px)` : 'none', transform: `translateY(${(1 - p) * 24}px) scale(${0.96 + 0.04 * p})`, ...style}}>{children}</div>;
};

export const Headline = ({children, accent, size = 118, still, delay = 0}) => {
  const lines = String(children).split('\n');
  return (
    <div style={{fontFamily: F.title, fontSize: size, lineHeight: 1.06, color: C.ink, letterSpacing: '-0.02em'}}>
      {lines.map((l, i) => (
        <Enter key={i} still={still} delay={delay + i * 6} style={{display: 'block'}}>
          <span style={{whiteSpace: 'nowrap'}}>
            {accent && l.includes(accent) ? (<>{l.split(accent)[0]}<span style={{color: C.yellow}}>{accent}</span>{l.split(accent)[1]}</>) : l}
          </span>
        </Enter>
      ))}
    </div>
  );
};

export const Hero = ({value, prefix = '', suffix = '', decimals = 0, size = 170, delay = 0, dur = 32, color, still}) => {
  const f = useCurrentFrame();
  const p = still ? 1 : interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: expo});
  const col = color === 'down' ? C.down : color === 'up' ? C.up : color || C.ink;
  return (
    <div style={{fontFamily: F.num, fontSize: size, lineHeight: 0.9, color: col, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textShadow: color ? `0 0 30px ${col}66` : 'none'}}>
      {prefix}{value < 0 ? '−' : ''}{Math.abs(value * p).toFixed(decimals)}<span style={{fontFamily: F.title, fontSize: size * 0.38, marginLeft: 10, color: C.dim}}>{suffix}</span>
    </div>
  );
};

export const Label = ({children}) => (
  <div style={{...glassStyle(999), display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 24px', fontFamily: F.body, fontSize: 30, color: C.ink}}>
    <span style={{width: 12, height: 12, borderRadius: 6, background: C.violet}} />{children}
  </div>
);

export const Delta = ({value, size = 60}) => {
  const up = value >= 0;
  const col = up ? C.up : C.down;
  return (
    <div style={{...glassStyle(999), display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 26px', fontFamily: F.num, fontSize: size, color: col}}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 10 10"><path d={up ? 'M5 0 L10 10 L0 10 Z' : 'M0 0 L10 0 L5 10 Z'} fill={col} /></svg>
      {up ? '+' : '−'}{Math.abs(value).toFixed(1)}%
    </div>
  );
};

// 强调：一道高光从左扫过（单次）
export const Mark = ({children, delay = 0}) => {
  const f = useCurrentFrame();
  const x = interpolate(f - delay, [0, 18], [-60, 160], cl);
  return (
    <div style={{position: 'relative', display: 'inline-block', overflow: 'hidden', borderRadius: 999}}>
      {children}
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${x}%`, width: '40%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.5), transparent)', pointerEvents: 'none'}} />
    </div>
  );
};

export const Stamp = ({children, delay = 0}) => (
  <Enter delay={delay}>
    <div style={{...glassStyle(28), padding: '18px 40px', fontFamily: F.title, fontSize: 64, color: C.ink, boxShadow: `${glassStyle().boxShadow}, 0 0 60px rgba(249,243,57,0.25)`, borderColor: 'rgba(249,243,57,0.7)'}}>
      <span style={{color: C.yellow}}>✦</span> {children}
    </div>
  </Enter>
);

export const Panel = ({children, w = 440, logo, title}) => (
  <div style={{...glassStyle(36), width: w, padding: '28px 30px 34px'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22}}>
      {logo ? <Img src={staticFile(logo)} style={{width: 52, height: 52, borderRadius: 14}} /> : null}
      <span style={{fontFamily: F.title, fontSize: 38, color: C.ink}}>{title}</span>
    </div>
    {children}
  </div>
);

// 人物：抠图 + 背后一块玻璃圆角板 + 底部反光
export const Photo = ({src, caption, w = 600, h = 760, style}) => (
  <div style={{width: w, height: h, position: 'relative', ...style}}>
    <div style={{...glassStyle(48), position: 'absolute', left: w * 0.08, right: 0, top: h * 0.16, bottom: 0}} />
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'}} />
    {caption ? <div style={{...glassStyle(999), position: 'absolute', right: 24, bottom: 28, padding: '8px 20px', fontFamily: F.body, fontSize: 24, color: C.ink}}>{caption}</div> : null}
  </div>
);

// 封面日期：玻璃小方块日历
export const DateMark = ({text = '10·08'}) => {
  const [m, d] = text.split('·');
  return (
    <div style={{...glassStyle(26), width: 132, height: 132, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: F.body, fontSize: 22, color: C.dim, letterSpacing: 2}}>{m} 月</div>
      <div style={{fontFamily: F.num, fontSize: 70, lineHeight: 1, color: C.ink}}>{d}</div>
    </div>
  );
};

export const ChapterMark = ({n = 1, title}) => (
  <div style={{...glassStyle(999), position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', padding: '10px 26px', fontFamily: F.body, fontSize: 26, color: C.ink, whiteSpace: 'nowrap'}}>
    <span style={{color: C.violet, fontFamily: F.num}}>{String(n).padStart(2, '0')}</span>  {title}
  </div>
);

// 大章节转场：一块全屏磨砂玻璃从右扫到左（前后各 10 帧）
export const Wipe = ({at, half = 10}) => {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  const t = f - (at - half);
  if (t < 0 || t > half * 2) return null;
  const x = interpolate(t, [0, half * 2], [width, -width * 1.1], {easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: -40, bottom: -40, left: x, width: width * 1.1, backdropFilter: 'blur(40px) saturate(1.8)', WebkitBackdropFilter: 'blur(40px) saturate(1.8)', background: 'linear-gradient(90deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.04))', borderLeft: '2px solid rgba(255,255,255,0.7)'}} />
    </AbsoluteFill>
  );
};

export const Disclaimer = ({text = '内容仅供信息参考 · 不构成投资建议'}) => (
  <div style={{position: 'absolute', top: 30, right: 34, fontFamily: F.body, fontSize: 22, color: C.ink, opacity: 0.4, zIndex: 99}}>{text}</div>
);
