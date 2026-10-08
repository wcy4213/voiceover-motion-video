// motionkit/mg.jsx — MG（Motion Graphics）动画层（2026-10-08 video-agent 融合时新增）
// 经典 MG 手法的 Remotion 实现，全部只依赖 useCurrentFrame（并行乱序渲染安全）：
//   Morph        图形变形：一个 SVG 路径平滑变成另一个（美元符→上涨箭头、饼→柱）
//   Burst        冲击放射线：数字落地/结论砸下的瞬间，一圈短线向外爆开
//   Ring         环形进度/占比：描边画出 + 中心数字 count-up
//   FlowLine     流动线：虚线沿路径行进 + 光点沿线跑（资金流向/传导链）
//   KineticWords 动态字：按口播逐词出现，每词一个动作（slam/rise/slide/scale），和字级时间戳对齐
//   LiquidReveal 液态遮罩揭示：一团有机形状长大露出下一个画面
//   LottieClip   播放 Lottie JSON（LottieFiles 免费动画，Lottie Simple License 可商用；文件放 public/lottie/）
import React, {useEffect, useState} from 'react';
import {Easing, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {evolvePath, getLength, getPointAtLength, interpolatePath} from '@remotion/paths';
import {Lottie} from '@remotion/lottie';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

// 常用图形路径（100×100 视窗）——可直接给 Morph 用
export const SHAPES = {
  circle: 'M50 10 C72 10 90 28 90 50 C90 72 72 90 50 90 C28 90 10 72 10 50 C10 28 28 10 50 10 Z',
  square: 'M14 14 L86 14 L86 86 L14 86 Z',
  up: 'M50 12 L88 58 L64 58 L64 88 L36 88 L36 58 L12 58 Z',
  down: 'M50 88 L88 42 L64 42 L64 12 L36 12 L36 42 L12 42 Z',
  diamond: 'M50 8 L92 50 L50 92 L8 50 Z',
  bolt: 'M58 6 L18 56 L46 56 L38 94 L82 40 L54 40 Z',
};

/** <Morph from="circle" to="up" at={30} dur={18} size={220} fill="#6F00FF" /> —— from/to 可传 SHAPES 键或任意 d */
export const Morph = ({from = 'circle', to = 'up', at = 0, dur = 18, size = 200, fill = '#6F00FF', stroke, strokeWidth = 0, style}) => {
  const f = useCurrentFrame();
  const a = SHAPES[from] || from;
  const b = SHAPES[to] || to;
  const p = interpolate(f - at, [0, dur], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const d = p <= 0 ? a : p >= 1 ? b : interpolatePath(p, a, b);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{overflow: 'visible', ...style}}>
      <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
};

/** <Burst at={42} rays={14} radius={180} color="#F9F339" /> —— 放在被强调元素的中心（absolute 定位外层） */
export const Burst = ({at = 0, rays = 12, radius = 160, length = 46, width = 6, color = '#F9F339', dur = 16, style}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > dur) return null;
  const p = interpolate(t, [0, dur], [0, 1], {easing: Easing.out(Easing.cubic)});
  const r0 = radius * (0.55 + 0.45 * p);
  const len = length * (1 - p);
  const s = radius * 2 + length * 2;
  return (
    <svg width={s} height={s} viewBox={`${-s / 2} ${-s / 2} ${s} ${s}`} style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', overflow: 'visible', ...style}}>
      {Array.from({length: rays}).map((_, i) => {
        const ang = (i / rays) * Math.PI * 2;
        const x1 = Math.cos(ang) * r0, y1 = Math.sin(ang) * r0;
        const x2 = Math.cos(ang) * (r0 + len), y2 = Math.sin(ang) * (r0 + len);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** <Ring value={73} delay={6} size={360} label="老股东在卖" /> —— value 0–100 */
export const Ring = ({value = 50, delay = 0, dur = 36, size = 320, thickness = 34, color = '#6F00FF', track = 'rgba(255,255,255,0.12)', textColor = '#fff',
  font = '"MK Alimama ShuHei", -apple-system, sans-serif', suffix = '%', label, labelFont = '"MK PuHuiTi 3", "PingFang SC", sans-serif'}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, dur], [0, 1], {...cl, easing: EXPO});
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={thickness} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - (value / 100) * p)} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: textColor}}>
        <div style={{fontFamily: font, fontSize: size * 0.26, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{Math.round(value * p)}<span style={{fontSize: size * 0.12}}>{suffix}</span></div>
        {label ? <div style={{fontFamily: labelFont, fontSize: size * 0.085, opacity: 0.8, marginTop: size * 0.03}}>{label}</div> : null}
      </div>
    </div>
  );
};

/** <FlowLine d="M80 600 C 400 200, 700 900, 1000 400" delay={0} dur={40} width={1080} height={1440} />
 *  线先"画出来"，然后虚线持续流动 + 光点沿线循环跑（资金/传导方向一目了然）*/
export const FlowLine = ({d, delay = 0, dur = 36, width = 1080, height = 1440, color = '#A050FF', dot = '#F9F339', strokeWidth = 6, dash = 18, speed = 2.2, dots = 2, style}) => {
  const f = useCurrentFrame();
  const t = f - delay;
  if (t < 0) return null;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const {strokeDasharray, strokeDashoffset} = evolvePath(p, d);
  const L = getLength(d);
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', ...style}}>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.28} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      {p >= 1 ? <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${dash} ${dash}`} strokeDashoffset={-(t - dur) * speed * 4} strokeLinecap="round" /> : null}
      {Array.from({length: dots}).map((_, i) => {
        const prog = p < 1 ? p : (((t - dur) * speed * 4) / L + i / dots) % 1;
        if (p < 1 && i > 0) return null;
        const pt = getPointAtLength(d, prog * L);
        return <circle key={i} cx={pt.x} cy={pt.y} r={strokeWidth * 1.6} fill={dot} />;
      })}
    </svg>
  );
};

/**
 * <KineticWords words={[{t:'降息', at:12, fx:'slam'}, {t:'25bp', at:20, fx:'rise', color:'#F9F339'}]} size={120} />
 * at = 帧号（来自 align_tokens.py 的 token 时间戳 × 30），一词一动作；fx: slam | rise | slide | scale | blur
 * 中文按"词"给，不按字给（逐字蹦是打字机味，art-direction §2）
 */
export const KineticWords = ({words = [], size = 110, color = '#fff', font = '"MK Alimama ShuHei", "PingFang SC", sans-serif', gap = 0.18, align = 'center', lineBreakAfter = [], style}) => {
  const f = useCurrentFrame();
  const fx = (w) => {
    const t = f - w.at;
    if (t < 0) return {opacity: 0};
    const p = interpolate(t, [0, 10], [0, 1], {...cl, easing: EXPO});
    switch (w.fx) {
      case 'slam': return {transform: `scale(${1.6 - 0.6 * p})`, opacity: Math.min(1, t / 3), filter: t < 4 ? `blur(${(4 - t) * 1.5}px)` : undefined};
      case 'slide': return {transform: `translateX(${(1 - p) * 80}px)`, opacity: p};
      case 'scale': return {transform: `scale(${0.4 + 0.6 * p})`, opacity: p};
      case 'blur': return {filter: `blur(${(1 - p) * 10}px)`, opacity: p};
      default: return {transform: `translateY(${(1 - p) * 0.5}em)`, opacity: p, filter: t < 6 ? `blur(${(6 - t) * 0.8}px)` : undefined}; // rise
    }
  };
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'left' ? 'flex-start' : 'center', alignItems: 'baseline', columnGap: `${gap}em`, rowGap: `${gap * 0.6}em`, fontFamily: font, fontSize: size, lineHeight: 1.1, color, ...style}}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span style={{display: 'inline-block', whiteSpace: 'nowrap', color: w.color || color, ...fx(w)}}>{w.t}</span>
          {lineBreakAfter.includes(i) ? <span style={{flexBasis: '100%', height: 0}} /> : null}
        </React.Fragment>
      ))}
    </div>
  );
};

/** <LiquidReveal at={60} dur={22} cx={540} cy={720}>下一个画面</LiquidReveal> —— 有机液态形状从一点长满全屏，露出 children */
export const LiquidReveal = ({at = 0, dur = 22, cx = 540, cy = 720, width = 1080, height = 1440, children, seed = 3}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0) return null;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: Easing.bezier(0.65, 0, 0.35, 1)});
  const R = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy)) * 1.15 * p;
  const n = 10;
  const pts = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const wob = 1 + 0.16 * Math.sin(a * 3 + seed + t * 0.25) * (1 - p * 0.7);
    return [cx + Math.cos(a) * R * wob, cy + Math.sin(a) * R * wob];
  });
  // Catmull-Rom → 三次贝塞尔，闭合平滑
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  const id = `liq-${seed}-${at}`;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs><clipPath id={id} clipPathUnits="userSpaceOnUse"><path d={d} /></clipPath></defs>
      </svg>
      <div style={{position: 'absolute', inset: 0, clipPath: `url(#${id})`}}>{children}</div>
    </div>
  );
};

/** <LottieClip src="lottie/rocket.json" style={{width: 400}} /> —— JSON 放 public/lottie/；LottieFiles 免费动画（Lottie Simple License）可商用，下载前看清单个动画的许可 */
export const LottieClip = ({src, loop = false, playbackRate = 1, style}) => {
  const [data, setData] = useState(null);
  const [handle] = useState(() => delayRender(`lottie ${src}`));
  useEffect(() => {
    fetch(staticFile(src)).then((r) => r.json()).then((j) => { setData(j); continueRender(handle); })
      .catch((e) => { console.error('[LottieClip]', e); continueRender(handle); });
  }, [src, handle]);
  if (!data) return null;
  return <Lottie animationData={data} loop={loop} playbackRate={playbackRate} style={style} />;
};
