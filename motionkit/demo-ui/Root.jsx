import React from 'react';
import {AbsoluteFill, Composition, Img, Sequence, staticFile} from 'remotion';
import {useFonts, T} from '../type.js';
import {ColorFlood, Carry, NestZoom} from '../acts.jsx';
import {Cursor, SelectionBox, Toggle, ChatBubble, StickerPill, OrbitRing} from '../uiprops.jsx';
import {BobbyBuddy} from '../buddy.jsx';

// ⚠️ Sequence 里的 at 都是**局部帧**（从该 Sequence 的 from 起算）；只有顶层的 Carry / Buddy / ColorFlood 用全局帧
// 0–60 片头 OrbitRing（黑）→ 60–150 米白：对话气泡 + 光标点开关 + 选框 → 150–210 上一场缩成卡片（NestZoom）+ 橙底 → 210–270 绿底 贴纸大字
// Carry：Bobby icon 从片头中央飞到右上角标位，再飞到 Buddy 位
const W = 1080, H = 1440;
const SceneChat = () => (
  <AbsoluteFill style={{padding: '260px 90px 0', gap: 26}}>
    <ChatBubble side="user" at={6}>英伟达这季度到底超没超预期？</ChatBubble>
    <ChatBubble side="bot" at={24} typing cps={1.6}>{'收入 $57.0B，高于预期 $54.9B（+3.8%）\n数据中心 $51.2B，同比 +66%'}</ChatBubble>
    <div style={{marginTop: 30}}><Toggle at={60} label="只看超预期项" /></div>
  </AbsoluteFill>
);
const Demo = () => {
  useFonts(['shuhei', 'puhui', 'harmony']);
  return (
    <AbsoluteFill>
      <ColorFlood acts={[{at: 0, color: '#0E0E10'}, {at: 60, color: '#F4F4F2', wipe: 'diagonal'}, {at: 150, color: '#FF5A1F', wipe: 'up'}, {at: 210, color: '#0ACF83', wipe: 'diagonal'}]} />
      <Sequence durationInFrames={60}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <OrbitRing size={560} at={0}><div style={{width: 200, height: 200}} /></OrbitRing>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={60} durationInFrames={150}>
        <NestZoom at={90} dur={22} to={{x: 120, y: 360, w: 840, h: 1120}} radius={30}>
          <AbsoluteFill style={{background: '#F4F4F2'}}><SceneChat /></AbsoluteFill>
        </NestZoom>
      </Sequence>
      <Sequence from={60} durationInFrames={90}>
        <Cursor keyframes={[{at: 0, x: 300, y: 1200}, {at: 44, x: 170, y: 660, click: true}, {at: 68, x: 420, y: 724}]} />
        <SelectionBox at={32} x={76} y={420} w={760} h={190} label="实际 vs 预期" />
      </Sequence>
      <Sequence from={210} durationInFrames={60}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 40}}>
          <StickerPill at={2} bg="#111" ink="#fff" size={120} rot={-3}>超预期</StickerPill>
          <StickerPill at={12} bg="#F9F339" ink="#111" size={120} rot={2}>+3.8%</StickerPill>
        </AbsoluteFill>
      </Sequence>
      <Carry keyframes={[{at: 0, x: W / 2 - 100, y: H / 2 - 100, w: 200, h: 200}, {at: 58, x: W - 150, y: 60, w: 96, h: 96, rot: -8}, {at: 206, x: 48, y: H - 110 - 96, w: 96, h: 96, rot: 0}]}>
        <Img src={staticFile('logos/BobbyAI_icon.png')} style={{width: '100%', height: '100%', borderRadius: '24%', background: '#fff', boxShadow: '0 10px 24px rgba(29,0,56,0.25)'}} />
      </Carry>
      <BobbyBuddy from={226} corner="bl" says={[{at: 232, text: '数据我已经整理好了', hold: 40}]} />
      <div style={{position: 'absolute', top: 30, right: 34, fontFamily: T.puhui, fontSize: 22, color: '#111', opacity: 0.45, mixBlendMode: 'difference'}}>内容仅供信息参考 · 不构成投资建议</div>
    </AbsoluteFill>
  );
};
export const RemotionRoot = () => <Composition id="UIDemo" component={Demo} durationInFrames={270} fps={30} width={W} height={H} />;
