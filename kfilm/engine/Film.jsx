// kfilm/engine/Film.jsx — 分镜即数据：一份 storyboard 对象 → 一支横屏/竖屏知识短片（无口播，字幕即脚本）
// storyboard = {id, title, sub, fps, duration(秒), tone, acts:[秒…], captions:[{at,text}], scenes:[{at,dur,type,props,hud:{year|chapter|title},cite,sfx}],
//               bobby:{at, hold, say}, disclaimer}
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, ChapterMark, Wipe, Disclaimer, C, F} from '../../skins/museum/kit.jsx';
import {CaptionTrack} from './caption.jsx';
import {VISUALS} from './visuals.jsx';
import {BobbyCallout} from '../../motionkit/BobbyCallout.jsx';
import {SfxTrack} from '../../motionkit/sfx.jsx';
import {Camera} from '../../motionkit/camera.jsx';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

// 布局：横屏 / 竖屏两套字号与画面区
const layout = (W, H) => {
  const portrait = H > W;
  if (!portrait) return {portrait, vw: W, vh: H - 250, top: 60, huge: 260, big: 96, mid: 56, sm: 36, capY: H - 160, capSize: 50, capMaxW: Math.min(1600, W - 160)};
  return {portrait, vw: W - 60, vh: 1040, top: 320, huge: 190, big: 74, mid: 48, sm: 32, capY: 1420, capSize: 44, capMaxW: W - 90};
};

// 每个场景包一层镜头：缓推 / 缓拉 / 漂移 轮换（pace_check 实测纯卡片场景静止段太多；参考片的底和图形也一直在微动）
const MOVES = ['push', 'drift', 'pull', 'drift'];
const SceneBox = ({from, dur, L, children, still0, idx = 0}) => {
  const f = useCurrentFrame();
  const inP = still0 && from === 0 ? 1 : interpolate(f - from, [0, 8], [0, 1], cl);
  const outP = interpolate(f - from, [dur - 6, dur], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, top: L.top, width: '100%', height: L.vh, opacity: inP * outP, transform: `translateY(${(1 - inP) * 10}px)`, overflow: 'visible'}}>
      <Camera move={MOVES[idx % MOVES.length]} dur={dur} seed={`kf${idx}`}>
        <div style={{position: 'absolute', left: '50%', top: 0, width: L.vw, height: L.vh, transform: 'translateX(-50%)'}}>{children}</div>
      </Camera>
    </div>
  );
};

const Cite = ({text, L}) => (
  <div style={{position: 'absolute', top: L.portrait ? 84 : 78, right: L.portrait ? 48 : 72, fontFamily: F.mono, fontSize: L.sm * 0.68, color: C.dim, letterSpacing: '0.12em', opacity: 0.85}}>{text}</div>
);

export const Film = ({sb}) => {
  const {width: W, height: H, fps} = useVideoConfig();
  const L = layout(W, H);
  const total = Math.round(sb.duration * fps);
  const cues = [];
  sb.scenes.forEach((s) => {
    const at = Math.round(s.at * fps);
    const kind = s.sfx || (['big', 'stamp', 'poster'].includes(s.type) ? 'hit' : s.type === 'title' || s.type === 'ref' ? null : 'whoosh');
    if (kind && at > 0) cues.push({at, s: kind, v: kind === 'hit' ? 0.32 : 0.14});
  });
  return (
    <AbsoluteFill>
      <Backdrop seed={sb.id} width={W} height={H} tone={sb.tone} />
      {sb.scenes.map((s, i) => {
        const Comp = VISUALS[s.type];
        if (!Comp) return null;
        const from = Math.round(s.at * fps), dur = Math.round(s.dur * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <SceneBox from={0} dur={dur} L={L} still0={s.at === 0} idx={i}>
              <Comp {...(s.props || {})} L={L} still={s.at === 0 && s.type !== 'poster' ? true : s.props?.still} />
            </SceneBox>
            {s.hud ? <ChapterMark year={s.hud.year} n={s.hud.chapter} title={s.hud.title} /> : null}
            {s.cite ? <Cite text={s.cite} L={L} /> : null}
          </Sequence>
        );
      })}
      {(sb.acts || []).map((a, i) => <Wipe key={i} at={Math.round(a * fps)} />)}
      <CaptionTrack captions={sb.captions} y={L.capY} size={L.capSize} maxW={L.capMaxW} />
      {sb.bobby ? <BobbyCallout from={Math.round(sb.bobby.at * fps)} hold={sb.bobby.hold ?? 80} tone="light" corner={L.portrait ? 'br' : 'bl'} label={sb.bobby.say || '整理'} size={L.portrait ? 0.9 : 1} style={L.portrait ? {bottom: 560} : {bottom: 230}} /> : null}
      <Sequence durationInFrames={total} layout="none"><Audio src={staticFile(sb.bed || 'kfilm/bed_200.wav')} volume={0.8} /></Sequence>
      <SfxTrack cues={cues} />
      <Disclaimer text={sb.disclaimer || '内容仅供科普 · 不构成投资建议'} />
    </AbsoluteFill>
  );
};
