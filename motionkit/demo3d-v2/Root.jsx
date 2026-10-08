import React from 'react';
import {AbsoluteFill, Composition, Sequence, useVideoConfig} from 'remotion';
import {DotGridBackdrop} from '../DotGridBackdrop.jsx';
import {ThreeStage, Number3D, Coin3D, IsoCity3D, Particles3D, Card3D} from '../three/index.js';

// 每段 60 帧：0 Number3D / 60 Coin3D / 120 IsoCity3D / 180 Particles3D / 240 Card3D
const CITY = [42, 18, 30, 95, 12, 27, 55, 33, 20, 61, 15, 38].map((value) => ({value}));
const Demo = () => {
  const {width, height} = useVideoConfig();
  const S = (props) => <ThreeStage width={width} height={height} {...props} />;
  return (
    <AbsoluteFill>
      <DotGridBackdrop width={width} height={height} seed="d3v2" />
      <Sequence durationInFrames={60}><S camera={{position: [0, 0, 14], fov: 35}}><Number3D value={7.21} decimals={2} suffix="T" delay={2} /></S></Sequence>
      <Sequence from={60} durationInFrames={60}><S camera={{position: [0, 1.2, 10], fov: 35}}>{[-1.5, 0, 1.5].map((x, i) => <Coin3D key={i} position={[x, -0.6, 0]} radius={0.62} delay={i * 6} />)}</S></Sequence>
      <Sequence from={120} durationInFrames={60}><S camera={{position: [13, 12, 13], fov: 32}}><IsoCity3D data={CITY} cols={4} highlight={3} /></S></Sequence>
      <Sequence from={180} durationInFrames={60}><S camera={{position: [0, 2, 13], fov: 40}}><Particles3D shape="sphere" dur={45} /></S></Sequence>
      <Sequence from={240} durationInFrames={60}><S camera={{position: [0, 0, 11], fov: 35}}><Card3D src="logos/BobbyAI_icon.png" w={4} h={4} delay={2} /></S></Sequence>
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => <Composition id="MotionKit3DV2" component={Demo} durationInFrames={300} fps={30} width={1080} height={1440} />;
