#!/bin/bash
# 拉取示例场景用到的公司 logo（parqet CDN，方形品牌色块 PNG）
# 用法: bash fetch_logos.sh [TICKER ...]  不传参数则拉示例视频的 16 个
set -e
cd "$(dirname "$0")/public/logos"
TICKERS=${@:-"TSLA GOOGL INTC IBM GM AXP AAPL MSFT NVDA AMZN META NFLX JPM V KO MCD"}
for t in $TICKERS; do
  curl -sL --max-time 20 -o "$t.png" "https://assets.parqet.com/logos/symbol/$t?format=png&size=200"
  echo "$t.png"
done
