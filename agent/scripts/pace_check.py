#!/usr/bin/env python3
"""pace_check.py — 成片「视觉节奏」体检（留存 QC）

量化三件事，对应 video-agent 的留存规则：
  1. 静止段：连续 >2.0s 画面几乎没有变化（只剩背景漂移）的区间 —— "任何元素静止不超过 2 秒"
  2. 视觉事件密度：每 5 秒窗口内的"显著变化"次数 —— 开场每 1–2 秒、正片每 2–4 秒一个新事件
  3. 开场体检：frame 0 是否非空（信息量）+ 前 2 秒是否在动

原理：ffmpeg 解码成 10fps、宽 192 的灰度帧 → 相邻帧逐像素差 → "变化像素占比"。
背景点阵/光晕的缓慢漂移变化像素很少（<0.4%），元素入场/切镜/数字滚动会远高于此。

用法：
  python3 pace_check.py <video.mp4> [--fps 10] [--static-thr 0.004] [--event-thr 0.02] [--json out.json]
依赖：ffmpeg、numpy（系统 python3.11 已装）
"""
import argparse, json, subprocess
import numpy as np


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height:format=duration", "-of", "json", path],
        capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    s = j["streams"][0]
    return int(s["width"]), int(s["height"]), float(j["format"]["duration"])


def frames(path, fps, w):
    W, H, _ = probe(path)
    h = int(round(H * w / W / 2) * 2)
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={w}:{h}",
           "-f", "rawvideo", "-pix_fmt", "gray", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    n = w * h
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        yield np.frombuffer(buf, dtype=np.uint8).reshape(h, w)
    p.wait()


def runs(mask, min_len):
    """mask 中连续 True 段 [(start, end_exclusive)]，长度 >= min_len"""
    out, start = [], None
    for i, v in enumerate(mask):
        if v and start is None:
            start = i
        elif not v and start is not None:
            if i - start >= min_len:
                out.append((start, i))
            start = None
    if start is not None and len(mask) - start >= min_len:
        out.append((start, len(mask)))
    return out


def fmt(t):
    return f"{int(t // 60)}:{t % 60:05.2f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--fps", type=float, default=10)
    ap.add_argument("--width", type=int, default=192)
    ap.add_argument("--pix-delta", type=int, default=14, help="灰度差超过该值才算像素变化")
    ap.add_argument("--static-thr", type=float, default=0.004, help="变化像素占比低于此 = 静止")
    ap.add_argument("--event-thr", type=float, default=0.02, help="变化像素占比高于此 = 一次视觉事件")
    ap.add_argument("--max-static", type=float, default=2.0, help="静止段超过多少秒报警")
    ap.add_argument("--json")
    a = ap.parse_args()

    _, _, dur = probe(a.video)
    prev, ratios, f0 = None, [], None
    for i, fr in enumerate(frames(a.video, a.fps, a.width)):
        cur = fr.astype(np.int16)
        if i == 0:
            f0 = cur
        if prev is not None:
            ratios.append(float((np.abs(cur - prev) > a.pix_delta).mean()))
        prev = cur
    r = np.array(ratios)
    dt = 1.0 / a.fps

    # 1. 静止段
    static = runs(r < a.static_thr, int(round(a.max_static * a.fps)))
    static_spans = [((s + 1) * dt, (e + 1) * dt) for s, e in static]

    # 2. 事件：上升沿记一次，避免一次长入场被数成多次
    hi = r >= a.event_thr
    events = [(i + 1) * dt for i in range(len(hi)) if hi[i] and (i == 0 or not hi[i - 1])]
    win = 5.0
    nwin = int(np.ceil(dur / win))
    dens = [sum(1 for t in events if k * win <= t < (k + 1) * win) for k in range(nwin)]
    gaps = np.diff([0.0] + events + [dur])
    longest_gap = float(gaps.max()) if len(gaps) else dur

    # 3. 开场体检
    f0_std = float(f0.std()) if f0 is not None else 0.0
    opening = r[: int(2 * a.fps)]
    early = [t for t in events if t < 10]

    flags = []
    if f0_std < 18:
        flags.append(f"frame0 信息量低（灰度标准差 {f0_std:.1f} < 18，疑似空底/纯色封面）")
    if not any(t < 2.0 for t in events) and (opening.max() if len(opening) else 0) < a.event_thr:
        flags.append("前 2 秒没有任何显著视觉事件（开场在'静帧封面+微动'）")
    if len(early) < 5:
        flags.append(f"前 10 秒只有 {len(early)} 个视觉事件（目标 ≥5，开场每 1–2 秒一个）")
    for s, e in static_spans:
        flags.append(f"静止段 {fmt(s)}–{fmt(e)}（{e - s:.1f}s）")
    for k, n in enumerate(dens):
        if n < 1 and (k + 1) * win <= dur:
            flags.append(f"{fmt(k * win)}–{fmt((k + 1) * win)} 整 5 秒无显著视觉事件")

    report = {
        "video": a.video, "duration": round(dur, 2),
        "events": len(events), "events_per_10s": round(len(events) / dur * 10, 2),
        "median_gap_s": round(float(np.median(gaps)), 2) if len(gaps) else None,
        "longest_gap_s": round(longest_gap, 2),
        "frame0_std": round(f0_std, 1), "events_first_10s": len(early),
        "static_spans": [[round(s, 2), round(e, 2)] for s, e in static_spans],
        "density_per_5s": dens, "flags": flags,
    }

    print(f"▶ {a.video}  时长 {fmt(dur)}")
    print(f"  视觉事件 {len(events)} 个 · 每10秒 {report['events_per_10s']} 个 · "
          f"间隔中位 {report['median_gap_s']}s · 最长 {report['longest_gap_s']}s")
    print(f"  前10秒事件 {len(early)} 个 · frame0 灰度标准差 {f0_std:.1f}")
    bar = "".join(" ▁▂▃▄▅▆▇█"[min(n, 8)] for n in dens)
    print(f"  每5秒事件密度：{bar}")
    print("  结论：" + ("✅ 无节奏告警" if not flags else f"⚠️ {len(flags)} 条告警"))
    for f in flags:
        print("   - " + f)
    if a.json:
        with open(a.json, "w") as fh:
            json.dump(report, fh, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
