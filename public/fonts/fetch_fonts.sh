#!/bin/zsh
# 从官方渠道下载未随仓库分发的字体。链接会变，失败时按 agent/craft/fonts-license.md 里的官方出处手动下载后放进本目录并按 type.js 里的文件名命名。
set -e
cd "$(dirname "$0")"
dl() { [ -f "$2" ] && { echo "skip $2"; return; }; echo "↓ $2"; curl -fsSL -o "$2" "$1" || echo "  ✗ 下载失败：$1 —— 请手动从官方页面获取"; }
# OFL（可直链）
dl "https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/SimplifiedChinese/SourceHanSansSC-Heavy.otf"   SourceHanSansSC-Heavy.otf
dl "https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/SimplifiedChinese/SourceHanSansSC-Bold.otf"    SourceHanSansSC-Bold.otf
dl "https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/SimplifiedChinese/SourceHanSansSC-Medium.otf"  SourceHanSansSC-Medium.otf
dl "https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/SimplifiedChinese/SourceHanSansSC-Regular.otf" SourceHanSansSC-Regular.otf
dl "https://github.com/maoken-fonts/fengyasong/releases/latest/download/MaoKenWangFengYaSong.ttf" MaoKenWangFengYaSong.ttf
# 厂商声明类：无稳定直链，去官方页下载
cat <<'MSG'
以下字体请到官方页面下载（免费商用，但不允许第三方再分发）：
  阿里巴巴普惠体 3.0 / 阿里妈妈数黑体 / 东方大楷 / 方圆体   → https://fonts.alibabagroup.com  （文件名：AlibabaPuHuiTi3-75-SemiBold.ttf / AlimamaShuHeiTi-Bold.ttf / AlimamaDongFangDaKai.ttf / AlimamaFangYuanTiVF.ttf）
  站酷高端黑 / 站酷文艺体                                   → https://www.zcool.com.cn/special/zcoolfonts/ （ZcoolGaoDuanHei.ttf / ZcoolWenYiTi.ttf）
  优设标题黑                                                → https://www.uisdc.com/uisdc-first-free-font （YouSheBiaoTiHei.ttf）
  庞门正道标题体免费版                                       → 庞门正道公众号 （PangMenZhengDaoBiaoTi.ttf）
  钉钉进步体                                                → https://www.dingtalk.com/font （DingTalkJinBuTi.ttf）
  MiSans Heavy                                              → https://hyperos.mi.com/font （MiSans-Heavy.ttf）
  HarmonyOS Sans Black                                      → https://developer.huawei.com/consumer/cn/design/resource/ （HarmonyOSSans-Black.ttf）
MSG
