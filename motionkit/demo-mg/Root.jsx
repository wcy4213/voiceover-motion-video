import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {DotGridBackdrop} from '../DotGridBackdrop.jsx';
import {useFonts} from '../type.js';
import {Morph, Burst, Ring, FlowLine, KineticWords, LiquidReveal, LottieClip} from '../mg.jsx';

// 0 Morph+Burst / 60 Ring / 120 FlowLine / 180 KineticWords / 240 LiquidReveal / 300 Lottie
const Demo = () => {
  useFonts(['shuhei', 'puhui']);
  const C = ({children}) => <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <DotGridBackdrop width={1080} height={1440} seed="mg" />
      <Sequence durationInFrames={60}><C><div style={{position: 'relative'}}><Morph from="circle" to="up" at={10} dur={18} size={300} fill="#2ebd85" /><Burst at={28} radius={190} /></div></C></Sequence>
      <Sequence from={60} durationInFrames={60}><C><Ring value={73} delay={4} size={420} label="老股东在卖" /></C></Sequence>
      <Sequence from={120} durationInFrames={60}><FlowLine d="M120 1100 C 300 500, 700 1200, 960 360" delay={2} dur={30} /></Sequence>
      <Sequence from={180} durationInFrames={60}><C><KineticWords size={120} lineBreakAfter={[1]} words={[{t: '美联储', at: 2, fx: 'rise'}, {t: '降息', at: 10, fx: 'slam', color: '#F9F339'}, {t: '钱去哪了', at: 20, fx: 'slide'}]} /></C></Sequence>
      <Sequence from={240} durationInFrames={60}><LiquidReveal at={6} dur={24} cx={300} cy={500}><AbsoluteFill style={{background: '#F1EEE7', alignItems: 'center', justifyContent: 'center', fontSize: 140, fontFamily: '"MK Alimama ShuHei"', color: '#111'}}>下一幕</AbsoluteFill></LiquidReveal></Sequence>
      <Sequence from={300} durationInFrames={60}><C><LottieClip src="lottie/_test_pulse.json" style={{width: 500, height: 500}} /></C></Sequence>
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => <Composition id="MGDemo" component={Demo} durationInFrames={360} fps={30} width={1080} height={1440} />;
