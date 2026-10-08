// 皮肤「界面动效 UI-Motion」（2026-10-08，对标 Figma 动态广告拆解）
// 画面态 = 一支产品广告：按幕整块换底色（ColorFlood）、界面元素当道具（窗口 / 气泡 / 开关 / 光标 / 选框）、
// 贴纸式标签字（黑描边 + 微旋）、常驻小伙伴（BobbyBuddy）。入场 = 弹出（过冲 ≤1.08）+ 微旋；转场 = 斜向色块扫入。
// 适用：AI / 产品 / 工具教学 / "问错 vs 问对 Bobby"(F20) / 海外投放；Bobby AI 作为 AI 产品，这是最贴它身份的一套。
// 合规：所有"界面"都是抽象道具不是截图；国内只做信息查询类意象，不做交易界面；小红书版不用本皮肤的常驻 Buddy。
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {T, useFonts} from '../../motionkit/type.js';
import {ColorFlood} from '../../motionkit/acts.jsx';
import {SelectionBox, StickerPill} from '../../motionkit/uiprops.jsx';

export const C = {
  paper: '#F4F4F2', ink: '#111111', grey: '#8A8A90',
  purple: '#6F00FF', violet: '#A050FF', yellow: '#F9F339',
  orange: '#FF5A1F', green: '#0ACF83', blue: '#1ABCFE',   // 幕底色候选（每幕一色，不混）
  white: '#FFFFFF', up: '#0B8043', down: '#E5383B',
};
export const F = {title: T.shuhei, body: T.puhui, num: T.harmony, pill: T.shuhei};
export const SKIN = {
  id: 'uimotion', name: '界面动效', dark: false,
  line: 'AI / 产品 / 工具教学 / F20 问错问对 / 海外投放',
  pair: '数黑体 + 普惠体 + HarmonyOS Black（kit 自带）',
  motion: '按幕整块换底色（斜扫）· 界面道具（光标/开关/选框/气泡）· 贴纸标签弹出 · 常驻 BobbyBuddy',
};

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

// acts 由工程传入（每幕一色）；不传就一直米白
export const Backdrop = ({acts, width = 1080, height = 1440}) => {
  useFonts(['shuhei', 'puhui', 'harmony']);
  return (
    <ColorFlood acts={acts || [{at: 0, color: C.paper}]} origin={[width / 2, height / 2]}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.6}} />
    </ColorFlood>
  );
};

export const Enter = ({delay = 0, still, children, style}) => {
  const f = useCurrentFrame();
  if (still) return <div style={{display: 'inline-block', ...style}}>{children}</div>;
  const p = interpolate(f - delay, [0, 14], [0, 1], {...cl, easing: Easing.out(Easing.back(1.2))});
  if (f - delay < 0) return null;
  return <div style={{display: 'inline-block', transform: `scale(${Math.min(1.08, p)}) rotate(${(1 - Math.min(1, p)) * -3}deg)`, opacity: Math.min(1, p * 2), ...style}}>{children}</div>;
};

// 标题：普通词黑字，accent 词是紫色贴纸 pill
export const Headline = ({children, accent, size = 108, still, delay = 0, color = C.ink}) => {
  const lines = String(children).split('\n');
  return (
    <div style={{fontFamily: F.title, fontSize: size, lineHeight: 1.22, color, letterSpacing: '-0.01em'}}>
      {lines.map((l, i) => (
        <div key={i} style={{whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.18em'}}>
          {accent && l.includes(accent) ? (<>
            <Enter still={still} delay={delay + i * 5}><span>{l.split(accent)[0]}</span></Enter>
            {still ? <span style={{display: 'inline-block', background: C.purple, color: '#fff', padding: '0.1em 0.42em', borderRadius: 999, border: `3px solid ${C.ink}`, boxShadow: `4px 5px 0 ${C.ink}`, transform: 'rotate(-2deg)'}}>{accent}</span>
                   : <StickerPill at={delay + i * 5 + 6} bg={C.purple} ink="#fff" size={size * 0.92} font={F.pill}>{accent}</StickerPill>}
            <Enter still={still} delay={delay + i * 5 + 2}><span>{l.split(accent)[1]}</span></Enter>
          </>) : <Enter still={still} delay={delay + i * 5}><span>{l}</span></Enter>}
        </div>
      ))}
    </div>
  );
};

export const Hero = ({value, prefix = '', suffix = '', decimals = 0, size = 170, delay = 0, dur = 28, color, still}) => {
  const f = useCurrentFrame();
  const p = still ? 1 : interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: EXPO});
  const col = color === 'down' ? C.down : color === 'up' ? C.up : color || C.ink;
  return (
    <div style={{display: 'inline-block', position: 'relative'}}>
      <div style={{fontFamily: F.num, fontSize: size, lineHeight: 0.95, color: col, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', position: 'relative', zIndex: 1}}>
        {prefix}{value < 0 ? '−' : ''}{Math.abs(value * p).toFixed(decimals)}<span style={{fontFamily: F.title, fontSize: size * 0.36, marginLeft: 8}}>{suffix}</span>
      </div>
      <div style={{position: 'absolute', left: -6, right: -6, bottom: -4, height: size * 0.22, background: C.yellow, borderRadius: 8, transform: `scaleX(${p})`, transformOrigin: 'left'}} />
    </div>
  );
};

export const Label = ({children, bg = C.ink, ink = '#fff'}) => (
  <StickerPill at={0} bg={bg} ink={ink} size={30} rot={-1.5} font={F.body}>{children}</StickerPill>
);

export const Delta = ({value, size = 60}) => {
  const up = value >= 0;
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: F.num, fontSize: size, color: up ? C.up : C.down, background: '#fff', border: `3px solid ${C.ink}`, borderRadius: 16, padding: '4px 22px', boxShadow: `4px 5px 0 ${C.ink}`}}>
      {up ? '↑' : '↓'} {up ? '+' : '−'}{Math.abs(value).toFixed(1)}%
    </div>
  );
};

// 强调：设计软件式选框把元素"选中"
export const Mark = ({children, delay = 0, label}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, 10], [0, 1], {...cl, easing: EXPO});
  return (
    <div style={{position: 'relative', display: 'inline-block', padding: '14px 20px'}}>
      {children}
      <div style={{position: 'absolute', inset: 0, border: `2px solid ${C.blue}`, opacity: p}} />
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: `calc(${x * 100}% - 7px)`, top: `calc(${y * 100}% - 7px)`, width: 12, height: 12, background: '#fff', border: `2px solid ${C.blue}`, transform: `scale(${p})`}} />)}
      {label ? <div style={{position: 'absolute', left: '50%', bottom: -34, transform: `translateX(-50%) scale(${p})`, background: C.blue, color: '#fff', fontFamily: F.body, fontSize: 18, padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap'}}>{label}</div> : null}
    </div>
  );
};

export const Stamp = ({children, delay = 0}) => (
  <StickerPill at={delay} bg={C.yellow} ink={C.ink} size={66} rot={-3} font={F.title}>{children}</StickerPill>
);

// 窗口面板：macOS 三点标题栏 + 名称
export const Panel = ({children, w = 440, logo, title}) => (
  <div style={{width: w, background: '#fff', border: `3px solid ${C.ink}`, borderRadius: 22, boxShadow: `6px 8px 0 ${C.ink}`, overflow: 'hidden'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `3px solid ${C.ink}`, background: C.paper}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{width: 14, height: 14, borderRadius: 7, background: c, border: `1.5px solid ${C.ink}`}} />)}
      {logo ? <Img src={staticFile(logo)} style={{width: 34, height: 34, borderRadius: 9, marginLeft: 8}} /> : null}
      <span style={{fontFamily: F.body, fontSize: 28, color: C.ink, marginLeft: logo ? 4 : 10, fontWeight: 600}}>{title}</span>
    </div>
    <div style={{padding: '24px 22px 28px'}}>{children}</div>
  </div>
);

// 人物：放进一个"窗口"里，右上贴一枚选框标签
export const Photo = ({src, caption, w = 600, h = 760, style}) => (
  <div style={{width: w, height: h, position: 'relative', ...style}}>
    <div style={{position: 'absolute', left: w * 0.06, right: 0, top: h * 0.14, bottom: 0, background: '#fff', border: `3px solid ${C.ink}`, borderRadius: 26, boxShadow: `8px 10px 0 ${C.ink}`}} />
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom'}} />
    {caption ? <div style={{position: 'absolute', left: 0, bottom: 20, background: C.ink, color: '#fff', fontFamily: F.body, fontSize: 24, padding: '6px 16px', borderRadius: 999}}>{caption}</div> : null}
  </div>
);

export const DateMark = ({text = '10·08'}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', border: `3px solid ${C.ink}`, borderRadius: 14, padding: '8px 18px', boxShadow: `4px 5px 0 ${C.ink}`}}>
    <span style={{width: 12, height: 12, borderRadius: 6, background: C.orange, border: `1.5px solid ${C.ink}`}} />
    <span style={{fontFamily: F.num, fontSize: 48, lineHeight: 1, color: C.ink, letterSpacing: '-0.02em'}}>{text}</span>
  </div>
);

export const ChapterMark = ({n = 1, title}) => (
  <div style={{position: 'absolute', top: 70, left: 64, fontFamily: F.body, fontSize: 26, color: C.ink, opacity: 0.75, letterSpacing: 2}}>
    {String(n).padStart(2, '0')} · {title}
  </div>
);

// 大章节转场：由 Backdrop 的 ColorFlood 承担（换底色就是转场）；这里只在切点加一道白色斜扫高光
export const Wipe = ({at, half = 10}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const t = f - (at - half);
  if (t < 0 || t > half * 2) return null;
  const p = interpolate(t, [0, half * 2], [0, 1], {easing: Easing.inOut(Easing.cubic)});
  return <div style={{position: 'absolute', left: -W, top: -H, width: W * 3, height: H * 3, background: 'linear-gradient(90deg, transparent 46%, rgba(255,255,255,0.75) 50%, transparent 54%)', transform: `translate(${-(W + H) * (1 - p) * 1.2 + W * 0.2}px, ${(W + H) * (1 - p) * 1.2 - H * 0.2}px) skewX(-18deg)`, transformOrigin: '0 0', pointerEvents: 'none'}} />;
};

export const Disclaimer = ({text = '内容仅供信息参考 · 不构成投资建议'}) => (
  <div style={{position: 'absolute', top: 30, right: 34, fontFamily: F.body, fontSize: 22, color: C.ink, opacity: 0.45, zIndex: 99}}>{text}</div>
);

export {SelectionBox};
