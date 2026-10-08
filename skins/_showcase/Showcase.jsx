// 皮肤样张：同一份三拍分镜（封面 / 数字拍 / 对比拍），只换 kit → 肉眼看皮肤差异
// 帧 0 = 封面（frame 0 必须完整）；帧 90+ 数字拍；帧 180+ 对比拍；大章节转场在 180。
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {BobbyCallout} from '../../motionkit/BobbyCallout.jsx';
import {Camera, Punch} from '../../motionkit/camera.jsx';
import {Shot, LeakAt} from '../../motionkit/seams.jsx';
import {SfxTrack, tickCues} from '../../motionkit/sfx.jsx';

export const makeShowcase = (kit) => {
  const {SKIN, Backdrop, Enter, Headline, Hero, Label, Delta, Mark, Stamp, Panel, Photo, DateMark, ChapterMark, Wipe, Disclaimer} = kit;
  const Cover = () => (
    <AbsoluteFill>
      <Photo src="leopold0731/warsh.png" caption="沃什 · 美联储主席" still w={620} h={760} style={{position: 'absolute', right: 0, bottom: 120}} />
      <div style={{position: 'absolute', left: 72, top: 96}}>
        <DateMark text="10·08" still />
      </div>
      <div style={{position: 'absolute', left: 72, top: 360, width: 700}}>
        <Label still>热点拆解</Label>
        <div style={{height: 28}} />
        <Headline accent="降息" still size={128}>{'美联储\n降息'}</Headline>
        <div style={{height: 36}} />
        <Hero value={25} suffix="bp" still size={150} />
      </div>
    </AbsoluteFill>
  );
  const Numbers = () => (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40}}>
      <ChapterMark n={1} title="钱去哪了" />
      <Enter delay={4}><Label>货币基金规模</Label></Enter>
      <Enter delay={8}><Hero value={7.2} decimals={1} suffix="万亿$" size={190} delay={8} /></Enter>
      <Enter delay={30}><Mark delay={34}><Delta value={18.6} /></Mark></Enter>
    </AbsoluteFill>
  );
  const Versus = () => (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46}}>
      <div style={{display: 'flex', gap: 40}}>
        <Enter delay={6}><Panel w={440} logo="logos/NVDA.png" title="英伟达"><Hero value={42} suffix="%" size={120} delay={10} /></Panel></Enter>
        <Enter delay={14}><Panel w={440} logo="logos/AMD.png" title="AMD"><Hero value={-7} suffix="%" size={120} delay={18} color="down" /></Panel></Enter>
      </div>
      <Enter delay={40}><Stamp delay={40}>差距拉大</Stamp></Enter>
    </AbsoluteFill>
  );
  return () => {
    const {width, height} = useVideoConfig();
    return (
      <AbsoluteFill>
        <Backdrop seed={SKIN.id} width={width} height={height} />
        <Sequence durationInFrames={90}><Camera move="pull" dur={24}><Punch at={[30, 58]}><Cover /></Punch></Camera></Sequence>
        <Sequence from={90} durationInFrames={90}><Shot dur={90} enter="curve" exit="zoom"><Camera move="push" dur={90}><Punch at={[38]}><Numbers /></Punch></Camera></Shot></Sequence>
        <Sequence from={180} durationInFrames={90}><Shot dur={90} enter="zoom" exit="none"><Camera move="drift" seed="vs"><Versus /></Camera></Shot></Sequence>
        <LeakAt at={90} seed={SKIN.id.length} hueShift={SKIN.dark ? 0 : 240} opacity={0.6} />
        <Wipe at={180} />
        <BobbyCallout from={100} hold={60} tone={SKIN.dark ? 'light' : 'purple'} corner="br" />
        <SfxTrack cues={[{at: 30, s: 'hit'}, {at: 90, s: 'whoosh'}, ...tickCues(98, 30), {at: 128, s: 'hit'}, {at: 180, s: 'whoosh'}, {at: 220, s: 'stamp'}]} />
        <Disclaimer />
      </AbsoluteFill>
    );
  };
};
