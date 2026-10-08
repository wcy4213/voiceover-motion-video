import React from 'react';
import {Composition} from 'remotion';
import {makeShowcase} from './Showcase.jsx';
import * as terminal from '../terminal/kit.jsx';
import * as swiss from '../swiss/kit.jsx';
import * as glass from '../glass/kit.jsx';
import * as brutal from '../brutal/kit.jsx';
import * as uimotion from '../uimotion/kit.jsx';

// 新皮肤注册：import * as <id> from '../<id>/kit.jsx' 后加进 KITS
const KITS = [terminal, swiss, glass, brutal, uimotion];

export const RemotionRoot = () => (
  <>
    {KITS.map((kit) => (
      <Composition key={kit.SKIN.id} id={`Showcase-${kit.SKIN.id}`} component={makeShowcase(kit)}
        durationInFrames={270} fps={30} width={1080} height={1440} />
    ))}
  </>
);
