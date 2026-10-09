// kfilm/engine/caption.jsx — 无口播知识短片的字幕轨：一行字幕就是脚本。
// 规则（来自 #vibe知识大赏 头部样本）：一句 15–20 字、≈2s；关键词用【】包住 → 金色；逐词显影（4 帧一词），不逐字打字。
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../../skins/museum/kit.jsx';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

// 把 "差【一秒】就错过" 拆成 [{t:'差'},{t:'一秒',k:true},{t:'就错过'}]
const parse = (s) => {
  const out = [];
  const re = /【([^】]+)】/g;
  let i = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > i) out.push({t: s.slice(i, m.index)});
    out.push({t: m[1], k: true});
    i = m.index + m[0].length;
  }
  if (i < s.length) out.push({t: s.slice(i)});
  return out;
};

/** captions: [{at: 秒, text}]，每条显示到下一条开始；layout: {y, size, maxW} */
export const CaptionTrack = ({captions = [], y, size = 44, maxW = 1500, align = 'center'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  let idx = -1;
  for (let i = 0; i < captions.length; i++) if (captions[i].at <= s) idx = i;
  if (idx < 0) return null;
  const cur = captions[idx];
  const start = cur.at * fps;
  const end = (captions[idx + 1]?.at ?? cur.at + 4) * fps;
  const t = f - start;
  const outP = interpolate(f, [end - 5, end], [1, 0], cl);
  const parts = parse(cur.text);
  // 逐词显影：按字符累计，每个字 1.2 帧（15 字 ≈ 18 帧），关键词整块出
  let acc = 0;
  return (
    <div style={{position: 'absolute', left: '50%', top: y, transform: 'translateX(-50%)', width: maxW, textAlign: align, opacity: outP, whiteSpace: 'nowrap'}}>
      <span style={{fontFamily: F.title, fontSize: size, lineHeight: 1.3, color: C.ink, letterSpacing: '0.06em', textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>
        {parts.map((p, i) => {
          const chars = [...p.t];
          const node = chars.map((ch, j) => {
            const d = (acc + j) * 1.2;
            const op = interpolate(t - d, [0, 5], [0, 1], cl);
            return <span key={j} style={{opacity: op, color: p.k ? C.goldBright : C.ink}}>{ch}</span>;
          });
          acc += chars.length;
          return <span key={i}>{node}</span>;
        })}
      </span>
    </div>
  );
};
