#!/usr/bin/env python3
"""beat_grid.py — 给带音乐的版本（TikTok / Shorts / YouTube / 投放）找节拍网格：切点和关键动作都落在拍子上

参考片的做法："如果有音乐，先分析节拍，镜头切换和关键动作都落在拍子上"。
抖音/小红书版 BGM 用平台曲库、不烧进成片，所以本脚本只在**音乐烧进成片**的版本用。

用法：
  python3 beat_grid.py music.mp3 [--fps 30] [--offset 0.0] [--json beats.json]
  python3 beat_grid.py music.mp3 --snap 12.3,45.1,78.0        # 把分镜切点（秒）吸附到最近的拍（默认只允许吸到强拍/每 4 拍）
  python3 beat_grid.py music.mp3 --snap-frames 369,1353 --fps 30 --any-beat
输出：bpm、拍点（秒 + 帧）、强拍（每小节第 1 拍，按能量峰估计相位）、吸附结果与偏移量。
依赖：librosa（已装 0.10.2）、numpy。
"""
import argparse, json
import numpy as np
import librosa


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('audio')
    ap.add_argument('--fps', type=float, default=30)
    ap.add_argument('--offset', type=float, default=0.0, help='音乐在成片时间轴上的起始秒（音乐从第 2 秒进就填 2）')
    ap.add_argument('--snap', help='要吸附的秒数列表，逗号分隔')
    ap.add_argument('--snap-frames', help='要吸附的帧号列表，逗号分隔')
    ap.add_argument('--any-beat', action='store_true', help='允许吸到任意拍（默认只吸强拍）')
    ap.add_argument('--max-shift', type=float, default=0.6, help='吸附最大允许位移（秒），超过就报警不动')
    ap.add_argument('--json')
    a = ap.parse_args()

    y, sr = librosa.load(a.audio, sr=None, mono=True)
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    # librosa 单次 beat_track 有倍频/分频歧义（120 BPM 的曲子会报 80 或 60）。
    # 做法：多个先验 BPM 各跑一次，按"拍点处 onset 强度 × 覆盖率"打分选最优；覆盖率 = 强 onset 里被某个拍点命中的比例。
    peaks = librosa.util.peak_pick(onset, pre_max=3, post_max=3, pre_avg=10, post_avg=10, delta=onset.mean() * 0.5, wait=5)
    best = None
    for prior in (70, 90, 110, 130, 150, 170):
        tp, bfr = librosa.beat.beat_track(y=y, sr=sr, onset_envelope=onset, start_bpm=prior, tightness=100, units='frames')
        tp = float(np.atleast_1d(tp)[0])
        if len(bfr) < 4:
            continue
        hit = float(np.mean([np.min(np.abs(bfr - pk)) <= 4 for pk in peaks])) if len(peaks) else 0  # 4 帧 ≈ 46ms 容差
        strength = float(onset[np.clip(bfr, 0, len(onset) - 1)].mean() / (onset.mean() + 1e-9))
        score = hit * strength
        if best is None or score > best[0]:
            best = (score, tp, bfr, hit)
    _, tempo, beat_frames, coverage = best
    beats = librosa.frames_to_time(beat_frames, sr=sr) + a.offset
    # 强拍相位：4 种相位里，拍点处 onset 强度均值最高的那一种
    ob = onset[np.clip(beat_frames, 0, len(onset) - 1)]
    phase = int(np.argmax([ob[k::4].mean() if len(ob[k::4]) else 0 for k in range(4)]))
    downbeats = beats[phase::4]
    bf = np.round(beats * a.fps).astype(int)
    df = np.round(downbeats * a.fps).astype(int)

    print(f'▶ {a.audio}  BPM ≈ {tempo:.1f}  拍 {len(beats)} 个  强拍 {len(downbeats)} 个  一拍 = {60 / tempo:.3f}s = {60 / tempo * a.fps:.1f} 帧  onset 命中率 {coverage:.0%}')
    if coverage < 0.3:
        print('  ⚠️ 拍点只覆盖了不到 30% 的强 onset：节拍可能不稳或有切分，人工听一遍再定切点')
    print(f'  前 8 个强拍（秒 / 帧）：' + '  '.join(f'{s:.2f}/{fr}' for s, fr in zip(downbeats[:8], df[:8])))

    snaps = []
    targets = []
    if a.snap:
        targets = [float(x) for x in a.snap.split(',') if x.strip()]
    if a.snap_frames:
        targets = [int(x) / a.fps for x in a.snap_frames.split(',') if x.strip()]
    grid = beats if a.any_beat else downbeats
    for t in targets:
        i = int(np.argmin(np.abs(grid - t)))
        shift = grid[i] - t
        ok = abs(shift) <= a.max_shift
        snaps.append({'from_s': round(t, 3), 'to_s': round(float(grid[i]), 3), 'to_frame': int(round(grid[i] * a.fps)), 'shift_s': round(float(shift), 3), 'ok': bool(ok)})
        flag = '✅' if ok else f'⚠️ 位移 {shift:+.2f}s 超过 {a.max_shift}s，建议改分镜而不是硬拉'
        print(f'  切点 {t:7.2f}s → 拍 {grid[i]:7.2f}s（帧 {int(round(grid[i] * a.fps))}，{shift:+.2f}s）{flag}')

    if a.json:
        json.dump({'audio': a.audio, 'bpm': round(tempo, 2), 'fps': a.fps, 'offset': a.offset, 'beats_s': [round(float(x), 4) for x in beats],
                   'beats_f': bf.tolist(), 'downbeats_s': [round(float(x), 4) for x in downbeats], 'downbeats_f': df.tolist(), 'snaps': snaps},
                  open(a.json, 'w'), ensure_ascii=False, indent=1)
        print(f'  写入 {a.json}')


if __name__ == '__main__':
    main()
