<p align="center">
  <img src="assets/banner.svg" alt="video-agent" width="100%"/>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-A050FF" alt="MIT License"/></a>
  <img src="https://img.shields.io/badge/Remotion-4.0.438-6F00FF" alt="Remotion 4"/>
  <img src="https://img.shields.io/badge/Claude%20Code-Skill-F9F339" alt="Claude Code Skill"/>
  <img src="https://img.shields.io/badge/ASR-SenseVoice-7C9CFD" alt="SenseVoice"/>
  <img src="https://img.shields.io/badge/成片-44%20支%20·%209%20周-2ebd85" alt="44 videos"/>
</p>

# video-agent（原 voiceover-motion-video）

**一个 Claude Code agent，从选题到成片管全链路：写口播脚本 → 去气口 → 自主判定格式 / 皮肤 / 技术 / 每句镜头手法 → 文字分镜（用户确认）→ Remotion 搭场景 → 节奏体检 / 封面查重 / 审片卡 → 渲染 → 交付物料 → 完播曲线回流。** 2026-07-21 至 09-24 用它连续产出 44 支财经解说视频（抖音 + 小红书双平台），本仓库是这套生产线的公开版：agent 文档、决策引擎、7 套视觉皮肤、动效 / 3D / MG / 音效组件库、QC 脚本，以及每支成片的封面与后台数据。

> **EN** — A Claude Code agent that runs the whole short-video pipeline for finance/tech explainers: script → voiceover → an explicit decision layer (format × visual skin × main technique × per-line shot grammar) → storyboard → deterministic Remotion scenes → pacing / cover-dedupe / art-direction QA → render → publish kit → retention-curve feedback. Shipped 44 videos in 9 weeks; this repo is the sanitized public version with per-video covers and platform metrics. Docs are Chinese; code is language-agnostic.

*示例内容为美股/港股投研与投教解读，仅作演示，不构成投资建议。*

---

## 📺 成片与数据（44 支，2026-07-21 → 09-24）

<p align="center"><img src="assets/cover_wall.jpg" alt="44 支成片首帧" width="100%"/></p>
<p align="center"><sub>44 支成片的 frame 0（即封面）。左上前两格的空紫底就是 07-22 被平台判"批量发布同质化内容"限流的那一代开场——此后首帧规范、封面查重、皮肤轮换全部由此而来。</sub></p>

数据口径：创作者后台快照 **截至 2026-10-07**（播放 = 后台播放数，不是前台公开数）。后台采集线 08-13 才上线，前 9 支没有数据；小红书 09-10 之后的条目未采到。`—` = 无数据。完整字段（含评论 / 分享 / 涨粉 / 平均观看秒数）在 [`assets/videos.json`](assets/videos.json)。

**合计（有数据的部分）**：抖音 35 支 · 播放 99.6 万 · 点赞 1.96 万 · 收藏 8,725；小红书 28 支 · 播放 13.0 万 · 点赞 2,308 · 收藏 1,848。抖音单条**平均观看时长中位数 24 秒**（这就是全套规则里"25 秒结算线"的来历）。

**几条有用的结论**（样本小，只是方向）：
- **投教方法论线 ≫ 投研热点线**（抖音）：米白手账皮肤 11 支，播放中位 1.19 万；黑底点阵投研线 14 支，播放中位 268。同一个账号、同一套制作流程，选题线别决定了十倍以上的差距。
- 抖音 Top 5：聪明钱 47.1 万（平均观看 31 秒）· 中期选举规律 14.1 万 · 美股熔断 11.4 万 · 政府持仓英特尔 6.9 万 · VIX 恐慌指数 6.1 万——全是"一个反直觉数字 + 历史规律"的投教题。
- 小红书 Top 3 全是**收藏型**：聪明钱 2.46 万播放 / 758 收藏 · 股息与分红 2.13 万 / 233 · 大空头做空 Nebius 1.4 万 / 144。小红书吃"值得存下来的一页笔记"，抖音吃"25 秒内给我一个结论"。
- 节奏体检（`pace_check.py`）回测：高播放的几条片子静止段占比并不低，**剪辑快慢解释不了播放**；选题和开场第一句才是主变量。详见 `agent/craft/retention.md`。

<details>
<summary><b>展开 44 支成片明细表</b>（封面 · 日期 · 选题 · 工程 · 时长 · 皮肤 · 双平台 播放/赞/藏 · 链接）</summary>

| # | 封面 | 日期 | 选题 · 工程 · 时长 · 皮肤 | 抖音 播放/赞/藏 | 小红书 播放/赞/藏 | 链接 |
|---|---|---|---|---|---|---|
| 1 | <img src="assets/covers/earnings.jpg" width="72"/> | 07-21 | **Q2财报周前瞻**<br/><sub>`earnings` · 3:08 · 紫底涟漪</sub> | — / — / — | — / — / — | [抖音](https://www.douyin.com/video/7664934085000793390) · [小红书](https://www.xiaohongshu.com/explore/6a5f50e7000000001d022c96) |
| 2 | <img src="assets/covers/googleq2.jpg" width="72"/> | 07-22 | **谷歌Q2财报前瞻**<br/><sub>`googleq2` · 3:44 · 紫底涟漪</sub> | — / — / — | — / — / — | [抖音](https://www.douyin.com/video/7665329047022472475) · [小红书](https://www.xiaohongshu.com/explore/6a60b837000000000c015fe3) |
| 3 | <img src="assets/covers/googleq2earn.jpg" width="72"/> | 07-23 | **谷歌Q2财报分析**<br/><sub>`googleq2earn` · 2:44 · 紫底涟漪</sub> | — / — / — | — / — / — | [抖音](https://www.douyin.com/video/7665677683182898484) · [小红书](https://www.xiaohongshu.com/explore/6a61ecf2000000001b01db20) |
| 4 | <img src="assets/covers/shortsell.jpg" width="72"/> | 07-24 | **什么是做空**<br/><sub>`shortsell` · 1:06 · 贴纸动画</sub> | — / — / — | — / — / — | [抖音](https://www.douyin.com/video/7666042017121602859) · [小红书](https://www.xiaohongshu.com/explore/6a6340710000000010027796) |
| 5 | <img src="assets/covers/bigfour0727.jpg" width="72"/> | 07-27 | **四巨头财报周前瞻**<br/><sub>`bigfour0727` · 5:18 · 紫底涟漪</sub> | — / — / — | — / — / — | [抖音](https://www.douyin.com/video/7667170894598507827) · [小红书](https://www.xiaohongshu.com/explore/6a6742d9000000001c012dc1) |
| 6 | <img src="assets/covers/hynix0728.jpg" width="72"/> | 07-28 | **韩股暴跌·海力士财报**<br/><sub>`hynix0728` · 1:20 · 紫底涟漪</sub> | — / — / — | — / — / — | [抖音](https://www.douyin.com/video/7667555575688858922) · [小红书](https://www.xiaohongshu.com/explore/6a68a11c000000000c0171ee) |
| 7 | <img src="assets/covers/skhynix0729.jpg" width="72"/> | 07-29 | **海力士史上最赚钱季度**<br/><sub>`skhynix0729` · 2:15 · 紫底涟漪</sub> | — / — / — | — / — / — | [抖音](https://www.douyin.com/video/7667836835464285486) · [小红书](https://www.xiaohongshu.com/explore/6a69a0f8000000001d02285d) |
| 8 | <img src="assets/covers/inflation.jpg" width="72"/> | 07-30 | **通货膨胀是什么**<br/><sub>`inflation` · 1:08 · 贴纸动画</sub> | — / — / — | — / — / — | [抖音](https://www.douyin.com/video/7668270799157071139) · [小红书](https://www.xiaohongshu.com/explore/6a6b2a7a000000002800630a) |
| 9 | <img src="assets/covers/leopold0731.jpg" width="72"/> | 07-31 | **Leopold 450亿爆仓**<br/><sub>`leopold0731` · 4:12 · 黑底+实拍开场</sub> | — / — / — | — / — / — | [抖音](https://www.douyin.com/video/7668642469067754790) · [小红书](https://www.xiaohongshu.com/explore/6a6c7cc20000000025017e8d) |
| 10 | <img src="assets/covers/spacexq2.jpg" width="72"/> | 08-04 | **SpaceX上市后首份财报**<br/><sub>`spacexq2` · 5:46 · 紫底涟漪</sub> | 162 / 5 / 0 | 3884 / 42 / 21 | [抖音](https://www.douyin.com/video/7670122038241037578) · [小红书](https://www.xiaohongshu.com/explore/6a71bf66000000003301e180) |
| 11 | <img src="assets/covers/pltr0805.jpg" width="72"/> | 08-05 | **Palantir财报暴涨30%**<br/><sub>`pltr0805` · 2:09 · 黑底点阵</sub> | 131 / 2 / 0 | 2799 / 30 / 15 | [抖音](https://www.douyin.com/video/7670511459692072233) · [小红书](https://www.xiaohongshu.com/explore/6a7321a5000000003400d780) |
| 12 | <img src="assets/covers/aapl0805.jpg" width="72"/> | 08-05 | **苹果告OpenAI·45年股价史**<br/><sub>`aapl0805` · 3:21 · 黑底点阵</sub> | 141 / 1 / 2 | 2073 / 20 / 5 | [抖音](https://www.douyin.com/video/7670552013830229286) · [小红书](https://www.xiaohongshu.com/explore/6a73466c000000003400db20) |
| 13 | <img src="assets/covers/shop0806.jpg" width="72"/> | 08-06 | **Shopify财报快评**<br/><sub>`shop0806` · 2:52 · 黑底点阵</sub> | 151 / 1 / 0 | 1567 / 11 / 6 | [抖音](https://www.douyin.com/video/7670896138253389083) · [小红书](https://www.xiaohongshu.com/explore/6a747f2b000000003300f209) |
| 14 | <img src="assets/covers/sixops.jpg" width="72"/> | 08-07 | **6个金融股票基础操作**<br/><sub>`sixops` · 4:51 · 贴纸动画</sub> | 8035 / 262 / 81 | 3768 / 90 / 70 | [抖音](https://www.douyin.com/video/7671193282898103595) · [小红书](https://www.xiaohongshu.com/explore/6a758db6000000002202cf32) |
| 15 | <img src="assets/covers/brk0810.jpg" width="72"/> | 08-10 | **伯克希尔Q2财报**<br/><sub>`brk0810` · 3:50 · 黑底点阵</sub> | 112 / 3 / 0 | 1688 / 21 / 7 | [抖音](https://www.douyin.com/video/7672371533318212890) · [小红书](https://www.xiaohongshu.com/explore/6a79bd50000000002500f610) |
| 16 | <img src="assets/covers/nvda0811.jpg" width="72"/> | 08-11 | **英伟达5000亿循环融资**<br/><sub>`nvda0811` · 2:54 · 黑底点阵·实拍开场</sub> | 1975 / 29 / 6 | 7084 / 62 / 50 | [抖音](https://www.douyin.com/video/7672722362931989810) · [小红书](https://www.xiaohongshu.com/explore/6a7afc580000000035015712) |
| 17 | <img src="assets/covers/indexetf.jpg" width="72"/> | 08-12 | **股票指数和ETF**<br/><sub>`indexetf` · 5:25 · 贴纸动画</sub> | 63 / 1 / 0 | 1942 / 35 / 20 | [抖音](https://www.douyin.com/video/7673106294231895348) · [小红书](https://www.xiaohongshu.com/explore/6a7c593e000000003300f9fb) |
| 18 | <img src="assets/covers/burry0813.jpg" width="72"/> | 08-13 | **大空头加仓做空Nebius**<br/><sub>`burry0813` · 3:28 · 黑底点阵·CRT</sub> | 155 / 2 / 1 | 1.4万 / 196 / 144 | [抖音](https://www.douyin.com/video/7673484810978954496) · [小红书](https://www.xiaohongshu.com/explore/6a7db1c5000000003400d9c8) |
| 19 | <img src="assets/covers/sndk0814.jpg" width="72"/> | 08-14 | **闪迪投资者日**<br/><sub>`sndk0814` · 2:42 · 黑底点阵</sub> | 111 / 1 / 0 | 1898 / 45 / 20 | [抖音](https://www.douyin.com/video/7673830436547693862) · [小红书](https://www.xiaohongshu.com/explore/6a7eec1a0000000028031b2e) |
| 20 | <img src="assets/covers/anthipo0817.jpg" width="72"/> | 08-17 | **Anthropic十月IPO**<br/><sub>`anthipo0817` · 4:34 · 黑底点阵</sub> | 136 / 1 / 0 | 6750 / 117 / 86 | [抖音](https://www.douyin.com/video/7674955970715454766) · [小红书](https://www.xiaohongshu.com/explore/6a82ebcc000000002202f80f) |
| 21 | <img src="assets/covers/baba0818.jpg" width="72"/> | 08-18 | **阿里财报前瞻**<br/><sub>`baba0818` · 1:51 · 黑底点阵</sub> | 268 / 4 / 0 | 1533 / 41 / 22 | [抖音](https://www.douyin.com/video/7675343912336248099) · [小红书](https://www.xiaohongshu.com/explore/6a844cad000000002202e9e2) |
| 22 | <img src="assets/covers/yushu0819.jpg" width="72"/> | 08-19 | **宇树上市首日暴涨**<br/><sub>`yushu0819` · 2:59 · 黑底点阵</sub> | 311 / 7 / 1 | 2472 / 29 / 12 | [抖音](https://www.douyin.com/video/7675696957876129034) · [小红书](https://www.xiaohongshu.com/explore/6a858d990000000025012ba8) |
| 23 | <img src="assets/covers/mrna0820.jpg" width="72"/> | 08-20 | **莫德纳单日涨177%**<br/><sub>`mrna0820` · 2:17 · 黑底点阵</sub> | 437 / 7 / 1 | 4396 / 48 / 34 | [抖音](https://www.douyin.com/video/7676066166518975786) · [小红书](https://www.xiaohongshu.com/explore/6a86dda200000000330084c7) |
| 24 | <img src="assets/covers/caibao101.jpg" width="72"/> | 08-24 | **财报如何影响股价（投教）**<br/><sub>`caibao101` · 4:27 · 米白手账</sub> | 8755 / 118 / 77 | 1294 / 32 / 30 | [抖音](https://www.douyin.com/video/7677543772825144576) · [小红书](https://www.xiaohongshu.com/explore/6a8c1cac000000002a02c4bd) |
| 25 | <img src="assets/covers/nvda0825.jpg" width="72"/> | 08-25 | **英伟达Q2财报前瞻**<br/><sub>`nvda0825` · 1:38 · 黑底点阵·CRT</sub> | 1275 / 22 / 3 | 5627 / 89 / 27 | [抖音](https://www.douyin.com/video/7677930562912357673) · [小红书](https://www.xiaohongshu.com/explore/6a8d7d99000000002503b1c7) |
| 26 | <img src="assets/covers/smartmoney0826.jpg" width="72"/> | 08-26 | **美股港股聪明钱**<br/><sub>`smartmoney0826` · 3:14 · 米白手账</sub> | 47.1万 / 1.2万 / 5449 | 2.5万 / 696 / 758 | [抖音](https://www.douyin.com/video/7678293878365080847) · [小红书](https://www.xiaohongshu.com/explore/6a8ec789000000000302a1be) |
| 27 | <img src="assets/covers/nvdahf0827.jpg" width="72"/> | 08-27 | **英伟达买AI界GitHub**<br/><sub>`nvdahf0827` · 1:48 · 黑底点阵</sub> | 5788 / 48 / 11 | 497 / 13 / 2 | [抖音](https://www.douyin.com/video/7678664058974899498) · [小红书](https://www.xiaohongshu.com/explore/6a90182e000000000502a6fe) |
| 28 | <img src="assets/covers/dividend0828.jpg" width="72"/> | 08-28 | **美股股息与分红（投教）**<br/><sub>`dividend0828` · 6:31 · 米白手账</sub> | 2211 / 102 / 34 | 2.1万 / 299 / 233 | [抖音](https://www.douyin.com/video/7679027675154959625) · [小红书](https://www.xiaohongshu.com/explore/6a91630b0000000020038017) |
| 29 | <img src="assets/covers/earnwk0901.jpg" width="72"/> | 08-31 | **本周财报前瞻（博通戴尔）**<br/><sub>`earnwk0901` · 3:45 · 黑底点阵</sub> | 7981 / 60 / 27 | 1226 / 17 / 7 | [抖音](https://www.douyin.com/video/7680171627069459763) · [小红书](https://www.xiaohongshu.com/explore/6a95738a0000000005028031) |
| 30 | <img src="assets/covers/druck07.jpg" width="72"/> | 09-01 | **德鲁肯米勒30年不亏**<br/><sub>`druck07` · 4:08 · 米白手账</sub> | 1.2万 / 223 / 112 | 2256 / 65 / 84 | [抖音](https://www.douyin.com/video/7680531304831667483) · [小红书](https://www.xiaohongshu.com/explore/6a96bab2000000002600b2f1) |
| 31 | <img src="assets/covers/vix0902.jpg" width="72"/> | 09-02 | **VIX恐慌指数（投教）**<br/><sub>`vix0902` · 4:52 · 米白手账</sub> | 6.1万 / 1018 / 555 | 4925 / 88 / 61 | [抖音](https://www.douyin.com/video/7680902300176600326) · [小红书](https://www.xiaohongshu.com/explore/6a980bfd000000002603386c) |
| 32 | <img src="assets/covers/rongduan0903.jpg" width="72"/> | 09-03 | **美股熔断（投教）**<br/><sub>`rongduan0903` · 2:53 · 米白手账</sub> | 11.4万 / 1159 / 292 | 4631 / 51 / 26 | [抖音](https://www.douyin.com/video/7681257457259220239) · [小红书](https://www.xiaohongshu.com/explore/6a994f090000000026019084) |
| 33 | <img src="assets/covers/zaojia0904.jpg" width="72"/> | 09-04 | **财报造假三信号（投教）**<br/><sub>`zaojia0904` · 5:46 · 米白手账</sub> | 1.2万 / 185 / 93 | 2176 / 20 / 13 | [抖音](https://www.douyin.com/video/7681625528922672435) · [小红书](https://www.xiaohongshu.com/explore/6a9a9ddc00000000280330eb) |
| 34 | <img src="assets/covers/anthipo0907.jpg" width="72"/> | 09-07 | **Anthropic IPO深度（上）**<br/><sub>`anthipo0907` · 8:25 · 米白手账</sub> | 5554 / 62 / 35 | 4175 / 107 / 71 | [抖音](https://www.douyin.com/video/7682745430966308131) · [小红书](https://www.xiaohongshu.com/explore/6a9e985c0000000028032ca1) |
| 35 | <img src="assets/covers/soxbounce0908.jpg" width="72"/> | 09-08 | **芯片股反弹三把尺子**<br/><sub>`soxbounce0908` · 9:13 · 米白手账</sub> | 2.5万 / 331 / 112 | 900 / 19 / 13 | [抖音](https://www.douyin.com/video/7683122781717925171) · [小红书](https://www.xiaohongshu.com/explore/6a9fefd90000000026009d4b) |
| 36 | <img src="assets/covers/govstake0909.jpg" width="72"/> | 09-09 | **美国政府持仓英特尔**<br/><sub>`govstake0909` · 7:21 · 米白手账</sub> | 6.9万 / 771 / 194 | 174 / 7 / 1 | [抖音](https://www.douyin.com/video/7683465942864547081) · [小红书](https://www.xiaohongshu.com/explore/6aa127900000000026038663) |
| 37 | <img src="assets/covers/apple0910.jpg" width="72"/> | 09-10 | **苹果发布会魔咒（投教）**<br/><sub>`apple0910` · 1:58 · 米白手账</sub> | 9669 / 114 / 25 | 552 / 18 / 10 | [抖音](https://www.douyin.com/video/7683843609967299890) · [小红书](https://www.xiaohongshu.com/explore/6aa27eef000000002901555a) |
| 38 | <img src="assets/covers/spx0911.jpg" width="72"/> | 09-11 | **进标普500是利好还是见光死（投教）**<br/><sub>`spx0911` · 4:51 · 白板马克笔</sub> | 617 / 19 / 5 | — / — / — | [抖音](https://www.douyin.com/video/7684234024776142090) |
| 39 | <img src="assets/covers/cpi0914.jpg" width="72"/> | 09-14 | **CPI与议息：通胀新低却可能加息（投教）**<br/><sub>`cpi0914` · 6:14 · 纪录片胶片</sub> | 1.9万 / 97 / 29 | — / — / — | [抖音](https://www.douyin.com/video/7685700536565304586) |
| 40 | <img src="assets/covers/predmkt0916.jpg" width="72"/> | 09-16 | **预测市场加息定价（投教）**<br/><sub>`predmkt0916` · 5:19 · 纪录片胶片</sub> | 1.3万 / 94 / 31 | — / — / — | [抖音](https://www.douyin.com/video/7686101994079112457) |
| 41 | <img src="assets/covers/midterm0917.jpg" width="72"/> | 09-17 | **中期选举规律与美联储加息（投教）**<br/><sub>`midterm0917` · 6:52 · 侦探线索板</sub> | 14.1万 / 2776 / 1530 | — / — / — | [抖音](https://www.douyin.com/video/7686470616605576474) |
| 42 | <img src="assets/covers/witching0918.jpg" width="72"/> | 09-18 | **美股四巫日（投教）**<br/><sub>`witching0918` · 5:03 · 线索板·蓝图色</sub> | 1030 / 22 / 5 | — / — / — | [抖音](https://www.douyin.com/video/7687462341826383155) |
| 43 | <img src="assets/covers/oura0924.jpg" width="72"/> | 09-24 | **Oura 上市：73% 是老股东在卖（投教）**<br/><sub>`oura0924` · 5:06 · 俯拍拆解台</sub> | 3288 / 31 / 9 | — / — / — | [抖音](https://www.douyin.com/video/7689021966082198799) |
| 44 | <img src="assets/covers/be0924.jpg" width="72"/> | 09-24 | **Bloom Energy 六周涨 70%**<br/><sub>`be0924` · 5:06 · 黑底点阵竖版</sub> | 872 / 14 / 5 | — / — / — | [抖音](https://www.douyin.com/video/7689052096422874403) |

</details>

---

## 🧭 它怎么工作（7 步，第 4 步是硬闸门）

```
选题/音频 ──▶ ① 脚本（风格库 A–J + 格式节拍）──▶ ② 音频（去气口 1.3x · SenseVoice 转写 · token 级对齐）
          ──▶ ③ 决策引擎 decide.md：内容画像 8 维 → 格式 × 皮肤 × 主技术 × 平台规格；每句口播 → 画面功能 → 手法
          ──▶ ④ 文字分镜表（⛔ 给用户过目，点头才写代码）
          ──▶ ⑤ Remotion 工程：skins/<id>/kit.jsx 契约皮肤 + motionkit 组件
          ──▶ ⑥ QC：frame 0 封面 → cover_diff 查重 → overlap-check 排版 → pace_check 节奏 → 审片卡（干净上下文 subagent 打分）→ <100MB 硬码率渲染
          ──▶ ⑦ 交付包（标题 / 封面 / 简介 / 社群文案 / 平台差异）+ 发布后 retention_curve.py 把完播曲线分成 开场漏 / 断崖 / 匀速 三类回写规则
```

### 决策引擎（`agent/decide.md`）——"自主判定什么内容配什么剪辑手法"

| 层 | 输入 | 输出 |
|---|---|---|
| 内容画像 | 意图 / 时效 / 抽象度 / 数据形态 / 主角 / 可得素材 / 情绪 / 平台 | 8 个标签 |
| 整片决策 | 画像 | **格式**（20 种，`craft/formats.md`）× **皮肤**（`craft/skins.md`，按台账避开最近 2 条用过的）× **主技术**（实拍 / 数据可视化 / MG 推演 / 3D / 贴纸 / 录屏 / AI 生成，1 主 + ≤2 辅）× 画布 / 时长 / 结尾 |
| 镜头决策 | 每句口播 | **画面功能**（认人 / 砸数 / 看变化 / 比大小 / 看构成 / 讲机制 / 追流向 / 给证据 / 转折 / 情绪 / 品牌位 / 结论）→ 具体手法；相邻同功能必须换手法，转场必须写明"带过去的元素" |

### 20 种格式（`agent/craft/formats.md`）

突发快评 · 悬案复盘 · 倒数榜单 · 误区 vs 真相 · 对决 · 一个数字讲透 · 时间线 · 情景推演 · 60 秒看懂 · 数据赛跑 · 财报红绿灯 · 拆解 · 双人问答 · 原声拆解 · 评论区提问 · 第一视角 · 钱往哪流 · "我是 XX"拟物剧场 · 现实↔内部世界穿越 · 问错 vs 问对。每种带节拍时间、视觉语法、留存装置、适配题材与合规提示。

---

## 🎭 7 套视觉皮肤（同一份分镜，换一行 import）

<p align="center"><img src="assets/skins_overview.jpg" alt="4 new skins" width="100%"/></p>

| 皮肤 | 目录 | 一句话 | 签名动效 |
|---|---|---|---|
| 数据终端 terminal | `skins/terminal` | 近黑 + 琥珀网格 + 扫描线 + 行情带 | 逐列显影 + 光标；数字乱码锁定；扫描光带转场 |
| 瑞士网格 swiss | `skins/swiss` | 暖白 + 显式 12 栏 + 粗黑线 | 文字从基线遮罩升起；紫下划线擦出；竖条百叶 |
| 液态玻璃 glass | `skins/glass` | 偏紫近黑 + 单光源 + 磨砂玻璃面板 | 模糊→对焦；玻璃横扫转场 |
| 新粗野 brutal | `skins/brutal` | 奶油底 + 5px 黑描边 + 硬投影 | 实体贴片砸入两次弹跳；三色条横推 |
| 界面动效 uimotion | `skins/uimotion` | 按幕整块换底 + 界面当道具 + 贴纸字 + 常驻小伙伴 | 光标 / 开关 / 选框；上一场缩成卡片；斜向色块扫入 |
| 黑底点阵 black-dotgrid | `skins/black-dotgrid` | 近黑 + 紫点阵漂移光晕（投研线老默认） | CRT 雪花电视、Glitch、WindOutline、趣味层 |
| 分析师手账 paper | `skins/paper` | 米白纸 + 墨字 + 荧光笔 + 印章 | 纸卡拍落、拍立得、翻页转场 |

每套 `kit.jsx` 实现同一组导出（`Backdrop / Enter / Headline / Hero / Label / Delta / Mark / Stamp / Panel / Photo / DateMark / ChapterMark / Wipe / Disclaimer`，契约见 `skins/README.md`），`skins/_showcase` 用同一份三拍分镜渲每套样张。另有 5 套在成片里用过、尚未契约化的皮肤（白板马克笔 / 纪录片胶片 / 侦探线索板 / 俯拍拆解台 / 贴纸动画）和 7 套候选，见 `agent/craft/skins.md`。

---

## 🧰 motionkit：动效 / 3D / MG / 音效 / 字体

<p align="center"><img src="assets/3d_mg_overview.jpg" alt="3D and MG" width="100%"/></p>
<p align="center"><img src="assets/ui_motion_overview.jpg" alt="UI props, acts, buddy" width="100%"/></p>

| 模块 | 内容 |
|---|---|
| `type.js` | 字体系统：`useFonts()` + `T.<key>` + 8 组配对 `PAIRS` + 投放安全组 `PAIRS_AD`；每款字体带许可 `tier`（见 `public/fonts/README.md`） |
| `camera.jsx` | `Camera` 缓推 / 平移 / 漂移 · `Punch` 重音冲击 · `Parallax` 纵深 · `useWhip` 快甩——兜底"任何元素静止不超过 2 秒" |
| `seams.jsx` | `Shot`：cut-the-curve / zoom-through / pull / rise 接缝（上一场加速离开、下一场同向减速进来）· `LeakAt` 官方 WebGL 光漏 |
| `acts.jsx` | `ColorFlood` 按幕整块换底 · `Carry` 共享元素跨场景 · `NestZoom` 上一场缩成下一场的一张卡 |
| `uiprops.jsx` | `Cursor / SelectionBox / Toggle / ChatBubble / StickerPill / OrbitRing`——界面当道具（抽象，不是截图） |
| `buddy.jsx` | `BobbyBuddy` 常驻小伙伴（icon + 气泡字幕） |
| `mg.jsx` | `Morph` 图形变形 · `Burst` 放射线 · `Ring` 环形占比 · `FlowLine` 流动线 · `KineticWords` 逐词动态字 · `LiquidReveal` 液态揭示 · `LottieClip` |
| `finance.jsx` | `Candles` K 线逐根生长（涨绿跌红）· `SplitFlap` 机场翻牌数字 |
| `sfx.jsx` | `SfxTrack` 音效轨（按峰值对齐切点）；`public/sfx/` 7 种音效由 `scripts/tools/make_sfx.py` **程序合成**，零版权 |
| `three/` | `ThreeStage` 外壳 · `Number3D` 立体数字 · `Coin3D` · `IsoCity3D` 等距数据城市 · `Particles3D` 粒子聚合 · `Card3D` · `Bars3D` · `Globe3D`（渲染加 `--gl=angle`） |
| 老组件 | `DotGridBackdrop / KenBurns / DrawSVG / enter·exit presets / BobbyCallout` |

每个模块都有可渲的 demo：`motionkit/demo-type · demo-fin · demo-mg · demo3d-v2 · demo-ui`。

<p align="center"><img src="assets/type_specimen.jpg" alt="type specimen" width="60%"/></p>

---

## 🔬 QC 与数据回流脚本（`agent/scripts/`）

| 脚本 | 做什么 |
|---|---|
| `transcribe_ts.py` / `align_tokens.py` | VAD + SenseVoice 带时间戳转写；token 级切点对齐（匹配度 1.00 才用） |
| `pace_check.py` | 成片**视觉节奏体检**：每 10 秒视觉事件数、>2 秒静止段、整 5 秒空窗、frame 0 信息量；5 分钟片约 5 秒跑完 |
| `cover_diff.py` | **首帧查重**：pHash + 色调直方图 + 4×4 布局指纹，和历史封面存档比相似度（回测抓出了 07 月被平台判"批量同质化"的那一对：相似度 1.000） |
| `retention_curve.py` | 发布后导入完播曲线：拆成**开场漏 / 断崖 / 匀速**三类，断崖处列出口播原话和画面事件密度 |
| `beat_grid.py` | 音乐版（TikTok / Shorts / YT / 投放）：BPM + 强拍帧，切点吸附强拍，位移 >0.6s 报警（多先验打分，避开 librosa 倍频歧义） |
| `broll_fetch.py` / `depthflow_animate.py` | B-roll 四源搜采 + 台账防复用 + 2.5D 视差运镜 |
| `make_subs.py` / `overlap-check.mjs` / `qc-stills.mjs` | 烧录字幕；逐帧扫重叠出框；批量抽帧 |

---

## 🚀 使用

```bash
git clone https://github.com/wcy4213/voiceover-motion-video.git video-agent
cd video-agent

# 1) 作为 Claude Code skill
ln -s "$(pwd)/agent" ~/.claude/skills/video-agent     # agent/SKILL.md 是入口
pip install funasr soundfile librosa numpy pillow      # 转写 / 节奏体检 / 查重 / 节拍
brew install ffmpeg

# 2) 引擎：把 motionkit/ skins/ public/ 放进你的 Remotion 4.0.438 工程（或直接用 template/）
pnpm add remotion@4.0.438 @remotion/{cli,noise,paths,shapes,transitions,motion-blur,three,light-leaks,captions,lottie}@4.0.438 \
  three@0.185 @react-three/fiber@9 @react-three/drei@10 three-globe lottie-web
bash public/fonts/fetch_fonts.sh                         # 下载未随仓库分发的字体（见 public/fonts/README.md）

# 3) 渲样张
REMOTION_ENTRY_POINT=./skins/_showcase/index.jsx npx remotion still ./skins/_showcase/index.jsx Showcase-terminal out/t.png --frame=130 --gl=angle
```

然后在 Claude Code 里：

> 做一条「美联储降息 25bp 美股反跌」的抖音 75 秒视频

agent 会先给**内容画像 + 制作单 + 文字分镜表**（格式 / 皮肤 / 主技术 / 每句画面功能与接缝），你点头后才搭工程。

> **Remotion 版本**：所有组件按 4.0.438 写；`agent/` 里引用的官方 `remotion-best-practices` skill 请钉在与你版本匹配的 commit（HEAD 面向 4.0.5xx，含旧版没有的 API）。

---

## 📁 仓库结构

```
video-agent/
├── agent/                       # Claude Code skill（入口 SKILL.md）
│   ├── SKILL.md                 # 7 步流程 + 制作单模板 + 文件索引
│   ├── decide.md                # 决策引擎：内容画像 → 格式/皮肤/技术 → 每句镜头手法
│   ├── techniques.md            # 技术工具箱：MG / 3D / 2.5D / 实拍 / AI 生成 / 音效 / 字体
│   ├── expand.md                # 题材同心圆 · 输入/输出途径 · 节目化 · 抖音 AI vibe 视频调研结论
│   ├── craft/                   # formats 20 种 · retention 留存手册 · art-direction 美术指导 · skins 皮肤库+台账 · fonts-license
│   ├── pipelines/motion/        # 口播→动效片全流程 · design-system（品牌 tokens/首帧规范/踩坑）· remotion-workflow · broll · 3D 手册
│   ├── pipelines/sticker/       # 贴纸角色片流程
│   ├── script/                  # 财经口播脚本风格库 A–J + 博主风格包（语料不分发）
│   ├── rules/requirements.md    # 内部硬规则清单的占位说明
│   └── scripts/                 # 转写/对齐/节奏体检/封面查重/完播曲线/节拍/B-roll/字幕/排版 QC
├── motionkit/                   # 共享组件库（见上表）+ 各 demo
├── skins/                       # 7 套契约皮肤 + _showcase 样张工程
├── public/{fonts,sfx,logos}     # OFL 字体 + 自合成音效 + 示例品牌 logo
├── scripts/tools/               # ttf2typeface（3D 字体）· make_sfx（音效合成）
├── template/                    # 独立可跑的最小 Remotion 工程（初代示例，旧紫底皮肤）
└── assets/                      # README 配图 · 44 支成片封面 · videos.json
```

---

## 🔁 迭代记录

**v5 · 2026-10-08 — 合并成一个 agent，补决策层、审美层、3D/MG/音效、节奏与封面 QC，接入 GitHub 视频审美 skill**

- 6 个分散 skill（动效片 / 贴纸片 / 硬规则清单 / 脚本风格包 ×3 / 总导演）合并为 `video-agent` 单一入口；新增**决策引擎**（内容画像 8 维 → 格式 × 皮肤 × 技术 → 每句画面功能 → 手法），不再靠人指定"做成什么样"
- **格式库 20 种**、**留存手册**（三层钩子 / 开环 / 0-25-50-75% 刺激时钟 / 回环 / 互动机制，附出处与自家实测）、**美术指导**（AI 默认审美黑名单、缓动与错峰数值、切点法、审片卡）
- **5 套契约皮肤**（terminal / swiss / glass / brutal / uimotion）+ 皮肤契约与样张工程；**字体系统** 19+ 款展示字体打包、逐款许可核验（没有一款是 CC0，投放版有 OFL 安全组）
- **motionkit 扩充**：镜头层 / 切点层 / 幕间（换底 · 共享元素 · 缩成卡片）/ 界面道具 / 常驻小伙伴 / MG 动画 / K 线与翻牌 / 3D（立体数字 · 硬币 · 数据城市 · 粒子 · 3D 卡片）/ 自合成音效
- **QC 新三件**：`pace_check`（视觉节奏）· `cover_diff`（首帧查重）· 审片卡（干净上下文 subagent 打分，不自评）；发布后 `retention_curve` 把完播曲线分三类回写规则；音乐版 `beat_grid` 切点吸强拍
- 接入 GitHub 技能：官方 `remotion-dev/skills`（钉 4.0.437）、`disney-animation-rule-skill`、`remotion-3d-ticker`；参考并改写了 hyperframes / motionmaxxing / video-shotcraft / LottieFiles 的动效法则（原文未分发，许可见 `agent/craft/vendor` 说明）
- 调研：抖音「AI vibe 视频」585 条 + 27 条逐帧拆解——"AI × 财经动画"是空赛道；互动来自设计不来自剪辑速度；拟物剧场 / 现实↔内部穿越 / 问错 vs 问对 三种格式由此而来
- 对标一支 Figma 风格 AI 生成动态广告：补上"转场从内容里长出来""按幕换底""常驻吉祥物""界面当道具"四件事（`acts.jsx` / `uiprops.jsx` / `buddy.jsx` / `skins/uimotion`）

**v4 · 2026-09-02** — 黑底点阵 / 分析师手账两套皮肤、motionkit 共享库（含 3D 层）、烧录字幕管线、排版自动质检、实拍开场模板、免责水印常驻
**v3 · 2026-07-24** — 首帧/封面防同质化规范（被平台判"批量发布"限流后的硬迭代）、B-roll 实拍素材管线与版权红线
**v2 · 2026-07-22** — 转场分层级、字幕安全区、文字上限、入场过冲 ≤1.3、ExecQuote 高管出场
**v1 · 2026-07-21** — 转写 → 分镜 → 确认 → Remotion → 抽帧 → 渲染 六步流程成型，首支成片 3'08"

---

## 📦 依赖与许可

- **转写 / QC**：Python 3.10+（`funasr soundfile librosa numpy pillow`），ffmpeg；SenseVoice 模型首次运行自动下载（~1GB）后全离线
- **渲染**：Node ≥ 18，Remotion 4.0.438；3D 场景加 `--gl=angle`；成片 <100MB 用硬码率公式 `floor(95×8000/秒) − 332` kbps
- **字体**：仓库只随附 SIL OFL 字体；其余从官方渠道下载（`public/fonts/fetch_fonts.sh`）。逐款许可结论见 `agent/craft/fonts-license.md`
- **音效**：`public/sfx/` 为程序合成，MIT 随仓库分发；BGM 建议发布时用平台曲库
- **第三方**：Remotion 对营利组织有 Company License 要求，请自行确认；成片用到的实拍素材只取无水印的官方 / 公有领域 / 可商用图库来源
- 代码与文档 [MIT](LICENSE)

## 🙌 Credits

由 [Claude Code](https://claude.com/claude-code) 全程构建。ASR：[FunASR / SenseVoice](https://github.com/modelscope/FunASR) · 视频引擎：[Remotion](https://remotion.dev) · 3D：[three.js](https://threejs.org) / [three-globe](https://github.com/vasturiano/three-globe) · 节拍：[librosa](https://librosa.org) · 动效法则参考：[remotion-dev/skills](https://github.com/remotion-dev/skills) · [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) · [Tejashmakwana/motionmaxxing](https://github.com/Tejashmakwana/motionmaxxing) · [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) · [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) · [vibe-motion/skills](https://github.com/vibe-motion/skills)
