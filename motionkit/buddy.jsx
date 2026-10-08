// motionkit/buddy.jsx — BobbyBuddy：全片常驻的"小伙伴"（2026-10-08，对标 Figma 广告里的紫色小怪物）
// 参考片里一只吉祥物出现在每个镜头的角落，旁边一枚小气泡当"字幕"，连续性和记忆点都靠它。
// 这里用 Bobby 官方 app icon（独角兽）做"角色"：会轻微上下浮、看向主体方向倾斜、说话时气泡弹出；不手打 "Bobby AI" 文字（logo 纪律）。
//
// ⚠️ 平台规则：
//   海外版（TikTok / Shorts / YouTube）：可全片常驻。
//   抖音：常驻属于"品牌露出"，不是功能演示，可用；但别和 BobbyCallout 同屏重复。
//   小红书：**不常驻**（禁一切产品界面与 CTA 倾向），只保留落版。
//
//   <BobbyBuddy corner="bl" says={[{at: 60, text: '先看 25 秒', hold: 70}, {at: 300, text: '这里是关键'}]} lookAt={1} />
import React from 'react';
import {Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

export const BobbyBuddy = ({corner = 'bl', size = 96, says = [], from = 0, lookAt = 0, tone = 'light', bob = 6, font = '"MK PuHuiTi 3", "PingFang SC", sans-serif', style}) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const t = f - from;
  const inP = interpolate(t, [0, 14], [0, 1], {...cl, easing: Easing.out(Easing.back(1.5))});
  const y = Math.sin(t / 18) * bob;
  const tilt = lookAt * 6 + Math.sin(t / 31) * 2;
  const dark = tone === 'light';
  const pos = {position: 'absolute', ...(corner.startsWith('b') ? {bottom: 110} : {top: 140}), ...(corner.endsWith('r') ? {right: 48} : {left: 48})};
  const say = says.find((s) => t >= s.at - from && t < s.at - from + (s.hold ?? 60) + 10);
  const sp = say ? interpolate(t - (say.at - from), [0, 8, (say.hold ?? 60), (say.hold ?? 60) + 8], [0, 1, 1, 0], {...cl, easing: Easing.out(Easing.cubic)}) : 0;
  const right = corner.endsWith('r');
  return (
    <div style={{...pos, display: 'flex', flexDirection: right ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 14, transform: `translateY(${y}px) scale(${inP})`, transformOrigin: 'bottom', ...style}}>
      <Img src={staticFile('logos/BobbyAI_icon.png')} style={{width: size, height: size, borderRadius: size * 0.24, background: '#fff', transform: `rotate(${tilt}deg)`, boxShadow: '0 10px 24px rgba(29,0,56,0.25)', display: 'block'}} />
      {say ? (
        <div style={{maxWidth: 420, background: dark ? 'rgba(255,255,255,0.96)' : '#1D0038', color: dark ? '#1D0038' : '#fff', fontFamily: font, fontSize: 26, lineHeight: 1.3, padding: '10px 18px', borderRadius: 18, [right ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 4, opacity: sp, transform: `translateY(${(1 - sp) * 10}px) scale(${0.9 + 0.1 * sp})`, transformOrigin: right ? 'right bottom' : 'left bottom', whiteSpace: 'nowrap', boxShadow: '0 8px 20px rgba(0,0,0,0.18)'}}>
          {say.text}
        </div>
      ) : null}
    </div>
  );
};
