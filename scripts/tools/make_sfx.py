#!/usr/bin/env python3
"""make_sfx.py — 程序合成一套自有音效（零版权风险），输出 public/sfx/*.wav
whoosh（转场风声）/ hit（数字落地低频重击）/ tick（数字滚动滴答）/ pop（元素弹出）/ riser（悬念上扬）/ swish（快甩）/ stamp（印章砸下）
全部 48kHz 16bit 单声道，峰值 -3dBFS。改参数重跑即可得到新变体（每期换一点，避免"同一套音效"同质化）。
"""
import os, wave
import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'sfx')
rng = np.random.default_rng(7)


def env(n, a=0.005, r=0.2, curve=3.0):
    t = np.linspace(0, 1, n)
    att = np.clip(t / max(a, 1e-4), 0, 1)
    rel = (1 - t) ** curve
    return att * rel


def lowpass(x, cutoff):
    # 一阶 IIR，cutoff 可以是逐样本数组
    y = np.zeros_like(x)
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    acc = 0.0
    for i in range(len(x)):
        a = 1 - np.exp(-2 * np.pi * c[i] / SR)
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.707
    with wave.open(os.path.join(OUT, f'{name}.wav'), 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print('wrote', name, f'{len(x) / SR:.2f}s')


def whoosh(d=0.55):
    n = int(SR * d); t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    sweep = 300 + 5200 * np.sin(np.pi * t) ** 2
    return lowpass(noise, sweep) * np.sin(np.pi * t) ** 1.5


def hit(d=0.6):
    n = int(SR * d); t = np.arange(n) / SR
    f = 120 * np.exp(-t * 9) + 42
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = rng.standard_normal(n) * np.exp(-t * 90) * 0.35
    return body + lowpass(click, 3000)


def tick(d=0.04):
    n = int(SR * d); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 180) + rng.standard_normal(n) * np.exp(-t * 400) * 0.2


def pop(d=0.14):
    n = int(SR * d); t = np.arange(n) / SR
    f = 900 * np.exp(-t * 30) + 260
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28)


def riser(d=1.6):
    n = int(SR * d); t = np.linspace(0, 1, n)
    f = 180 + 900 * t ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5
    noise = lowpass(rng.standard_normal(n), 400 + 6000 * t ** 2) * 0.7
    return (tone + noise) * t ** 1.8 * (1 - np.clip((t - 0.97) / 0.03, 0, 1))


def swish(d=0.22):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return lowpass(rng.standard_normal(n), 1500 + 9000 * t) * np.sin(np.pi * t) ** 0.8


def stamp(d=0.35):
    n = int(SR * d); t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * 85 * t) * np.exp(-t * 16)
    slap = lowpass(rng.standard_normal(n), 2500) * np.exp(-t * 60)
    return thud + slap * 0.8


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [('whoosh', whoosh), ('hit', hit), ('tick', tick), ('pop', pop), ('riser', riser), ('swish', swish), ('stamp', stamp)]:
        save(name, fn())
