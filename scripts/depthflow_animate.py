#!/usr/bin/env python3
"""depthflow_animate.py — 静图 → 2.5D 视差运镜视频 (DepthFlow 1.x Python API)

用法:
  python3 depthflow_animate.py <image> -o out.mp4 [--preset dolly] [--time 4] [--fps 30] [--height 1920]

presets (B-roll 建议 zoomin/dolly, 循环底适合 circle/orbital):
  zoomin     缓慢推近(平滑, 不回头) — 新闻图/人物照默认
  zoomout    缓慢拉远(平滑)
  dolly      dolly zoom 景深推拉
  orbital    绕焦点环绕视差
  circle     圆周视差(可循环)
  vertical   垂直往返视差
  horizontal 水平往返视差

首次运行会从 HuggingFace 下载 DepthAnything-V2 深度模型(需网络)。
"""
import argparse
import math
import sys

from attrs import define
from depthflow.scene import DepthScene

# 运镜参数以官方 examples/presets.py 为基準, 幅度按 B-roll 点缀用途调温和
@define
class ZoomIn(DepthScene):
    def update(self):
        self.state.height = math.atan(2.0 * self.tau) * (2.0 / math.pi) * 0.55


@define
class ZoomOut(DepthScene):
    def update(self):
        self.state.height = (1.0 - math.atan(2.0 * self.tau) * (2.0 / math.pi)) * 0.55


@define
class Dolly(DepthScene):
    def update(self):
        self.state.height = 0.30
        self.state.steady = 0.35
        self.state.focus = 0.35
        self.state.zoom = 0.95
        self.state.isometric = 0.5 * (1.0 - math.cos(self.cycle))


@define
class Orbital(DepthScene):
    def update(self):
        self.state.steady = 0.30
        self.state.focus = 0.30
        self.state.zoom = 0.98
        self.state.isometric = 0.50 * math.cos(self.cycle) + 0.75
        self.state.offset = (0.50 * math.sin(self.cycle), 0.0)


@define
class Circle(DepthScene):
    def update(self):
        self.state.isometric = 0.60
        self.state.steady = 0.30
        self.state.offset = (
            0.35 * math.sin(self.cycle + math.pi / 2.0),
            0.35 * math.sin(self.cycle),
        )


@define
class Vertical(DepthScene):
    def update(self):
        self.state.offset = (0.0, 0.6 * math.sin(self.cycle))
        self.state.isometric = 0.60
        self.state.steady = 0.30


@define
class Horizontal(DepthScene):
    def update(self):
        self.state.offset = (0.6 * math.sin(self.cycle), 0.0)
        self.state.isometric = 0.60
        self.state.steady = 0.30


PRESETS = {
    "zoomin": ZoomIn, "zoomout": ZoomOut, "dolly": Dolly, "orbital": Orbital,
    "circle": Circle, "vertical": Vertical, "horizontal": Horizontal,
}


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("image")
    p.add_argument("-o", "--output", required=True)
    p.add_argument("--preset", default="zoomin", choices=sorted(PRESETS))
    p.add_argument("--time", type=float, default=4.0, help="时长秒")
    p.add_argument("--fps", type=int, default=30)
    p.add_argument("--height", type=int, default=1920, help="输出高度像素")
    a = p.parse_args()

    scene = PRESETS[a.preset](backend="headless")
    scene.ffmpeg.h264(preset="fast")
    scene.input(image=a.image)
    scene.main(output=a.output, time=a.time, fps=a.fps, height=a.height, ssaa=1.5)
    print(f"[ok] {a.output}")


if __name__ == "__main__":
    sys.exit(main())
