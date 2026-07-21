#!/usr/bin/env python3
"""分镜切点估算：在 transcript.json 的长段内按字符比例定位子串开头的时间。

用法:
  python3 align_marks.py transcript.json "本周是美股" "先说一下背景" ...
每个参数是口播文本里能唯一定位的一小段开头文字（8字左右最稳）。
输出: 秒数 + 30fps 帧号，可直接抄进 Remotion 的 timeline.js。

原理: 去气口音频 VAD 段很长，段内语速近似恒定，
按 "子串字符偏移 / 段总字数 × 段时长" 估算，误差约 ±1s。
"""
import json
import sys

FPS = 30

if len(sys.argv) < 3:
    print(__doc__)
    sys.exit(1)

segs = json.load(open(sys.argv[1]))


def t_of(sub):
    for s in segs:
        i = s["text"].find(sub)
        if i >= 0:
            frac = i / max(1, len(s["text"]))
            return s["start"] + frac * (s["end"] - s["start"])
    return None


print(f"{'秒':>8}  {'帧@30fps':>8}  标记")
for mark in sys.argv[2:]:
    t = t_of(mark)
    if t is None:
        print(f"{'—':>8}  {'—':>8}  {mark}  ← 没找到，检查子串是否与转写原文一致(含标点/错字)")
    else:
        print(f"{t:8.2f}  {round(t * FPS):8d}  {mark}")

print(f"\n音频总长: {segs[-1]['end']:.2f}s = {round(segs[-1]['end'] * FPS)} 帧")
