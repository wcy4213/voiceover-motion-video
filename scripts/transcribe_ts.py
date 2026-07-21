#!/usr/bin/env python3
"""带时间戳的 SenseVoice 转写：先 fsmn-vad 切段，再逐段识别，输出 [mm:ss.x - mm:ss.x] 文本 行。"""
import json
import os
import re
import subprocess
import sys
import tempfile

AUDIO = sys.argv[1]
OUT = sys.argv[2]

fd, wav = tempfile.mkstemp(suffix=".wav")
os.close(fd)
subprocess.run(["ffmpeg", "-y", "-i", AUDIO, "-vn", "-ac", "1", "-ar", "16000", wav],
               check=True, capture_output=True)

from funasr import AutoModel
from funasr.utils.postprocess_utils import rich_transcription_postprocess

vad = AutoModel(model="iic/speech_fsmn_vad_zh-cn-16k-common-pytorch",
                device="cpu", disable_update=True)
segs = vad.generate(input=wav)[0]["value"]  # [[start_ms, end_ms], ...]

asr = AutoModel(model="iic/SenseVoiceSmall", device="cpu", disable_update=True)

def clean(t):
    t = re.sub(r"<\|[^|]*\|>", "", t)
    t = re.sub(r"[🎼😊😔😡😰🤢😮🎙️🎵👏😀😭🤧😷]", "", t)
    return t.strip()

import soundfile as sf
data, sr = sf.read(wav)

lines = []
for s, e in segs:
    chunk = data[int(s / 1000 * sr):int(e / 1000 * sr)]
    r = asr.generate(input=chunk, language="zh", use_itn=True, fs=sr)
    text = clean("".join(rich_transcription_postprocess(x["text"]) for x in r))
    if not text:
        continue
    def fmt(ms):
        return f"{int(ms // 60000):02d}:{(ms % 60000) / 1000:05.2f}"
    lines.append({"start": s / 1000, "end": e / 1000,
                  "label": f"[{fmt(s)} - {fmt(e)}]", "text": text})
    print(f"[{fmt(s)} - {fmt(e)}] {text}", flush=True)

os.unlink(wav)
with open(OUT, "w") as f:
    json.dump(lines, f, ensure_ascii=False, indent=1)
print(f"saved {len(lines)} segs -> {OUT}")
