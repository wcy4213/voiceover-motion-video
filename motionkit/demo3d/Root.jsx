import React from 'react';
import {Composition} from 'remotion';
import {Demo3D} from './Demo3D.jsx';

export const RemotionRoot = () => (
  <Composition
    id="MotionKit3DDemo"
    component={Demo3D}
    durationInFrames={180}
    fps={30}
    width={1080}
    height={1080}
  />
);
