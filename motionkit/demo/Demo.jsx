// motionkit 验证用 demo：一屏铺满全部组件，渲静帧肉眼检查
import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DotGridBackdrop} from '../DotGridBackdrop.jsx';
import {KenBurns} from '../KenBurns.jsx';
import {DrawSVG} from '../DrawSVG.jsx';
import {enter} from '../presets.js';
import {BobbyCallout} from '../BobbyCallout.jsx';

// lucide trending-up (24x24 两条折线)
const TRENDING_UP = ['M22 7L13.5 15.5L8.5 10.5L2 17', 'M16 7H22V13'];

const card = {
  background: 'rgba(255,255,255,0.06)',
  border: '1.5px solid rgba(160,80,255,0.45)',
  borderRadius: 24,
  padding: 24,
  color: '#fff',
  fontFamily: 'PingFang SC, -apple-system, sans-serif',
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <DotGridBackdrop seed="demo-2026" width={1080} height={1080}>
      <AbsoluteFill style={{padding: 60}}>
        {/* 1. 语义动画 preset 卡片 */}
        <div style={{display: 'flex', gap: 24}}>
          <div style={{...card, ...enter('fadeInUp', frame, fps, {delay: 10})}}>
            <div style={{fontSize: 30, fontWeight: 600}}>fadeInUp</div>
          </div>
          <div style={{...card, ...enter('popIn', frame, fps, {delay: 25})}}>
            <div style={{fontSize: 30, fontWeight: 600}}>popIn</div>
          </div>
          <div style={{...card, ...enter('wipeReveal', frame, fps, {delay: 40, dur: 18})}}>
            <div style={{fontSize: 30, fontWeight: 600}}>wipeReveal</div>
          </div>
          <div style={{...card, ...enter('blurIn', frame, fps, {delay: 55})}}>
            <div style={{fontSize: 30, fontWeight: 600}}>blurIn</div>
          </div>
        </div>

        {/* 2. DrawSVG 图标线稿画出 + 3. KenBurns 图片运镜 */}
        <div style={{display: 'flex', gap: 40, marginTop: 60, alignItems: 'center'}}>
          <div style={{...card, width: 300, height: 300, display: 'flex',
            alignItems: 'center', justifyContent: 'center'}}>
            <DrawSVG paths={TRENDING_UP} size={220} stroke="#F9F339" delay={30} dur={30} />
          </div>
          <div style={{width: 560, height: 300, borderRadius: 24, overflow: 'hidden',
            border: '1.5px solid rgba(160,80,255,0.45)'}}>
            <KenBurns src={staticFile('motionkit/demo.jpg')} direction="in" amount={1.12} />
          </div>
        </div>

        {/* 4. BobbyCallout 前置位（深底 light 版，右下角，frame 20 入场停 100 帧） */}
        <BobbyCallout from={20} hold={100} tone="light" corner="br" />
      </AbsoluteFill>
    </DotGridBackdrop>
  );
};
