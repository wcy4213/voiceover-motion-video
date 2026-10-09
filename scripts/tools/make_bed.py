#!/usr/bin/env python3
"""make_bed.py — 程序合成一段 60 BPM 的安静氛围垫底（零版权），给无口播知识短片用。
   和弦每 8 秒换一次（Am → F → C → G 的低八度铺底 + 轻微颤音 + 每小节一声柔和低鼓），峰值 -18 dBFS，不抢字幕节奏。
   用法：python3 scripts/tools/make_bed.py 180 public/kfilm/bed_180.wav
"""
import sys, wave
import numpy as np
SR=44100
dur=float(sys.argv[1]) if len(sys.argv)>1 else 180.0
out=sys.argv[2] if len(sys.argv)>2 else 'public/kfilm/bed.wav'
n=int(SR*dur); t=np.arange(n)/SR
chords=[[110.0,164.81,261.63],[87.31,130.81,220.0],[65.41,130.81,196.0],[98.0,146.83,246.94]]  # A2 E3 C4 / F2 C3 A3 / C2 C3 G3 / G2 D3 B3
y=np.zeros(n)
seg=8.0
for i in range(int(np.ceil(dur/seg))):
    s=int(i*seg*SR); e=min(n,int((i+1)*seg*SR)); tt=t[s:e]-t[s]
    env=np.minimum(1,tt/1.5)*np.minimum(1,(seg-tt)/1.5)
    for k,fr in enumerate(chords[i%4]):
        vib=1+0.0015*np.sin(2*np.pi*5*tt+k)
        y[s:e]+=np.sin(2*np.pi*fr*vib*tt)*(0.5 if k==0 else 0.3)*env
        y[s:e]+=np.sin(2*np.pi*fr*2*tt)*0.08*env
# 每 4 秒一声柔鼓（60 BPM 的强拍）
for b in np.arange(0,dur,4.0):
    s=int(b*SR); L=int(0.5*SR); tt=np.arange(L)/SR
    k=np.sin(2*np.pi*(50+40*np.exp(-tt*20))*tt)*np.exp(-tt*9)*0.35
    y[s:s+L][:len(k)]+=k[:max(0,min(L,n-s))]
# 低通：简单一阶
a=1-np.exp(-2*np.pi*1800/SR); acc=0.0; z=np.empty_like(y)
for i in range(n):
    acc+=a*(y[i]-acc); z[i]=acc
z=z/np.max(np.abs(z))*0.126  # -18 dBFS
with wave.open(out,'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((z*32767).astype(np.int16).tobytes())
print('wrote',out,f'{dur:.0f}s')
