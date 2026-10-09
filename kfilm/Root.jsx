// 每支知识短片注册两条 composition：横屏 KF-<id>（1920×1080）+ 竖屏 KF-<id>-V（1080×1920）
import React from 'react';
import {Composition} from 'remotion';
import {Film} from './engine/Film.jsx';
import rule37 from './films/rule37.js';
import survivor from './films/survivor.js';
import rates from './films/rates.js';

export const FILMS = [rule37, survivor, rates];
const FPS = 30;

export const RemotionRoot = () => (
  <>
    {FILMS.map((sb) => (
      <React.Fragment key={sb.id}>
        <Composition id={`KF-${sb.id}`} component={Film} defaultProps={{sb}} durationInFrames={Math.round(sb.duration * FPS)} fps={FPS} width={1920} height={1080} />
        <Composition id={`KF-${sb.id}-V`} component={Film} defaultProps={{sb}} durationInFrames={Math.round(sb.duration * FPS)} fps={FPS} width={1080} height={1920} />
      </React.Fragment>
    ))}
  </>
);
