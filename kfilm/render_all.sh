#!/bin/zsh
# 三支知识短片 × 横竖两版：硬码率 <100MB，_tmp → ffprobe → 全片解码校验 → 改名
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null 2>&1
cd <workspace>/vibe-motion-app
mkdir -p out/kfilm
render() { # compId secs outname
  local kb=$(( 95*8000/$2 - 332 ))
  echo "== $1 ${kb}k $(date +%H:%M:%S)"
  REMOTION_ENTRY_POINT=./kfilm/index.jsx node scripts/remotion-cli.mjs render ./kfilm/index.jsx "$1" "out/kfilm/$3_tmp.mp4" --codec=h264 --video-bitrate=${kb}k --x264-preset=medium --concurrency=8 2>&1 | grep -iE "error|Rendered [0-9]+/[0-9]+$" | tail -1
  if ffmpeg -v error -i "out/kfilm/$3_tmp.mp4" -f null - 2>/dev/null; then mv "out/kfilm/$3_tmp.mp4" "out/kfilm/$3.mp4"; echo "OK $3 $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 "out/kfilm/$3.mp4")"; else echo "DECODE FAIL $3"; fi
}
render KF-rule37   158 "37%法则_看多少家公司才该下手_20261009_1920x1080"
render KF-survivor 152 "幸存者偏差_榜单上的基金都是飞回来的飞机_20261009_1920x1080"
render KF-rates    152 "利率的形状_1694到2026_20261009_1920x1080"
render KF-rule37-V   158 "37%法则_看多少家公司才该下手_20261009_1080x1920"
render KF-survivor-V 152 "幸存者偏差_榜单上的基金都是飞回来的飞机_20261009_1080x1920"
render KF-rates-V    152 "利率的形状_1694到2026_20261009_1080x1920"
echo "ALL DONE $(date +%H:%M:%S)"
