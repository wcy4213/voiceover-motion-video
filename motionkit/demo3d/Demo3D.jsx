// motionkit/three 验证 demo：S1 地球（0-89帧）→ S2 3D柱阵（90-179帧），渲静帧肉眼检查
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {DotGridBackdrop} from '../DotGridBackdrop.jsx';
import {ThreeStage} from '../three/ThreeStage.jsx';
import {Globe3D} from '../three/Globe3D.jsx';
import {Bars3D} from '../three/Bars3D.jsx';

const label = {
  position: 'absolute',
  top: 64,
  width: '100%',
  textAlign: 'center',
  color: '#fff',
  fontFamily: 'PingFang SC, -apple-system, sans-serif',
  fontSize: 44,
  fontWeight: 600,
};

export const Demo3D = () => {
  const {width, height} = useVideoConfig();
  return (
    <DotGridBackdrop seed="demo3d-2026" width={width} height={height}>
      <Sequence durationInFrames={90}>
        <AbsoluteFill>
          <ThreeStage width={width} height={height} camera={{position: [0, 50, 430], fov: 40}}>
            <Globe3D />
          </ThreeStage>
          <div style={label}>Globe3D · 全球资金流向</div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <AbsoluteFill>
          <ThreeStage width={width} height={height} camera={{position: [0, 5, 15], fov: 35}}>
            <Bars3D
              data={[
                {value: 38},
                {value: 62},
                {value: 95, color: '#F9F339'},
                {value: 54},
                {value: 71, color: '#2ebd85'},
              ]}
              delay={4}
            />
          </ThreeStage>
          <div style={label}>Bars3D · 3D 柱阵对比</div>
        </AbsoluteFill>
      </Sequence>
    </DotGridBackdrop>
  );
};
