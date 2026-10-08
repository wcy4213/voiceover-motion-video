#!/usr/bin/env python3
"""cover_diff.py — 封面（frame 0）查重：和历史封面存档逐张比相似度，自动化"每条首帧肉眼可辨不同"铁律

抖音会对首帧做同质化判定（2026-07-22《谷歌Q2》限流实锤）。以前靠人眼和 covers/ 存档并排看，这里给一个可量化的预警：
  - pHash（32×32 DCT 低频 8×8，64 bit）汉明距离：结构/构图相似度
  - 颜色直方图交集：色调相似度
  - 布局指纹：把画面切 4×4 格，比较每格亮度/饱和度分布 —— 抓"左上日期 + 左侧大标题 + 右侧人物"这种模板式构图

用法：
  python3 cover_diff.py <新封面.png> [--archive ./out/stills/covers] [--top 5]
判定（经验阈值，按存档回测可调）：pHash ≤ 10 或 综合相似度 ≥ 0.86 → ⚠️ 太像，换人物/构图/配色至少两处
"""
import argparse, glob, os
import numpy as np
from PIL import Image

N = 32


def dct_matrix(n):
    m = np.zeros((n, n))
    for k in range(n):
        for i in range(n):
            m[k, i] = np.cos(np.pi * k * (2 * i + 1) / (2 * n)) * (np.sqrt(1 / n) if k == 0 else np.sqrt(2 / n))
    return m


D = dct_matrix(N)


def phash(img):
    g = np.asarray(img.convert('L').resize((N, N), Image.LANCZOS), dtype=float)
    c = D @ g @ D.T
    low = c[:8, :8].flatten()[1:]
    return low > np.median(low)


def hist(img):
    h = np.asarray(img.convert('HSV').resize((96, 96))).reshape(-1, 3)
    hh, _ = np.histogramdd(h, bins=(12, 4, 4), range=((0, 256), (0, 256), (0, 256)))
    return hh.flatten() / hh.sum()


def layout(img):
    a = np.asarray(img.convert('HSV').resize((64, 64)), dtype=float) / 255.0
    cells = []
    for y in range(4):
        for x in range(4):
            blk = a[y * 16:(y + 1) * 16, x * 16:(x + 1) * 16]
            cells += [blk[..., 2].mean(), blk[..., 2].std(), blk[..., 1].mean()]
    return np.array(cells)


def feats(path):
    im = Image.open(path).convert('RGB')
    return phash(im), hist(im), layout(im)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cover')
    ap.add_argument('--archive', default=os.path.expanduser('./out/stills/covers'))
    ap.add_argument('--top', type=int, default=5)
    ap.add_argument('--keep-same-slug', action='store_true', help='默认跳过同一工程的中英/YT 变体')
    a = ap.parse_args()
    q = feats(a.cover)
    slug = os.path.basename(a.cover).split('_')[0].lower()
    rows = []
    for p in sorted(glob.glob(os.path.join(a.archive, '*.png')) + glob.glob(os.path.join(a.archive, '*.jpg'))):
        if os.path.abspath(p) == os.path.abspath(a.cover) or os.path.basename(p).startswith('_'):
            continue
        if not a.keep_same_slug and len(slug) >= 4 and slug in os.path.basename(p).lower():
            continue
        try:
            f = feats(p)
        except Exception:
            continue
        ham = int((q[0] != f[0]).sum())
        hsim = float(np.minimum(q[1], f[1]).sum())
        lsim = float(1 - np.abs(q[2] - f[2]).mean() * 3)
        score = 0.45 * (1 - ham / 63) + 0.25 * hsim + 0.30 * max(0.0, lsim)
        rows.append((score, ham, hsim, lsim, os.path.basename(p)))
    rows.sort(reverse=True)
    print(f'▶ {a.cover}  vs {len(rows)} 张历史封面')
    for s, ham, hs, ls, name in rows[: a.top]:
        flag = '⚠️ 太像' if (ham <= 10 or s >= 0.86) else ('注意' if s >= 0.80 else 'ok')
        print(f'  {flag:6} 综合 {s:.3f} · pHash 距离 {ham:2d} · 色调 {hs:.2f} · 布局 {ls:.2f}  {name}')
    worst = rows[0] if rows else None
    if worst and (worst[1] <= 10 or worst[0] >= 0.86):
        print('结论：⚠️ 与历史封面过于相似 —— 人物/构图/配色/日期章样式至少换两处再出')
    else:
        print('结论：✅ 与历史封面可区分')


if __name__ == '__main__':
    main()
