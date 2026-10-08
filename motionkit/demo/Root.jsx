import React from 'react';
import {Composition} from 'remotion';
import {Demo} from './Demo.jsx';

export const RemotionRoot = () => (
  <Composition
    id="MotionKitDemo"
    component={Demo}
    durationInFrames={180}
    fps={30}
    width={1080}
    height={1080}
  />
);
