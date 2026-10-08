// motionkit/sfx.jsx — 音效层（2026-10-08）。审视发现：成片只有口播一条音轨，零音效零音乐。
// 音效全部是 scripts/tools/make_sfx.py 程序合成的自有素材（public/sfx/*.wav），零版权风险；改参数重跑出新变体。
// BGM 不烧进成片：抖音/小红书发布时用平台曲库（版权由平台解决，还能吃到热门 BGM 流量）。
//
//   <SfxTrack cues={[{at: TL.s3, s: 'whoosh'}, {at: TL.s3 + 38, s: 'hit'}, {at: TL.s9, s: 'riser'}]} />
//   at = 声音"峰值"应落的帧（切点/落地帧），组件按每种音效的峰值偏移自动提前。
// 纪律（别做成音效轰炸）：口播段 SFX 音量 ≤0.35；hit/stamp 跟整屏冲击同配额（≤1 次/分钟）；tick 只跟 count-up；whoosh 只给大章节切换。
import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';

export const SFX = {
  whoosh: {file: 'sfx/whoosh.wav', peak: 8, vol: 0.28},  // 峰值在中段：提前 8 帧，让风声最响处落在切点
  swish: {file: 'sfx/swish.wav', peak: 3, vol: 0.25},
  hit: {file: 'sfx/hit.wav', peak: 0, vol: 0.4},
  stamp: {file: 'sfx/stamp.wav', peak: 0, vol: 0.4},
  pop: {file: 'sfx/pop.wav', peak: 0, vol: 0.22},
  tick: {file: 'sfx/tick.wav', peak: 0, vol: 0.12},
  riser: {file: 'sfx/riser.wav', peak: 47, vol: 0.22}, // 1.6s 上扬，结尾落在 at
};

export const SfxTrack = ({cues = [], gain = 1}) => (
  <>
    {cues.map((c, i) => {
      const def = SFX[c.s];
      if (!def) return null;
      const from = Math.max(0, Math.round(c.at - def.peak));
      return (
        <Sequence key={i} from={from} durationInFrames={90} layout="none">
          <Audio src={staticFile(def.file)} volume={(c.v ?? def.vol) * gain} />
        </Sequence>
      );
    })}
  </>
);

// count-up 配滴答：from..from+dur 之间每 every 帧一个 tick（越往后越稀，模拟减速）
export const tickCues = (from, dur = 30, every = 3) => {
  const out = [];
  for (let t = 0; t < dur; t += every + Math.floor(t / 10)) out.push({at: from + t, s: 'tick'});
  return out;
};
