# 字体许可登记（2026-10-08 逐款核验）

> 方法：fontTools 读每个文件 name 表（版权 id0 / 商标 id7 / 许可 id13–14）→ 对照官方出处原文。核验底稿在当日会话 scratchpad（names.txt / misans.txt / sonoma.txt / api_*.json）。
> **结论先说：没有一款是 CC0。** 中文字体通行的开源许可是 SIL OFL 1.1；唯一自称 CC0 的"凤凰点阵体"字模来源有问题，不用。
> 视频/广告用途：表里所有字体都可以商用。差别在打包、署名、能否转格式。
> 代码里的分级：`motionkit/type.js` 每款字体的 `tier`（ofl / vendor / cond）。

## 工程内字体（`./public/fonts/`）

| 键 | 字体 | 许可 | tier | 视频/广告 | 打包进私有工程 | 条件 | 官方出处 |
|---|---|---|---|---|---|---|---|
| smiley | 得意黑 | OFL 1.1 | ofl | ✅ | ✅ | 不单独卖；改了要改名 | github.com/atelier-anchor/smiley-sans |
| sourceH/B/M/R | 思源黑体 SC | OFL 1.1 | ofl | ✅ | ✅ | 同上 | github.com/adobe-fonts/source-han-sans |
| fengya | 猫啃网风雅宋 | OFL 1.1 | ofl | ✅ | ✅ | 同上 | github.com/maoken-fonts/fengyasong |
| kuaile | 站酷快乐体 | OFL 1.1（Google Fonts 版） | ofl | ✅ | ✅ | 同上 | github.com/google/fonts/tree/main/ofl/zcoolkuaile |
| montB / playfair / abril / oswald / jbmono | Montserrat / Playfair / Abril Fatface / Oswald / JetBrains Mono | OFL 1.1 | ofl | ✅ | ✅ | 同上 | Google Fonts / 各自 GitHub |
| harmony | HarmonyOS Sans Black | 华为 HarmonyOS Sans 字体许可 | vendor | ✅（明文允许作品分发/出售） | ✅（明文允许 embed/bundle） | 不得修改、不得单独分发；软件内要注明；可撤销。**纯西文无中文** | openharmony/resources LICENSE_Fonts |
| misans | MiSans Heavy | 小米 MiSans 知识产权许可协议 | vendor | ✅（明文允许宣传物料） | ✅ | 不得改编；软件内注明；可撤销；中国法 | hyperos.mi.com MiSans 协议 PDF |
| puhui | 阿里巴巴普惠体 3.0 | 阿里法律声明 | vendor | ✅ | ✅ 私用 | **不得转换/拆分（子集化、转 woff2 都算）**、不得删版权、不得暗示阿里背书 | 阿里普惠体官方语雀 |
| shuhei / dakai | 阿里妈妈数黑体 / 东方大楷 | 阿里妈妈法律声明 | vendor | ✅ | ✅ | 同普惠体。本地是旧版（1.000/1.002），版权信息完整 | 阿里妈妈字体语雀 |
| gaoduan / wenyi | 站酷高端黑 / 站酷文艺体 | 站酷"免费授权全社会使用（含商用）" | vendor | ✅ | 声明未提及 | 无书面条款 | zcool.com.cn/special/zcoolfonts |
| fangyuan | 阿里妈妈方圆体 | 阿里妈妈法律声明（加强版） | cond | ✅ | ✅（允许嵌入） | **须标注版权方"阿里妈妈"** → 用了就在视频简介加一行：`字体：阿里妈妈方圆体` | 阿里妈妈字体语雀 |
| jinbu | 钉钉进步体 | 钉钉法律声明 | cond | ✅ | ⚠️ | **不得"上传、发布、转载"字体文件** → 已加 `.gitignore`，工程不推远程仓库 | 钉钉官方语雀（需登录，条文取自转载全文） |
| youshe | 优设标题黑 | 优设官方声明 | cond | ✅（明文含影视字幕/片头） | ⚠️ | 全媒体授权**不含嵌入**：只渲染视频，不做成对外网页/App | uisdc.com/uisdc-first-free-font |
| pangmen | 庞门正道标题体免费版 | 庞门正道公众号声明 | cond | ✅ | ⚠️ | 不得嵌入系统/软件/游戏；**公众号原文未核实** | 公众号原文（验证码挡住） |

**已撤下**：淘宝买菜体（`TaobaoMaiCaiTi.ttf`）——本地文件被第三方改过（family 名变成 "_____"、缺 GDEF 表），与官方文件不一致，且须标注版权方；用 `kuaile`（站酷快乐体，OFL）替代。需要时从 fonts.alibabagroup.com 官方渠道重新下载并在简介署名。

**来源**：多数文件拷自字由（HelloFont）缓存。许可跟版权方走，字由只是渠道；普惠体 3.0、钉钉进步体与官方逐字节一致；优设标题黑本就是优设 × 字由联合发布。字由客户端自身用户协议未核实——**建议后续从官方渠道重下一遍，许可原文放进 `public/fonts/LICENSES/`**（OFL 四份已放）。

## macOS 系统字体（苹方 / DIN / Menlo / Futura / Didot / Avenir Next Condensed / 宋体 SC / Marker Felt）

- Apple 软件许可（Sonoma §2.E）："you may use the fonts … to display and print content while running the Apple Software; however, you may only embed fonts in content if that is permitted by the embedding restrictions accompanying the font."
- 解读：在本机把文字渲染成视频像素，按常规理解属于 display/print 输出，**自然流量视频风险低**；但协议**没有明文授权商业广告投放**，且字体版权多属第三方（苹方=华康 DynaComware、宋体=常州华文、DIN/Didot/Avenir=Linotype、Futura=Neufville/Bauer）。
- 规则：
  1. **付费投放版（TikTok 推广、DOU+、信息流广告）不用系统字体**，用 `PAIRS_AD`（全 OFL + 华为/小米）。
  2. 系统字体文件**不得拷出本机**（不进仓库、不上 Remotion Lambda/云渲染）。
  3. 正片默认展示字体走 `PAIRS`（工程内字体），苹方只做正文兜底。

## 操作规则

- 新增字体：先查许可 → 写进本表 → `type.js` 填 `tier`/`license` → 渲样张（`motionkit/demo-type`）。
- **vendor / cond 字体不做子集化、不转 woff2、不转 three.js typeface JSON**（阿里系明文禁止"转换、拆分"）。3D 字只用 OFL 字体转（当前：Montserrat Black）。
- 用了 `fangyuan` → 简介加署名行；用了 `jinbu` → 工程不推远程。
- 交付包尾注可选加一行：`字体：<本片用到的字体>（许可已核）`。
