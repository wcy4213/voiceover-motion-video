#!/usr/bin/env python3
"""make_subs.py — 由 tokens.json 生成烧录字幕轨 subs.js（token 级时间戳对齐）

前置：先用 align_tokens.py 转写并导出 token 时间戳
    python3 scripts/align_tokens.py <音频> --dump tokens.json

然后把口播逐句写进下方 CUES：每条是 (ASR 锚点前缀, 显示文本)。
- 锚点按 ASR **实际识别的拼写**写（含错字/中文数字），才能精确命中
- 显示文本用**改正后的写法**（阿拉伯数字、正确品牌名、剥标点）
- 每句 ≤18 显示宽度（中文 1 / 半角 0.5），超宽就拆两条
- 小数点别当标点剥掉（"26.8%" 不能变 "268%"）

输出 subs.js：`export const SUBS = [{text, start, end}, ...]`（秒），
配皮肤组件的 <Subtitle cues={SUBS} /> 使用（skins/paper/paper.jsx 内置；
黑底皮肤的 skins/black-dotgrid/Subtitle.jsx 用帧号 f0/f1 的 subs.json，换算 = 秒×fps）。
"""
import json, sys, os

TOK = os.path.join(os.path.dirname(__file__), "tokens.json")
OUT = os.path.join(os.path.dirname(__file__), "subs.js")
AUDIO_END = 193.53  # 音频总时长（秒），ffprobe 查

# (asr锚点前缀, 显示文本) —— 示例两条，换成你的口播
CUES = [
    ("巴菲特的四亿股可口可乐", "巴菲特的4亿股可口可乐"),
    ("拿了快四十年没动过", "拿了快40年没动过"),
]

d = json.load(open(TOK, encoding="utf-8"))
toks, ts = d["text"].split(), d["timestamp"]
assert len(toks) == len(ts), f"token {len(toks)} != ts {len(ts)}"
flat, c2t = "", []
for i, t in enumerate(toks):
    flat += t
    c2t += [i] * len(t)

pos = 0
starts = []
for anchor, disp in CUES:
    i = flat.find(anchor, pos)
    if i < 0:
        print(f"[!] 未找到（从 {pos} 起）：{anchor}", file=sys.stderr)
        sys.exit(1)
    starts.append(ts[c2t[i]][0] / 1000.0)
    pos = i + len(anchor)

cues = []
for k, (anchor, disp) in enumerate(CUES):
    start = starts[k]
    end = starts[k + 1] if k + 1 < len(starts) else AUDIO_END
    if end <= start:
        print(f"[!] 非单调 @{k} {anchor}: {start} >= {end}", file=sys.stderr)
        sys.exit(1)
    cues.append({"text": disp, "start": round(start, 3), "end": round(end, 3)})

with open(OUT, "w", encoding="utf-8") as f:
    f.write("// 由 make_subs.py 生成（token 级时间戳对齐），勿手改\n")
    f.write("export const SUBS = " + json.dumps(cues, ensure_ascii=False) + ";\n")
print(f"[ok] {len(cues)} cues -> {OUT}，末条 {cues[-1]['start']:.2f}–{cues[-1]['end']:.2f}s")
