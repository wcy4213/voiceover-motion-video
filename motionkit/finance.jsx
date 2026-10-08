// motionkit/finance.jsx — 金融原生画面组件（2026-10-08 video-director 重构）
// Candles：K 线逐根生长（技法移植自 vibe-motion/skills remotion-candlestick，改成 SVG + 本账号涨绿跌红）
// SplitFlap：机场翻牌式数字/文字（逐字符步进翻转，级联 ≤0.6s）—— hyperframes split-flap-board 思路
// 全部只依赖 useCurrentFrame。数据从 public/data/*.json 读进 timeline/props，不在渲染时联网。
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const UP = '#2ebd85';
const DOWN = '#f6465d';

/**
 * <Candles data={[{o,h,l,c,t?}, ...]} width={900} height={520} from={0} reveal={90}
 *          up="#2ebd85" down="#f6465d" grid="rgba(255,255,255,0.08)" lastTag />
 * 第 i 根在 i/(N-1)*reveal 帧开始，从最低价向上长出（22 帧），影线先于实体；最后一根带价格标签。
 */
export const Candles = ({data = [], width = 900, height = 520, from = 0, reveal = 90, up = UP, down = DOWN,
  grid = 'rgba(255,255,255,0.08)', label = 'rgba(255,255,255,0.55)', font = '-apple-system, sans-serif', lastTag = true, pad = 24}) => {
  const f = useCurrentFrame() - from;
  if (!data.length) return null;
  const lo = Math.min(...data.map((d) => d.l));
  const hi = Math.max(...data.map((d) => d.h));
  const Y = (v) => pad + (1 - (v - lo) / (hi - lo || 1)) * (height - pad * 2);
  const n = data.length;
  const slot = (width - pad * 2) / n;
  const bw = Math.max(2, Math.min(28, slot * 0.62));
  const lastIdx = Math.min(n - 1, Math.floor((f / reveal) * (n - 1)));
  return (
    <svg width={width} height={height} style={{overflow: 'visible'}}>
      {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={pad} x2={width - pad} y1={pad + k * (height - pad * 2)} y2={pad + k * (height - pad * 2)} stroke={grid} strokeWidth={1} />)}
      {data.map((d, i) => {
        const start = n === 1 ? 0 : (i / (n - 1)) * reveal;
        const p = interpolate(f - start, [0, 22], [0, 1], {...cl, easing: Easing.bezier(0.16, 1, 0.3, 1)});
        if (p <= 0) return null;
        const col = d.c >= d.o ? up : down;
        const x = pad + slot * i + slot / 2;
        const grow = (v) => Y(d.l) + (Y(v) - Y(d.l)) * p; // 从最低价向上长
        const top = Math.min(grow(d.o), grow(d.c));
        const bot = Math.max(grow(d.o), grow(d.c));
        return (
          <g key={i} opacity={Math.min(1, p * 2)}>
            <line x1={x} x2={x} y1={grow(d.h)} y2={Y(d.l)} stroke={col} strokeWidth={Math.max(1.5, bw * 0.12)} />
            <rect x={x - bw / 2} y={top} width={bw} height={Math.max(2, bot - top)} fill={col} rx={Math.min(3, bw * 0.15)} />
          </g>
        );
      })}
      {lastTag && f > 0 ? (() => {
        const d = data[Math.max(0, lastIdx)];
        const y = Y(d.c);
        const col = d.c >= d.o ? up : down;
        return (
          <g>
            <line x1={pad} x2={width - pad} y1={y} y2={y} stroke={col} strokeDasharray="6 6" strokeWidth={1.5} opacity={0.6} />
            <rect x={width - pad + 6} y={y - 18} width={110} height={36} rx={6} fill={col} />
            <text x={width - pad + 61} y={y + 7} textAnchor="middle" fontFamily={font} fontSize={20} fontWeight={700} fill="#fff" style={{fontVariantNumeric: 'tabular-nums'}}>{d.c.toFixed(2)}</text>
          </g>
        );
      })() : null}
      {data[0].t ? <text x={pad} y={height + 6} fontFamily={font} fontSize={18} fill={label}>{data[0].t}</text> : null}
      {data[n - 1].t ? <text x={width - pad} y={height + 6} textAnchor="end" fontFamily={font} fontSize={18} fill={label}>{data[n - 1].t}</text> : null}
    </svg>
  );
};

const FLAP_CHARS = ' 0123456789.,%+-$¥亿万';
/**
 * <SplitFlap text="7.21万亿" from={10} size={120} />
 * 每个字符从空白开始按字符表步进翻到目标字符（每 2 帧翻一格），字符间级联 3 帧；总时长 ≤ 0.6s 级。
 * 字符表外的字（如中文）直接在其级联时刻翻出。
 */
export const SplitFlap = ({text = '', from = 0, size = 110, stepFrames = 2, cascade = 3, fg = '#F2F2F2', bg = '#141414', seam = 'rgba(0,0,0,0.6)', font = '"DIN Condensed", "DIN Alternate", sans-serif'}) => {
  const f = useCurrentFrame() - from;
  const chars = [...String(text)];
  return (
    <div style={{display: 'inline-flex', gap: size * 0.06}}>
      {chars.map((ch, i) => {
        const t = f - i * cascade;
        const target = FLAP_CHARS.indexOf(ch);
        let shown = ' ';
        let flipping = false;
        if (t >= 0) {
          if (target < 0) shown = ch;
          else {
            const step = Math.floor(t / stepFrames);
            shown = FLAP_CHARS[Math.min(target, step)];
            flipping = step < target;
          }
        }
        const phase = flipping ? (t % stepFrames) / stepFrames : 0;
        return (
          <div key={i} style={{position: 'relative', width: size * (/[一-龥]/.test(ch) ? 0.95 : 0.62), height: size * 1.18, background: bg, borderRadius: size * 0.08,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.35)'}}>
            <span style={{fontFamily: font, fontSize: size, lineHeight: 1, color: fg, transform: `scaleY(${1 - phase * 0.6})`, fontVariantNumeric: 'tabular-nums'}}>{shown}</span>
            <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: seam}} />
          </div>
        );
      })}
    </div>
  );
};
