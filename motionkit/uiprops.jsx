// motionkit/uiprops.jsx — "界面当道具"（2026-10-08，对标 Figma 动态广告拆解）
// 产品类/AI 类题材最自然的画面语言不是图表，是**界面本身**：光标点一下、开关拨一下、选框框住、气泡冒出来。
// 全部抽象化（不是真实截图）：国内平台可用于信息查询类意象，不做交易界面；小红书版不放任何 Bobby 界面。
//   Cursor        光标沿关键帧移动，click 帧放一圈涟漪
//   SelectionBox  设计软件式选框（蓝框 + 四角手柄）把一个区域"选中"
//   Toggle        开关在 at 帧拨到 on
//   ChatBubble    对话气泡（左 user / 右 bot），逐字打出或整块弹出
//   StickerPill   贴纸式标签（黑描边 + 微旋 + 硬投影）—— "One [infinite] canvas" 那种
//   OrbitRing     logo 书挡：细环 + 刻度 + 几颗彩点绕行（片头/片尾）
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

const lerpKeys = (ks, f, dur) => {
  const s = [...ks].sort((a, b) => a.at - b.at);
  if (f < s[0].at) return null;
  let cur = {x: s[0].x, y: s[0].y};
  for (let i = 1; i < s.length; i++) {
    if (f < s[i].at) break;
    const p = interpolate(f - s[i].at, [0, dur], [0, 1], {...cl, easing: EXPO});
    cur = {x: s[i - 1].x + (s[i].x - s[i - 1].x) * p, y: s[i - 1].y + (s[i].y - s[i - 1].y) * p};
    // 先到位再算下一段：用上一段终点作为本段起点
    s[i - 1] = {...s[i - 1], x: s[i].x, y: s[i].y};
  }
  return cur;
};

/** <Cursor keyframes={[{at:0,x:200,y:900},{at:30,x:640,y:520,click:true},{at:70,x:700,y:300}]} /> */
export const Cursor = ({keyframes = [], dur = 16, size = 44, color = '#111', clickColor = '#6F00FF'}) => {
  const f = useCurrentFrame();
  const pos = lerpKeys(keyframes.map((k) => ({...k})), f, dur);
  if (!pos) return null;
  const clicks = keyframes.filter((k) => k.click && f >= k.at + dur - 2 && f < k.at + dur + 18);
  return (
    <>
      {clicks.map((k, i) => {
        const t = f - (k.at + dur - 2);
        const r = interpolate(t, [0, 18], [8, 56], cl), o = interpolate(t, [0, 18], [0.6, 0], cl);
        return <div key={i} style={{position: 'absolute', left: k.x - r, top: k.y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid ${clickColor}`, opacity: o}} />;
      })}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: pos.x - 3, top: pos.y - 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>
        <path d="M4 2 L4 20 L9 15.5 L12.5 22 L15.5 20.5 L12 14 L19 14 Z" fill={color} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** <SelectionBox at={40} x y w h /> —— 蓝框从中心长出 + 四角手柄弹出 + 顶部尺寸标 */
export const SelectionBox = ({at = 0, x, y, w, h, color = '#3B82F6', label}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - at, [0, 10], [0, 1], {...cl, easing: EXPO});
  if (p <= 0) return null;
  const hp = interpolate(f - at, [6, 14], [0, 1], {...cl, easing: Easing.out(Easing.back(2))});
  const cw = w * p, ch = h * p;
  const handles = [[0, 0], [1, 0], [0, 1], [1, 1]];
  return (
    <div style={{position: 'absolute', left: x + (w - cw) / 2, top: y + (h - ch) / 2, width: cw, height: ch, border: `2px solid ${color}`, boxSizing: 'border-box'}}>
      {handles.map(([hx, hy], i) => (
        <div key={i} style={{position: 'absolute', left: hx * cw - 7, top: hy * ch - 7, width: 12, height: 12, background: '#fff', border: `2px solid ${color}`, transform: `scale(${hp})`}} />
      ))}
      {label ? <div style={{position: 'absolute', left: '50%', bottom: -34, transform: `translateX(-50%) scale(${hp})`, background: color, color: '#fff', fontSize: 18, padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap', fontFamily: '-apple-system, sans-serif'}}>{label}</div> : null}
    </div>
  );
};

/** <Toggle at={50} on label="Dev Mode" /> —— at 帧从 off 拨到 on */
export const Toggle = ({at = 0, w = 92, label, onColor = '#2ebd85', offColor = '#C8C8CE', labelColor = '#111', font = '"MK PuHuiTi 3", "PingFang SC", sans-serif'}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - at, [0, 12], [0, 1], {...cl, easing: EXPO});
  const h = w * 0.54, knob = h - 8;
  const bg = p < 0.5 ? offColor : onColor;
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 16}}>
      <div style={{width: w, height: h, borderRadius: h / 2, background: bg, position: 'relative', transition: 'none'}}>
        <div style={{position: 'absolute', top: 4, left: 4 + (w - knob - 8) * p, width: knob, height: knob, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)'}} />
      </div>
      {label ? <span style={{fontFamily: font, fontSize: h * 0.7, color: labelColor, fontWeight: 600}}>{label}</span> : null}
    </div>
  );
};

/** <ChatBubble side="user|bot" at={20} typing>文字</ChatBubble> —— typing=逐字出现（字符串切片，不做逐字 opacity） */
export const ChatBubble = ({side = 'bot', at = 0, typing = false, cps = 1.2, children, maxW = 620, font = '"MK PuHuiTi 3", "PingFang SC", sans-serif', size = 30, botBg = '#F2F0FF', botInk = '#1D0038', userBg = '#6F00FF', userInk = '#fff', avatar}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0) return null;
  const p = interpolate(t, [0, 12], [0, 1], {...cl, easing: Easing.out(Easing.back(1.1))});
  const text = String(children);
  const shown = typing ? text.slice(0, Math.floor(t * cps)) : text;
  const bot = side === 'bot';
  return (
    <div style={{display: 'flex', justifyContent: bot ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: 12, transform: `scale(${0.9 + 0.1 * p})`, opacity: p, transformOrigin: bot ? 'left bottom' : 'right bottom'}}>
      {bot && avatar ? <img src={avatar} alt="" style={{width: 48, height: 48, borderRadius: 14}} /> : null}
      <div style={{maxWidth: maxW, background: bot ? botBg : userBg, color: bot ? botInk : userInk, fontFamily: font, fontSize: size, lineHeight: 1.4, padding: '16px 22px', borderRadius: 22, borderBottomLeftRadius: bot ? 6 : 22, borderBottomRightRadius: bot ? 22 : 6, whiteSpace: 'pre-wrap'}}>
        {shown}{typing && shown.length < text.length ? <span style={{opacity: (t % 16) < 8 ? 1 : 0}}>▍</span> : null}
      </div>
    </div>
  );
};

/** <StickerPill at={10} bg="#6F00FF" ink="#fff" rot={-3}>infinite</StickerPill> */
export const StickerPill = ({at = 0, bg = '#111', ink = '#fff', rot = -2, size = 56, font = '"MK Alimama ShuHei", "PingFang SC", sans-serif', outline = '#111', children, style}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - at, [0, 12], [0, 1], {...cl, easing: Easing.out(Easing.back(1.6))});
  if (p <= 0) return null;
  return (
    <span style={{display: 'inline-block', background: bg, color: ink, fontFamily: font, fontSize: size, lineHeight: 1, padding: '0.22em 0.5em', borderRadius: 999, border: `3px solid ${outline}`, boxShadow: `4px 5px 0 ${outline}`, transform: `rotate(${rot}deg) scale(${p})`, transformOrigin: '50% 60%', whiteSpace: 'nowrap', ...style}}>{children}</span>
  );
};

/** <OrbitRing size={520} dots={5}><img …logo /></OrbitRing> —— 片头/片尾 logo 书挡 */
export const OrbitRing = ({size = 520, dots = 5, colors = ['#F24E1E', '#A259FF', '#1ABCFE', '#0ACF83', '#FF7262'], ring = 'rgba(255,255,255,0.35)', ticks = 24, speed = 0.012, at = 0, children}) => {
  const f = useCurrentFrame() - at;
  const p = interpolate(f, [0, 20], [0, 1], {...cl, easing: EXPO});
  const r = size / 2;
  return (
    <div style={{position: 'relative', width: size, height: size, opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>
      <svg width={size} height={size} style={{position: 'absolute', inset: 0}}>
        <circle cx={r} cy={r} r={r - 2} fill="none" stroke={ring} strokeWidth={2} />
        {Array.from({length: ticks}).map((_, i) => {
          const a = (i / ticks) * Math.PI * 2;
          const len = interpolate(f, [4 + i * 0.4, 14 + i * 0.4], [0, 14], cl);
          return <line key={i} x1={r + Math.cos(a) * (r - 16)} y1={r + Math.sin(a) * (r - 16)} x2={r + Math.cos(a) * (r - 16 - len)} y2={r + Math.sin(a) * (r - 16 - len)} stroke={ring} strokeWidth={2} />;
        })}
        {Array.from({length: dots}).map((_, i) => {
          const a = (i / dots) * Math.PI * 2 + f * speed;
          return <circle key={i} cx={r + Math.cos(a) * (r - 2)} cy={r + Math.sin(a) * (r - 2)} r={7} fill={colors[i % colors.length]} />;
        })}
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </div>
  );
};
