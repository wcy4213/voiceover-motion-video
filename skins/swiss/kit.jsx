// 皮肤「瑞士网格 Swiss」（2026-10-08 video-director 新增）
// 画面态 = 一张国际主义海报：暖白纸 + 显式 12 栏网格 + 粗黑分隔线 + 巨型无衬线字；
// 强调 = 品牌紫色块 / 紫色粗下划线；入场 = 文字从基线下方"升起"（遮罩滑出，expo out）；转场 = 竖条百叶。
// 适用：投教方法论 / 数据解读 / 对比类；浅底，与手账/白板/拆解台的"物件感"相反 —— 这里只有字和网格。
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {T, useFonts} from '../../motionkit/type.js';

export const C = {
  paper: '#F1EEE7',
  ink: '#111111',
  grey: '#8B877E',
  rule: 'rgba(17,17,17,0.08)',
  accent: '#6F00FF',     // 品牌紫做瑞士红的位置：唯一强调色
  yellow: '#F9F339',
  up: '#0B8043',
  down: '#C5221F',
};
export const F = {title: T.sourceH, body: T.puhui, num: T.harmony, latin: T.montB};

export const SKIN = {
  id: 'swiss', name: '瑞士网格', dark: false,
  line: '投教方法论 / 数据解读 / 对比（浅底）',
  pair: '思源黑体 Heavy + HarmonyOS Black 数字',
  motion: '遮罩升起（expo out）· 网格吸附 · 竖条百叶转场 · 紫色下划线擦出',
};

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const expo = Easing.bezier(0.16, 1, 0.3, 1);

export const Backdrop = ({width = 1080}) => {
  useFonts(['sourceH', 'puhui', 'harmony', 'montB']);
  const cols = 12, m = 64, colW = (width - m * 2) / cols;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      {Array.from({length: cols + 1}).map((_, i) => (
        <div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: m + i * colW, width: 1, background: C.rule}} />
      ))}
      <div style={{position: 'absolute', left: m, right: m, top: 40, height: 6, background: C.ink}} />
      <div style={{position: 'absolute', left: m, right: m, bottom: 40, height: 2, background: C.ink}} />
      {/* 纸张颗粒（静态） */}
      <AbsoluteFill style={{opacity: 0.35, backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '3px 3px'}} />
    </AbsoluteFill>
  );
};

// 签名入场：内容从基线下方升起（overflow 遮罩）
export const Enter = ({delay = 0, dur = 16, still, children, style}) => {
  const f = useCurrentFrame();
  const p = still ? 1 : interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: expo});
  return (
    <div style={{overflow: 'hidden', display: 'inline-block', paddingBottom: 6, ...style}}>
      <div style={{transform: `translateY(${(1 - p) * 110}%)`}}>{children}</div>
    </div>
  );
};

// 大标题：逐行升起；accent 关键词紫色
export const Headline = ({children, accent, size = 120, still, delay = 0}) => {
  const lines = String(children).split('\n');
  return (
    <div style={{fontFamily: F.title, fontSize: size, lineHeight: 1.02, color: C.ink, letterSpacing: '-0.035em'}}>
      {lines.map((l, i) => (
        <div key={i}>
          <Enter still={still} delay={delay + i * 5}>
            <span style={{whiteSpace: 'nowrap'}}>
              {accent && l.includes(accent) ? (<>{l.split(accent)[0]}<span style={{color: C.accent}}>{accent}</span>{l.split(accent)[1]}</>) : l}
            </span>
          </Enter>
        </div>
      ))}
    </div>
  );
};

export const Hero = ({value, prefix = '', suffix = '', decimals = 0, size = 170, delay = 0, dur = 30, color, still}) => {
  const f = useCurrentFrame();
  const p = still ? 1 : interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: expo});
  const v = Math.abs(value * p).toFixed(decimals);
  const col = color === 'down' ? C.down : color === 'up' ? C.up : color || C.ink;
  return (
    <div style={{fontFamily: F.num, fontSize: size, lineHeight: 0.86, color: col, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
      {prefix}{value < 0 ? '−' : ''}{v}<span style={{fontFamily: F.title, fontSize: size * 0.36, letterSpacing: 0, marginLeft: 10}}>{suffix}</span>
    </div>
  );
};

// 标签：黑底白字矩形，前置编号
export const Label = ({children, n}) => (
  <div style={{display: 'inline-flex', alignItems: 'stretch', fontFamily: F.body, fontSize: 28}}>
    {n != null ? <span style={{background: C.accent, color: '#fff', padding: '6px 12px', fontFamily: F.latin}}>{String(n).padStart(2, '0')}</span> : null}
    <span style={{background: C.ink, color: C.paper, padding: '6px 16px'}}>{children}</span>
  </div>
);

export const Delta = ({value, size = 70}) => {
  const up = value >= 0;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.num, fontSize: size, color: up ? C.up : C.down, letterSpacing: '-0.03em'}}>
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 10 10"><path d={up ? 'M5 0 L10 10 L0 10 Z' : 'M0 0 L10 0 L5 10 Z'} fill="currentColor" /></svg>
      {up ? '+' : '−'}{Math.abs(value).toFixed(1)}%
    </div>
  );
};

// 强调：紫色粗下划线从左擦出
export const Mark = ({children, delay = 0}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, 12], [0, 1], {...cl, easing: expo});
  return (
    <div style={{position: 'relative', display: 'inline-block', paddingBottom: 14}}>
      {children}
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 12, width: `${p * 100}%`, background: C.accent}} />
    </div>
  );
};

// 判词：实心圆点 + 粗字（瑞士海报的"红点"）
export const Stamp = ({children, delay = 0}) => {
  const f = useCurrentFrame();
  const s = interpolate(f - delay, [0, 14], [0, 1], {...cl, easing: Easing.out(Easing.back(1.6))});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <div style={{width: 96, height: 96, borderRadius: 48, background: C.accent, transform: `scale(${s})`}} />
      <div style={{fontFamily: F.title, fontSize: 76, letterSpacing: '-0.03em', color: C.ink}}>{children}</div>
    </div>
  );
};

// 版块：无卡片，顶部 8px 粗黑线 + logo + 名称
export const Panel = ({children, w = 440, logo, title}) => (
  <div style={{width: w}}>
    <div style={{height: 8, background: C.ink, marginBottom: 18}} />
    <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20}}>
      {logo ? <Img src={staticFile(logo)} style={{width: 46, height: 46, borderRadius: 10}} /> : null}
      <span style={{fontFamily: F.title, fontSize: 40, color: C.ink, letterSpacing: '-0.02em'}}>{title}</span>
    </div>
    {children}
  </div>
);

// 人物：高反差黑白 + 紫色实心圆背衬
export const Photo = ({src, caption, w = 600, h = 760, style}) => (
  <div style={{width: w, height: h, position: 'relative', ...style}}>
    <div style={{position: 'absolute', width: w * 0.86, height: w * 0.86, borderRadius: '50%', background: C.accent, right: -w * 0.12, top: h * 0.1}} />
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', filter: 'grayscale(1) contrast(1.35)'}} />
    {caption ? <div style={{position: 'absolute', left: 0, bottom: -4, fontFamily: F.body, fontSize: 24, background: C.ink, color: C.paper, padding: '5px 14px'}}>{caption}</div> : null}
  </div>
);

// 封面日期：巨型竖排日期贴网格左栏
export const DateMark = ({text = '10·08'}) => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: 14}}>
    <span style={{fontFamily: F.num, fontSize: 92, lineHeight: 0.8, letterSpacing: '-0.05em', color: C.ink}}>{text}</span>
    <span style={{fontFamily: F.latin, fontSize: 20, letterSpacing: 4, color: C.grey, paddingBottom: 6}}>2026 · ISSUE</span>
  </div>
);

export const ChapterMark = ({n = 1, title}) => (
  <div style={{position: 'absolute', top: 72, left: 64, display: 'flex', alignItems: 'baseline', gap: 16}}>
    <span style={{fontFamily: F.latin, fontSize: 44, color: C.accent}}>{String(n).padStart(2, '0')}</span>
    <span style={{fontFamily: F.title, fontSize: 30, color: C.ink}}>{title}</span>
  </div>
);

// 大章节转场：12 根竖条依次落下再收起（百叶）
export const Wipe = ({at, half = 10}) => {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  const t = f - (at - half);
  if (t < 0 || t > half * 2) return null;
  const n = 12, w = width / n;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const local = t - i * 0.6;
        const p = local <= half ? interpolate(local, [0, half], [0, 1], {...cl, easing: expo}) : interpolate(local, [half, half * 2], [1, 0], {...cl, easing: expo});
        return <div key={i} style={{position: 'absolute', left: i * w - 0.5, width: w + 1, top: 0, height: `${p * 100}%`, background: i % 4 === 1 ? C.accent : C.ink}} />;
      })}
    </AbsoluteFill>
  );
};

export const Disclaimer = ({text = '内容仅供信息参考 · 不构成投资建议'}) => (
  <div style={{position: 'absolute', top: 58, right: 64, fontFamily: F.body, fontSize: 22, color: C.ink, opacity: 0.4, zIndex: 99}}>{text}</div>
);
