#!/usr/bin/env python3
"""为抠图 png 生成 WindOutline 用的素材对：
1. <name>.png        — 原抠图，四周加 pad 空白（给置换滤镜留位移空间）
2. <name>_ol.png     — 同画布的膨胀剪影，纯色（描边层，放在原图后面）

用法: make_outline.py <src.png> <outdir> [--name leopold] [--pad 30] [--dilate 10] [--color A050FF]
"""
import sys, argparse
from PIL import Image, ImageFilter

p = argparse.ArgumentParser()
p.add_argument("src")
p.add_argument("outdir")
p.add_argument("--name", default=None)
p.add_argument("--pad", type=int, default=30)
p.add_argument("--dilate", type=int, default=10)
p.add_argument("--color", default="A050FF")
p.add_argument("--flat-bottom", action="store_true", help="抠图是平底裁切(腰部以上)时清掉底边描边")
a = p.parse_args()

name = a.name or a.src.rsplit("/", 1)[-1].rsplit(".", 1)[0]
im = Image.open(a.src).convert("RGBA")
W, H = im.size
canvas = Image.new("RGBA", (W + 2 * a.pad, H + 2 * a.pad), (0, 0, 0, 0))
canvas.paste(im, (a.pad, a.pad), im)
canvas.save(f"{a.outdir}/{name}.png")

alpha = canvas.split()[3]
# 膨胀 alpha → 剪影比原图大一圈
k = a.dilate * 2 + 1
big = alpha.filter(ImageFilter.MaxFilter(k))
# 轻微模糊再二值化，让描边边缘圆润一点（手绘感）
big = big.filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v > 90 else 0)
col = tuple(int(a.color[i : i + 2], 16) for i in (0, 2, 4))
ol = Image.new("RGBA", canvas.size, col + (0,))
if a.flat_bottom:
    # 原图底边以下的描边全部清掉（平底抠图不描底边）
    from PIL import ImageDraw
    d = ImageDraw.Draw(big)
    d.rectangle([0, a.pad + H - 6, canvas.size[0], canvas.size[1]], fill=0)
ol.putalpha(big)
ol.save(f"{a.outdir}/{name}_ol.png")
print(f"[ok] {a.outdir}/{name}.png + {name}_ol.png  canvas={canvas.size}")
