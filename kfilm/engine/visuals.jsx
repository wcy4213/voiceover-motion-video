// kfilm/engine/visuals.jsx — 知识短片的画面词汇（每种都只依赖 useCurrentFrame；frame 0 可完整）
// type: title | big | doc | list | line | curve | bars | plane | cards | sim | grid | ref | quote | steps | poster | compare | coin
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {C, F, Enter, Hero, Label, Stamp, Panel, Mark} from '../../skins/museum/kit.jsx';
import {Burst} from '../../motionkit/mg.jsx';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const P = (f, d = 0, dur = 24) => interpolate(f - d, [0, dur], [0, 1], {...cl, easing: EXPO});
// defaultProps 会被 JSON 序列化：storyboard 里不能放函数 → 函数一律用字符串键在这里查表
const FN = {
  xlnx: (x) => (x <= 0 ? 0 : -x * Math.log(x)),            // 37% 法则：P(x) = −x·ln x
  pow1: (x) => 1 - Math.pow(0.99, x * 500),                 // 重复伯努利：至少成功一次
  linear: (x) => x,
};
const FMT = {
  int: (v) => Math.round(v).toLocaleString(),
  pct: (v) => `${v.toFixed(0)}%`,
  pct1: (v) => `${v.toFixed(1)}%`,
  rate: (v) => `${v.toFixed(1)}%`,
  wan: (v) => (v >= 10000 ? `${(v / 10000).toFixed(1)}万` : Math.round(v).toLocaleString()),
};

// 片名卡：细金线 + 大标题 + 副题 + 出品
export const TitleCard = ({title, sub, by = 'Bobby AI 出品', still, L}) => {
  const f = useCurrentFrame();
  const p = still ? 1 : P(f, 0, 20);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 22}}>
      <div style={{width: L.vw * 0.42 * p, height: 1, background: C.gold}} />
      <div style={{fontFamily: F.title, fontSize: L.big, color: C.ink, letterSpacing: '0.18em', opacity: p}}>《{title}》</div>
      {sub ? <div style={{fontFamily: F.title, fontSize: L.mid * 0.7, color: C.goldBright, letterSpacing: '0.2em', opacity: P(f, 8, 20)}}>{sub}</div> : null}
      <div style={{width: L.vw * 0.42 * p, height: 1, background: C.gold}} />
      <div style={{fontFamily: F.mono, fontSize: L.sm * 0.8, color: C.dim, letterSpacing: '0.3em', marginTop: 10, opacity: P(f, 14, 20)}}>{by}</div>
    </AbsoluteFill>
  );
};

// 巨数字 + 一行说明
export const Big = ({value, prefix, suffix, decimals, label, color, delay = 0, still, L, burst}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 18}}>
      <div style={{position: 'relative'}}>
        <Hero value={value} prefix={prefix} suffix={suffix} decimals={decimals} size={L.huge} delay={delay} color={color} still={still} />
        {burst ? <Burst at={delay + 30} radius={L.huge * 1.1} color={C.goldBright} rays={16} /> : null}
      </div>
      {label ? <Enter delay={delay + 24} still={still}><div style={{fontFamily: F.title, fontSize: L.mid, color: C.ink, letterSpacing: '0.1em'}}>{label}</div></Enter> : null}
    </AbsoluteFill>
  );
};

// 纸质文件卡：heading + 行（逐行出现）
export const Doc = ({heading, lines = [], w, rot, delay = 0, L, still}) => {
  const f = useCurrentFrame();
  const p = still ? 1 : P(f, delay, 22);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `perspective(1400px) rotateY(${(1 - p) * -40}deg) translateY(${(1 - p) * 40}px)`, opacity: p}}>
        <Panel w={w || L.vw * 0.56} title={heading} rot={rot ?? -1.2}>
          {lines.map((ln, i) => {
            const lp = still ? 1 : P(f, delay + 10 + i * 8, 12);
            const big = typeof ln === 'object' && ln.big;
            const txt = typeof ln === 'object' ? ln.t : ln;
            return <div key={i} style={{fontFamily: big ? F.num : F.title, fontSize: big ? L.big * 0.95 : L.mid * 0.85, color: big ? C.red : C.paperInk, lineHeight: 1.7, opacity: lp, transform: `translateX(${(1 - lp) * 14}px)`, borderBottom: i < lines.length - 1 ? '1px solid rgba(43,36,27,0.12)' : 'none'}}>{txt}</div>;
          })}
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

// ✓ 清单
export const List = ({items = [], delay = 0, mark = '✓', L, still}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: L.sm * 0.9}}>
        {items.map((it, i) => {
          const p = still ? 1 : P(f, delay + i * 14, 14);
          return <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 22, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
            <span style={{fontFamily: F.num, fontSize: L.mid, color: C.goldBright}}>{mark}</span>
            <span style={{fontFamily: F.title, fontSize: L.mid, color: C.ink, letterSpacing: '0.06em'}}>{it}</span>
          </div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// 折线：points [{x,y,label?}]，按时间逐段画出；annot [{i, text}] 在点上标注
export const LineChart = ({points = [], annot = [], delay = 0, dur = 60, yFmt = 'int', color, L, still, step = false, xLabels}) => {
  const f = useCurrentFrame();
  const fmtY = FMT[yFmt] || FMT.int;
  const W = L.vw * (L.portrait ? 0.96 : 0.78), H = L.vh * 0.52, pad = 70;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(0, ...ys), y1 = Math.max(...ys) * 1.08;
  const X = (x) => pad + ((x - x0) / ((x1 - x0) || 1)) * (W - pad * 2);
  const Y = (y) => H - pad + (1 - (y - y0) / ((y1 - y0) || 1)) * -(H - pad * 2) * -1 * -1;
  const Yc = (y) => (H - pad) - ((y - y0) / ((y1 - y0) || 1)) * (H - pad * 2);
  const prog = still ? 1 : P(f, delay, dur);
  const nSeg = points.length - 1;
  const d = points.map((p, i) => {
    if (i === 0) return `M${X(p.x)} ${Yc(p.y)}`;
    return step ? `L${X(p.x)} ${Yc(points[i - 1].y)} L${X(p.x)} ${Yc(p.y)}` : `L${X(p.x)} ${Yc(p.y)}`;
  }).join(' ');
  const col = color || C.goldBright;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <svg width={W} height={H} style={{overflow: 'visible'}}>
        {[0.25, 0.5, 0.75, 1].map((k) => <line key={k} x1={pad} x2={W - pad} y1={Yc(y0 + (y1 - y0) * k)} y2={Yc(y0 + (y1 - y0) * k)} stroke="rgba(201,162,74,0.14)" />)}
        <line x1={pad} x2={W - pad} y1={Yc(y0)} y2={Yc(y0)} stroke={C.gold} strokeOpacity={0.5} />
        <path d={d} fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - prog} style={{filter: `drop-shadow(0 0 10px ${col}88)`}} />
        {points.map((p, i) => {
          const show = prog >= (i / nSeg) - 0.001;
          if (!show) return null;
          const a = annot.find((q) => q.i === i);
          return <g key={i}>
            {(a || p.label) ? <circle cx={X(p.x)} cy={Yc(p.y)} r={7} fill={a ? C.red : col} /> : null}
            {a ? <text x={X(p.x) + (a.dx ?? 14)} y={Yc(p.y) + (a.dy ?? -16)} fontFamily={F.title} fontSize={L.sm} fill={C.ink}>{a.text}</text> : null}
            {(xLabels ? true : p.label) ? <text x={X(p.x)} y={H - pad + 34} textAnchor="middle" fontFamily={F.num} fontSize={L.sm * 0.8} fill={C.dim}>{p.label ?? p.x}</text> : null}
          </g>;
        })}
        {[0.5, 1].map((k) => <text key={k} x={pad - 14} y={Yc(y0 + (y1 - y0) * k) + 8} textAnchor="end" fontFamily={F.num} fontSize={L.sm * 0.8} fill={C.dim}>{fmtY(y0 + (y1 - y0) * k)}</text>)}
      </svg>
    </AbsoluteFill>
  );
};

// 函数曲线 fn(x) on [0,1]，峰值标注
export const Curve = ({fn: fnKey = 'xlnx', peakX, peakText, delay = 0, dur = 50, xText, L, still}) => {
  const f = useCurrentFrame();
  const fn = FN[fnKey] || FN.linear;
  const W = L.vw * (L.portrait ? 0.96 : 0.7), H = L.vh * 0.5, pad = 60;
  const N = 120;
  const pts = Array.from({length: N + 1}, (_, i) => { const x = i / N; return [x, fn(x)]; });
  const ymax = Math.max(...pts.map((p) => p[1])) * 1.1;
  const X = (x) => pad + x * (W - pad * 2), Y = (y) => H - pad - (y / ymax) * (H - pad * 2);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p[0])} ${Y(p[1])}`).join(' ');
  const prog = still ? 1 : P(f, delay, dur);
  const peakP = still ? 1 : P(f, delay + dur, 14);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <svg width={W} height={H} style={{overflow: 'visible'}}>
        <line x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} stroke={C.gold} strokeOpacity={0.5} />
        <line x1={pad} x2={pad} y1={pad} y2={H - pad} stroke={C.gold} strokeOpacity={0.5} />
        <path d={d} fill="none" stroke={C.goldBright} strokeWidth={4} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - prog} style={{filter: `drop-shadow(0 0 10px rgba(201,162,74,0.5))`}} />
        {peakX != null ? <g opacity={peakP}>
          <line x1={X(peakX)} x2={X(peakX)} y1={Y(fn(peakX))} y2={H - pad} stroke={C.red} strokeDasharray="6 6" />
          <circle cx={X(peakX)} cy={Y(fn(peakX))} r={9} fill={C.red} />
          <text x={X(peakX) + 16} y={Y(fn(peakX)) - 18} fontFamily={F.num} fontSize={L.mid} fill={C.ink}>{peakText}</text>
        </g> : null}
        {xText ? <text x={W - pad} y={H - pad + 36} textAnchor="end" fontFamily={F.title} fontSize={L.sm * 0.8} fill={C.dim}>{xText}</text> : null}
      </svg>
    </AbsoluteFill>
  );
};

// 柱状对比 bars [{label, value, color?}]
export const Bars = ({bars = [], delay = 0, fmt = 'int', L, still, maxV}) => {
  const f = useCurrentFrame();
  const fmtV = FMT[fmt] || FMT.int;
  const mx = maxV || Math.max(...bars.map((b) => b.value));
  const H = L.vh * 0.46, bw = Math.min(200, (L.vw * 0.7) / bars.length - 40);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 40, height: H + 80}}>
        {bars.map((b, i) => {
          const p = still ? 1 : P(f, delay + i * 10, 30);
          const h = (b.value / mx) * H * p;
          return <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            <div style={{fontFamily: F.num, fontSize: L.mid, color: C.ink, opacity: p}}>{fmtV(b.value * p)}</div>
            <div style={{width: bw, height: h, background: b.color || C.goldBright, boxShadow: `0 0 24px ${(b.color || C.gold)}55`}} />
            <div style={{fontFamily: F.title, fontSize: L.sm, color: C.dim, letterSpacing: '0.08em', whiteSpace: 'nowrap'}}>{b.label}</div>
          </div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// 瓦尔德飞机弹孔图：机身轮廓 + 弹孔点（翼尖/机尾密，发动机/驾驶舱空），可高亮"空白区"
export const Plane = ({delay = 0, holes = 90, highlightEmpty = false, L, still, seed = 'wald'}) => {
  const f = useCurrentFrame();
  const W = L.vw * 0.62, H = W * 0.62;
  const p = still ? 1 : P(f, delay, 20);
  const dots = Array.from({length: holes}, (_, i) => {
    // 只落在机翼与机尾区域（归一化坐标）
    const zone = random(`${seed}z${i}`);
    let x, y;
    if (zone < 0.55) { x = 0.15 + random(`${seed}x${i}`) * 0.7; y = 0.42 + (random(`${seed}y${i}`) - 0.5) * 0.08 + (x < 0.45 || x > 0.55 ? (random(`${seed}w${i}`) - 0.5) * 0.3 : 0); }
    else if (zone < 0.85) { x = 0.72 + random(`${seed}x${i}`) * 0.2; y = 0.3 + random(`${seed}y${i}`) * 0.4; }
    else { x = 0.3 + random(`${seed}x${i}`) * 0.4; y = 0.45 + random(`${seed}y${i}`) * 0.12; }
    return [x, y];
  });
  const emptyP = highlightEmpty ? (still ? 1 : P(f, delay + 30, 20)) : 0;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <svg width={W} height={H} viewBox="0 0 100 62" style={{overflow: 'visible', opacity: p}}>
        {/* 机身 */}
        <path d="M6 31 C10 26, 20 25, 32 26 L70 26 C84 26, 92 28, 96 31 C92 34, 84 36, 70 36 L32 36 C20 37, 10 36, 6 31 Z" fill="none" stroke={C.gold} strokeWidth="0.8" />
        {/* 机翼 */}
        <path d="M36 27 L22 6 L30 6 L50 27 Z M36 35 L22 56 L30 56 L50 35 Z" fill="none" stroke={C.gold} strokeWidth="0.8" />
        {/* 尾翼 */}
        <path d="M80 27 L76 16 L82 16 L88 27 Z M80 35 L76 46 L82 46 L88 35 Z" fill="none" stroke={C.gold} strokeWidth="0.8" />
        {/* 驾驶舱/发动机（空白区） */}
        <ellipse cx="14" cy="31" rx="6" ry="3.5" fill={C.red} fillOpacity={0.35 * emptyP} stroke={C.red} strokeOpacity={emptyP} strokeWidth="0.6" />
        <rect x="38" y="20" width="10" height="4" fill={C.red} fillOpacity={0.35 * emptyP} stroke={C.red} strokeOpacity={emptyP} strokeWidth="0.6" />
        <rect x="38" y="38" width="10" height="4" fill={C.red} fillOpacity={0.35 * emptyP} stroke={C.red} strokeOpacity={emptyP} strokeWidth="0.6" />
        {dots.map(([x, y], i) => {
          const dp = still ? 1 : P(f, delay + 8 + i * 0.6, 6);
          return <circle key={i} cx={x * 100} cy={y * 62} r={0.8 * dp} fill={C.ink} opacity={0.9} />;
        })}
        {highlightEmpty ? <text x="14" y="52" textAnchor="middle" fontFamily={F.title} fontSize="4" fill={C.red} opacity={emptyP}>没有弹孔的地方</text> : null}
      </svg>
    </AbsoluteFill>
  );
};

// 一排卡片：n 张，前 k 张翻成"✗ 看过"，第 pick 张高亮 —— 37% 法则/榜单
export const Cards = ({n = 10, look = 4, pick, labels, delay = 0, L, still, lostAfter}) => {
  const f = useCurrentFrame();
  const w = Math.min(156, (L.vw * (L.portrait ? 0.98 : 0.9)) / n - (L.portrait ? 6 : 12)), h = w * 1.4;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: 12}}>
        {Array.from({length: n}, (_, i) => {
          const inP = still ? 1 : P(f, delay + i * 3, 10);
          const looked = i < look ? (still ? 1 : P(f, delay + 30 + i * 6, 8)) : 0;
          const isPick = pick === i ? (still ? 1 : P(f, delay + 30 + look * 6 + 10, 12)) : 0;
          const lost = lostAfter != null && i >= lostAfter ? (still ? 1 : P(f, delay + 30 + i * 4, 10)) : 0;
          return <div key={i} style={{width: w, height: h, border: `1px solid ${isPick ? C.goldBright : C.gold}`, background: isPick ? `rgba(232,199,107,${0.25 * isPick})` : 'rgba(239,230,210,0.06)', opacity: inP * (1 - lost * 0.75), transform: `translateY(${(1 - inP) * 30}px) scale(${1 + isPick * 0.08})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: isPick ? `0 0 30px rgba(232,199,107,${0.5 * isPick})` : 'none'}}>
            <span style={{fontFamily: F.num, fontSize: w * 0.3, color: looked ? C.dim : C.ink}}>{labels ? labels[i] : `No.${i + 1}`}</span>
            {looked ? <span style={{fontFamily: F.title, fontSize: w * 0.2, color: C.red, opacity: looked}}>看过</span> : null}
            {lost ? <span style={{fontFamily: F.title, fontSize: w * 0.18, color: C.red, opacity: lost}}>清盘</span> : null}
          </div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// 模拟计数器：大计数 + HUD 行（"第 N 次人生"）+ 一个比例读数
export const Sim = ({total = 1000000, delay = 0, dur = 90, readoutLabel, readoutFinal, readoutSuffix = '', readoutDecimals = 1, label, L, still}) => {
  const f = useCurrentFrame();
  const p = still ? 1 : P(f, delay, dur);
  const n = Math.round(total * p);
  const r = readoutFinal != null ? readoutFinal * Math.min(1, p * 1.05) : null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 14}}>
      <div style={{fontFamily: F.mono, fontSize: L.sm, color: C.dim, letterSpacing: '0.3em'}}>{label || 'SIMULATION'}</div>
      <div style={{fontFamily: F.num, fontSize: L.huge * 0.8, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{n.toLocaleString()}</div>
      {r != null ? <div style={{fontFamily: F.title, fontSize: L.mid, color: C.goldBright, letterSpacing: '0.1em'}}>{readoutLabel}<span style={{fontFamily: F.num, color: C.ink}}>{r.toFixed(readoutDecimals)}{readoutSuffix}</span></div> : null}
    </AbsoluteFill>
  );
};

// 文献卡
export const Refs = ({items = [], L, still}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: L.vw * 0.7}}>
        <div style={{fontFamily: F.mono, fontSize: L.sm * 0.8, color: C.goldBright, letterSpacing: '0.3em', marginBottom: 22, opacity: still ? 1 : P(f, 0, 12)}}>REFERENCES · 参考资料</div>
        {items.map((it, i) => <div key={i} style={{fontFamily: F.title, fontSize: L.sm * 0.95, color: C.ink, opacity: (still ? 1 : P(f, 8 + i * 8, 12)) * 0.85, lineHeight: 1.8, borderBottom: '1px solid rgba(201,162,74,0.18)'}}>{it}</div>)}
      </div>
    </AbsoluteFill>
  );
};

// 金句卡
export const Quote = ({text, sub, delay = 0, L, still}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 20}}>
    <Enter delay={delay} still={still}><div style={{fontFamily: F.title, fontSize: L.big * 0.8, color: C.ink, letterSpacing: '0.12em', textAlign: 'center', lineHeight: 1.5, whiteSpace: 'pre-wrap'}}>{text}</div></Enter>
    {sub ? <Enter delay={delay + 16} still={still}><div style={{fontFamily: F.title, fontSize: L.sm, color: C.goldBright, letterSpacing: '0.3em'}}>{sub}</div></Enter> : null}
  </AbsoluteFill>
);

// 时间节点横排 steps [{year, text}]，当前 idx 高亮
export const Steps = ({steps = [], active = 0, delay = 0, L, still}) => {
  const f = useCurrentFrame();
  const n = steps.length, W = L.vw * 0.84;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative', width: W, height: 220}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 96, height: 1, background: C.gold, opacity: 0.5}} />
        {steps.map((s, i) => {
          const x = (i / (n - 1)) * W;
          const p = still ? 1 : P(f, delay + i * 6, 10);
          const on = i === active;
          return <div key={i} style={{position: 'absolute', left: x, top: 0, transform: 'translateX(-50%)', textAlign: 'center', opacity: p}}>
            <div style={{fontFamily: F.num, fontSize: on ? L.big * 0.8 : L.mid * 0.8, color: on ? C.goldBright : C.dim, whiteSpace: 'nowrap'}}>{s.year}</div>
            <div style={{width: on ? 14 : 8, height: on ? 14 : 8, borderRadius: '50%', background: on ? C.goldBright : C.gold, margin: `${on ? 14 : 17}px auto`, boxShadow: on ? `0 0 20px ${C.goldBright}` : 'none'}} />
            <div style={{fontFamily: F.title, fontSize: L.sm, color: on ? C.ink : C.dim, whiteSpace: 'nowrap'}}>{s.text}</div>
          </div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// 对比两栏 compare [{title, lines}]
export const Compare = ({left, right, delay = 0, L, still}) => {
  const f = useCurrentFrame();
  const col = (c, i) => {
    const p = still ? 1 : P(f, delay + i * 12, 18);
    return <div key={i} style={{width: L.vw * (L.portrait ? 0.46 : 0.38), opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{fontFamily: F.title, fontSize: L.big * 0.75, color: c.color || C.goldBright, letterSpacing: '0.1em', borderBottom: `1px solid ${C.gold}`, paddingBottom: 12, marginBottom: 20}}>{c.title}</div>
      {c.lines.map((l, j) => <div key={j} style={{fontFamily: F.title, fontSize: L.mid * 0.95, color: C.ink, lineHeight: 1.9, opacity: still ? 1 : P(f, delay + i * 12 + 10 + j * 8, 10)}}>{l}</div>)}
    </div>;
  };
  return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><div style={{display: 'flex', gap: L.vw * (L.portrait ? 0.04 : 0.08)}}>{[left, right].map(col)}</div></AbsoluteFill>;
};

// 海报式首帧：大数字/大问句 + 副题 + 日期（frame 0 完整）。variant 换构图，三支同皮肤的片子首帧才"肉眼可辨不同"（cover_diff 10-09 实锤）
export const Poster = ({big, line1, line2, date, variant = 'center', bigColor, L}) => {
  const f = useCurrentFrame();
  const punch = interpolate(f, [0, 18], [1.06, 1], {...cl, easing: EXPO});
  const sweep = interpolate(f % 90, [20, 50], [-30, 130], cl);
  const col = bigColor || C.goldBright;
  const Sweep = () => <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${sweep - 10}%, rgba(255,240,200,0.18) ${sweep}%, transparent ${sweep + 10}%)`, pointerEvents: 'none'}} />;
  if (variant === 'left') {
    const pt = L.portrait;
    return (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: pt ? 'center' : 'stretch', transform: `scale(${punch})`}}>
        <div style={{position: 'relative', display: 'flex', flexDirection: pt ? 'column' : 'row', alignItems: pt ? 'flex-start' : 'center', gap: pt ? 26 : L.vw * 0.05, paddingLeft: pt ? 0 : L.vw * 0.08, width: pt ? L.vw * 0.86 : 'auto'}}>
          {big ? <div style={{fontFamily: F.num, fontSize: L.huge * 1.5, color: col, lineHeight: 0.9, textShadow: '0 0 60px rgba(201,162,74,0.35)'}}>{big}</div> : null}
          <div style={{width: pt ? L.vw * 0.5 : 2, height: pt ? 1 : L.huge * 1.1, background: C.gold, opacity: 0.7}} />
          <div>
            <div style={{fontFamily: F.title, fontSize: L.big * (pt ? 0.9 : 0.95), color: C.ink, letterSpacing: '0.1em', lineHeight: 1.35, whiteSpace: 'pre-wrap', maxWidth: pt ? L.vw * 0.86 : L.vw * 0.5}}>{line1}</div>
            {line2 ? <div style={{fontFamily: F.title, fontSize: L.mid * 0.9, color: C.dim, letterSpacing: '0.2em', marginTop: 16}}>{line2}</div> : null}
          </div>
          <Sweep />
        </div>
        {date ? <div style={{position: 'absolute', bottom: L.vh * 0.1, left: L.vw * 0.08, fontFamily: F.num, fontSize: L.mid, color: C.goldBright, letterSpacing: '0.2em', borderBottom: `1px solid ${C.gold}`}}>{date}</div> : null}
      </AbsoluteFill>
    );
  }
  if (variant === 'stack') {
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${punch})`}}>
        <div style={{position: 'relative', textAlign: 'center', border: `1px solid ${C.gold}`, padding: `${L.mid}px ${L.portrait ? L.mid : L.big}px`, maxWidth: L.vw * 0.92}}>
          <div style={{fontFamily: F.title, fontSize: L.big * (L.portrait ? 0.78 : 1), color: C.ink, letterSpacing: '0.12em', whiteSpace: L.portrait ? 'pre-wrap' : 'nowrap', lineHeight: 1.4}}>{line1}</div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 22}}>
            <div style={{width: L.vw * 0.08, height: 1, background: C.gold}} />
            {big ? <div style={{fontFamily: F.num, fontSize: L.huge * (L.portrait ? 0.62 : 0.8), color: C.red, lineHeight: 1, whiteSpace: 'nowrap'}}>{big}</div> : null}
            <div style={{width: L.vw * 0.08, height: 1, background: C.gold}} />
          </div>
          {line2 ? <div style={{fontFamily: F.title, fontSize: L.mid * 0.85, color: C.dim, letterSpacing: '0.25em', marginTop: 18}}>{line2}</div> : null}
          <Sweep />
        </div>
        {date ? <div style={{position: 'absolute', top: L.vh * 0.06, left: '50%', transform: 'translateX(-50%)', fontFamily: F.num, fontSize: L.mid * 0.9, color: C.goldBright, letterSpacing: '0.3em'}}>{date}</div> : null}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${punch})`}}>
      <div style={{position: 'relative', textAlign: 'center'}}>
        {big ? <div style={{fontFamily: F.num, fontSize: L.huge * 1.25, color: col, lineHeight: 0.95, textShadow: '0 0 60px rgba(201,162,74,0.35)'}}>{big}</div> : null}
        <div style={{fontFamily: F.title, fontSize: L.big * 0.9, color: C.ink, letterSpacing: '0.12em', marginTop: 18, whiteSpace: L.portrait ? 'pre-wrap' : 'nowrap', maxWidth: L.vw * 0.9, lineHeight: 1.35}}>{line1}</div>
        {line2 ? <div style={{fontFamily: F.title, fontSize: L.mid, color: C.dim, letterSpacing: '0.2em', marginTop: 14}}>{line2}</div> : null}
        <Sweep />
      </div>
      {date ? <div style={{position: 'absolute', top: L.vh * 0.08, right: L.vw * 0.06, fontFamily: F.num, fontSize: L.mid, color: C.goldBright, letterSpacing: '0.2em', borderBottom: `1px solid ${C.gold}`}}>{date}</div> : null}
    </AbsoluteFill>
  );
};

export const VISUALS = {title: TitleCard, big: Big, doc: Doc, list: List, line: LineChart, curve: Curve, bars: Bars, plane: Plane, cards: Cards, sim: Sim, ref: Refs, quote: Quote, steps: Steps, compare: Compare, poster: Poster, stamp: ({text, delay, L}) => <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><Stamp delay={delay}>{text}</Stamp></AbsoluteFill>, label: ({text, L}) => <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><Label>{text}</Label></AbsoluteFill>, mark: ({text, delay, L}) => <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><Mark delay={delay}><span style={{fontFamily: F.title, fontSize: L.big, color: C.ink}}>{text}</span></Mark></AbsoluteFill>};
