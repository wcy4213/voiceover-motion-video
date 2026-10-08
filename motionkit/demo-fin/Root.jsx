import React from 'react';
import {AbsoluteFill, Composition, random} from 'remotion';
import {Candles, SplitFlap} from '../finance.jsx';
import {DotGridBackdrop} from '../DotGridBackdrop.jsx';

// 确定性随机游走 OHLC（demo 用；正片数据放 public/data/*.json）
const DATA = (() => {
  let c = 100;
  return Array.from({length: 40}, (_, i) => {
    const o = c;
    c = o * (1 + (random(`c${i}`) - 0.46) * 0.06);
    const h = Math.max(o, c) * (1 + random(`h${i}`) * 0.02);
    const l = Math.min(o, c) * (1 - random(`l${i}`) * 0.02);
    return {o, h, l, c, t: i === 0 ? '2026-08' : i === 39 ? '2026-10' : undefined};
  });
})();

const Demo = () => (
  <AbsoluteFill>
    <DotGridBackdrop width={1080} height={1440} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 200, gap: 120, flexDirection: 'column'}}>
      <SplitFlap text="7.21万亿" from={4} size={120} />
      <Candles data={DATA} width={900} height={560} from={0} reveal={90} />
    </AbsoluteFill>
  </AbsoluteFill>
);

export const RemotionRoot = () => <Composition id="FinDemo" component={Demo} durationInFrames={150} fps={30} width={1080} height={1440} />;
