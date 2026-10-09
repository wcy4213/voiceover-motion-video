#!/bin/zsh
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null 2>&1
cd <workspace>/vibe-motion-app
render() { local kb=$2; echo "== $1 ${kb}k $(date +%H:%M:%S)"
  REMOTION_ENTRY_POINT=./kfilm/index.jsx node scripts/remotion-cli.mjs render ./kfilm/index.jsx "$1" "out/kfilm/$3_tmp.mp4" --codec=h264 --video-bitrate=${kb}k --audio-bitrate=96k --x264-preset=medium --concurrency=8 2>&1 | grep -iE "error|Rendered [0-9]+/[0-9]+$" | tail -1
  if ffmpeg -v error -i "out/kfilm/$3_tmp.mp4" -f null - 2>/dev/null; then mv -f "out/kfilm/$3_tmp.mp4" "out/kfilm/$3.mp4"; echo "OK $3 $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 "out/kfilm/$3.mp4")"; else echo "DECODE FAIL $3"; fi; }
render KF-rule37   4150 "37%法则_看多少家公司才该下手_20261009_1920x1080"
render KF-rule37-V 4150 "37%法则_看多少家公司才该下手_20261009_1080x1920"
echo "FIX DONE $(date +%H:%M:%S)"
