#!/usr/bin/env python3
"""分镜切点精确对齐：用 paraformer-zh 的 **token 级时间戳** 定位每句口播的起始帧。

用法:
  # 一步到位（转写 + 定位）
  python3 align_tokens.py <音频> "第一句开头" "第二句开头" ...
  # 或先转写存盘，再反复定位（推荐，转写只跑一次）
  python3 align_tokens.py <音频> --dump tokens.json
  python3 align_tokens.py tokens.json "第一句开头" "第二句开头" ...

输出: 每个锚点的秒数 + 30fps 帧号 + 匹配度，可直接抄进 timeline.js。

═══ 为什么不用 align_marks.py ═══
align_marks.py 按"字符偏移 / 段总字数 × 段时长"估算，宣称误差 ±1s。
在**去过气口**的音频上这个假设崩掉，实测最大偏差 4.03s（121 帧）：
  ① 去气口后句间无停顿，VAD 会把 60s 甩成一整段，比例法在长段内累积漂移
  ② 变速（1.2x）后 SenseVoice 漏字，字符位置本身就是错的
  ③ 漂移是双向的——前半段画面偏晚、后半段偏早，靠整体平移救不回来
分镜跟口播对不上，观众第一眼就能看出来。做正片一律用本脚本。

═══ ⚠️ 核心坑：timestamp 是按 token 不是按字符 ═══
funasr 返回的 timestamp 数组与 **token** 一一对应，而 SK / HBM / DRAM / CapEx
这类拉丁串是 1 个 token 占多个字符。若按字符索引去查时间戳，每遇一个拉丁词
就错开一位，越靠后漂越多（实测 540 字 vs 514 token，尾部差 26 个位置，
最后一句直接查不到时间戳）。

正确做法：paraformer 输出的 text 本身就是 **空格分隔的 token 串**，
直接 `text.split()` 即可拿到与 timestamp 等长的 token 列表。
本脚本已处理，并会断言 len(tokens) == len(timestamp)。

═══ 锚点怎么选 ═══
按 **ASR 实际识别出来的文本**写锚点（先跑 --dump 看一遍转写），不要按正确写法写。
ASR 会有错字（韩股→盘股、CapEx→kpex、DRAM→DRNM、外溢→外移），
锚点用错字才能精确命中；上屏文字才用正确写法。
锚点取 6-12 字最稳，太短会误命中。
"""
import json
import os
import sys
import difflib

FPS = 30


def transcribe(audio):
    from funasr import AutoModel

    model = AutoModel(
        model="paraformer-zh",  # SeACo-Paraformer，带 token 级 timestamp
        vad_model="fsmn-vad",
        vad_kwargs={"max_single_segment_time": 12000},  # 切短，减少段内漂移
        device="cpu",
        disable_update=True,
    )
    r = model.generate(input=audio, batch_size_s=300)[0]
    return {"text": r["text"], "timestamp": r.get("timestamp") or []}


def load(path):
    if path.lower().endswith((".json",)):
        return json.load(open(path, encoding="utf-8"))
    return transcribe(path)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    d = load(sys.argv[1])
    toks, ts = d["text"].split(), d["timestamp"]

    if len(toks) != len(ts):
        print(f"[!] token {len(toks)} != timestamp {len(ts)}，对齐不可靠，请检查转写输出")
        sys.exit(2)

    args = sys.argv[2:]
    if args and args[0] == "--dump":
        out = args[1] if len(args) > 1 else "tokens.json"
        json.dump(d, open(out, "w", encoding="utf-8"), ensure_ascii=False)
        print(f"[ok] {len(toks)} token -> {out}\n")
        print("── 按时间打印转写（挑锚点用，注意 ASR 错字）──")
        for i in range(0, len(toks), 12):
            print(f"{ts[i][0] / 1000:6.2f}s | {''.join(toks[i:i + 12])}")
        return

    if not args:
        print(__doc__)
        sys.exit(1)

    # 字符串 <-> token 索引双向映射
    flat, c2t = "", []
    for i, t in enumerate(toks):
        flat += t
        c2t += [i] * len(t)

    def find(needle):
        i = flat.find(needle)
        if i >= 0:
            return i, 1.0
        best, bi, L = 0.0, -1, len(needle)
        for s in range(0, len(flat) - L + 1):
            r = difflib.SequenceMatcher(None, needle, flat[s:s + L]).ratio()
            if r > best:
                best, bi = r, s
        return bi, best

    print(f"{'秒':>8}{'帧@30fps':>10}{'匹配':>7}  锚点")
    prev_f = -1
    for needle in args:
        ci, score = find(needle)
        if ci < 0:
            print(f"{'--':>8}{'--':>10}{0.0:7.2f}  {needle}   ← 未找到")
            continue
        sec = ts[c2t[ci]][0] / 1000.0
        f = round(sec * FPS)
        warn = ""
        if score < 0.85:
            warn = "   ← 匹配度低，换个锚点（按 ASR 错字写）"
        elif f <= prev_f:
            warn = "   ← 非单调，锚点顺序或选词有问题"
        print(f"{sec:8.2f}{f:10d}{score:7.2f}  {needle}{warn}")
        prev_f = max(prev_f, f)

    last = ts[-1][1] / 1000.0
    print(f"\n音频末 token 结束于 {last:.2f}s = {round(last * FPS)} 帧")


if __name__ == "__main__":
    main()
