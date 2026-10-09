# 皮肤注册表 + 轮换台账

> 皮肤 = 底 + 字体配对 + 色板 + 质感 + 签名入场 + 转场 + 封面构图。**换皮肤是让"这条和上条肉眼不同"最便宜的手段**，比换封面有效（memory: invest-edu-whiteboard-skin）。
> 选皮肤顺序：① 题材 → 适配的皮肤候选；② 查下方台账，**排除最近 2 条同线别用过的**；③ 用户说"和上次一样/参考 XX"时直接复用，不换。

## A. 新皮肤（2026-10-08 起，契约化，可直接 `cp -r skins/<id> <slug>/skin`）

位置 `./skins/<id>/kit.jsx`，全部实现同一组导出（契约见 `skins/README.md`），样张 `out/stills/skins/<id>_f{0,130,250}.png`。

| id | 中文名 | 底 | 字体配对（motionkit/type.js） | 签名动效 | 适配题材 |
|---|---|---|---|---|---|
| `terminal` | 数据终端 | 近黑 #07090A + 60px 琥珀细网格 + 扫描线 + 顶部行情带 | 站酷高端黑 / Menlo / DIN Condensed | 逐列显影 + 方块光标；数字**乱码滚动后锁定**；扫描光带转场；反白色块强调 | 宏观数据、财报、资金流、异动榜、突发 |
| `swiss` | 瑞士网格 | 暖白 #F1EEE7 + 显式 12 栏网格 + 粗黑分隔线 | 思源黑体 Heavy / HarmonyOS Black | 文字**从基线遮罩升起**（expo out）；紫色粗下划线擦出；12 竖条百叶转场 | 投教方法论、数据解读、对比、排名 |
| `glass` | 液态玻璃 | 偏紫近黑 #0B0A10 + 左上冷顶光 + 一团很淡的品牌紫地光（10-08 已去掉紫→青渐变，不在 AI 默认审美黑名单内） | MiSans Heavy / 普惠体 / HarmonyOS Black | **模糊→对焦**入场；高光扫过；全屏玻璃横扫转场 | AI/科技、新产品、IPO、高端品牌 |
| `brutal` | 新粗野 | 奶油底 #FFF4D6 + 圆点网 + 角落几何色块 | 优设标题黑 / 得意黑 / 思源黑体 Bold | 实体贴片**砸入 + 两次弹跳**；5px 黑描边 + 硬投影；三色条横推转场 | 投教轻松题、榜单盘点、误区、梗图式对比 |

| `museum` | 暗夜金博物馆 | 深棕 #14110D / 藏青 #0E1420 + 昏黄顶光 + 纸纹颗粒 + 四角细金框 | 风雅宋 + Playfair Black 数字（kit 自带） | 金色显影入场 · 纸卡 3D 翻入 · 年份 HUD · 文献角标 · 金线横扫转场 | 横屏无口播知识短片线（F21/F22/F23）、历史/编年史、投教概念；10-09 三支 vibe知识大赏 首用 |
| `uimotion` | 界面动效 | 按幕整块换底（米白 / 橙 / 紫 / 绿，ColorFlood 斜扫）+ 细圆点 | 数黑体 / 普惠体 / HarmonyOS Black | 贴纸标签弹出 · 光标/开关/选框当道具 · 上一场缩成卡片 · 常驻 BobbyBuddy | AI / 产品 / 工具教学 / F20 问错问对 / 海外投放（小红书版去掉 Buddy） |

**字体**：每套 kit 文件头的 `F` 就是该皮肤的字体配对，制作单「字体」一行直接写 `skins/<id> 自带`；老皮肤和自定义组合才用 `PAIRS.<x>`（terminal ≈ PAIRS.terminal）。付费投放版换成 `PAIRS_AD`。
**强调色**：皮肤自己的强调色只有一个（terminal 琥珀 / swiss 品牌紫 / glass 品牌黄 / brutal 品牌紫）；品牌黄（全片关键 1–2 处）与 Bobby 紫（Bobby 位）是品牌规定，不计入"唯一强调色"。
**浅底皮肤的封面**：§1.5.1 的 leopold 式全幅实拍是深底模板；浅底皮肤按投教纸面线规则——实拍收进窗口（拍立得 / 网格格子 / 玻璃卡片），frame 0 仍要日期 + 真人 + 大标题 + 硬数字。

写新皮肤：抄 `skins/terminal/kit.jsx` 改实现不改导出名 → 在 `skins/_showcase/Root.jsx` 的 KITS 里登记 → 渲三张样张 → 补进本表。

## B. 老皮肤（散落在各工程里，起新片从最新那条复制）

| 皮肤 | 最新工程（抄这个） | 组件库 | 画布 | 用过的片（台账） |
|---|---|---|---|---|
| 黑底紫点阵（投研） | `be0924`（竖）/ `nvda0825`（1084×884） | `components/{ui,fun,helpers,Exec,Fx,TickerChip}.jsx` + `motionkit/DotGridBackdrop` | 1084×884 或 1080×1440 | 投研热点线几乎全部（07-23→09-24） |
| 紫底涟漪（已弃） | `googleq2` | `components/Backdrop.jsx` | 1:1 | 07-21/22 财报周 |
| 米白手账 | `soxbounce0908` / `govstake0909` | `components/paper.jsx` | 1080×1440 | 投教 #1–14 |
| 白板马克笔 | `spx0911` | `components/{paper,icons}.jsx`（同名换肤） | 1080×1440 | #15 标普纳入 |
| 纪录片胶片 | `predmkt0916`（最新）/ `cpi0914` | `components/paper.jsx`（含 FilmGate/Weave/Slate/Lower3） | 1080×1440 | #16 CPI、#17 预测市场 |
| 侦探线索板 | `midterm0917` | `components/board.jsx` | 1080×1440 | #18 中期选举 |
| 线索板·蓝图色 | `witching0918` | `components/board.jsx`（cork=#123B63 深蓝） | 1080×1440 | #20 四巫日 |
| 俯拍拆解台 | `oura0924` | `components/desk.jsx` | 1080×1440 | #21 Oura IPO |
| 黑底点阵竖版+官方实拍开场 | `be0924` | 同投研 | 1080×1440 | #22 BE |
| 贴纸动画 | `<sticker-repo>/remotion`（流程见 `pipelines/sticker/README.md`） | `components/Stage.jsx` | 1080×1440 | Bobbie/Rich 系列 |
| CRT 老录像嵌实拍 | `nvda0825` | `components/Fx.jsx` CRT/Glitch | 1084×884 | 局部用 |
| 折线滚动 | `<workspace>/stock-line-video` | agent.py | — | 单标的走势片 |

⚠️ **字体坑（2026-10-08 样张实测）**：`spx0911 / midterm0917 / witching0918 / oura0924(_yt) / dividend0828` 的 theme 写了 `"Hannotate SC"`（手札体），本机**没装**，一直静默回退成 PingFang。复用这些皮肤时把手写字体换成 `T.kuaile`（淘宝买菜体）或 `T.wenyi`（站酷文艺体），见 `motionkit/type.js`。

## C. 候选皮肤（还没做，用户说"换个没用过的"时从这里提）

| 名字 | 一句话 | 适配 |
|---|---|---|
| 新粗野 Neo-brutal | 平涂亮色块 + 5px 黑描边 + 硬投影（10px 10px 0 #000）+ 弹跳；得意黑/优设标题黑 | 投教轻松题、榜单、梗图式对比 |
| 杂志 Editorial | 鲑鱼粉/象牙底 + 风雅宋大标题 + Playfair 数字 + 细线栏、首字下沉、双色调照片 | 人物传记、深度复盘、商业故事 |
| 网点印刷 Risograph | 双色套印错位 + 网点半调 + 纸纹；照片转 2 色 halftone | 历史/周期题、怀旧对比 |
| 等距沙盘 Isometric | 2.5D 等距方块城市/工厂/港口，物件"搭"起来 | 产业链、供应链、资本开支 |
| 地图作战室 War-room | 深色地图 + 发光航线 + 战术标注（Globe3D 的平面版） | 地缘、关税、资金跨境 |
| 东方大楷 · 宣纸 | 宣纸底 + 东方大楷 + 朱砂印 + 水墨晕染转场 | 宏观大势、周期、历史复盘（国风） |
| HUD 科幻界面 | 透明线框 + 扫描圈 + 数据读数环绕 | AI/芯片/航天 |

## D. 轮换台账（每条片子交付后追加一行；选皮肤先看最后 5 行）

| 日期 | 工程 | 线别 | 皮肤 | 格式 id | 主技术 | 实验? |
|---|---|---|---|---|---|---|
| 09-17 | midterm0917 | 投教 | 线索板 | F07 timeline（验证规律） | 实拍+数据卡 | |
| 09-18 | witching0918 | 投教 | 线索板·蓝图色 | F09 explained（机制） | 数据卡 | |
| 09-24 | oura0924 | 投教 | 俯拍拆解台 | F12 teardown | 实拍+物件 | |
| 09-24 | be0924 | 投研 | 黑底点阵竖版 | F02 case-file（事件复盘） | 实拍+数据卡 | |
| 10-09 | kfilm/rule37 | 知识短片(横) | museum | F23 simulation | 曲线+卡片模拟 | ✓ |
| 10-09 | kfilm/survivor | 知识短片(横) | museum·navy | F02 case-file | 弹孔图+柱状 | ✓ |
| 10-09 | kfilm/rates | 知识短片(横) | museum | F22 chronicle | 年份 HUD+折线 | ✓ |

轮换规则：**同线别**最近 2 行出现过的「皮肤」「格式 id」本条不用（用户指定的除外）。「实验?」标 ✓ 的条目两周后看数据决定转正（expand.md §A 70/20/10）。浅底皮肤占比按最近 9 行统计，目标 ≥ 1/3。
