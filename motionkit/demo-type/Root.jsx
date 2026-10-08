import React from 'react';
import {Composition} from 'remotion';
import {Specimen} from './Specimen.jsx';

// 字体样张：验证 public/fonts 里每款字体在 headless Chrome 里真的渲出来了
export const RemotionRoot = () => (
  <Composition id="TypeSpecimen" component={Specimen} durationInFrames={30} fps={30} width={1080} height={1920} />
);
