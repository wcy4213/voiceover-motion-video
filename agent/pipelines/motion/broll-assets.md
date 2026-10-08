# B-roll 实拍素材规范（抖音去同质化）

背景：2026-07-22《谷歌Q2》被抖音判"批量发布同质化内容"限流。判定逻辑（巨量千川官方口径）：仅替换少量元素/仅调色调转场的模板素材=同质化；查重靠抽帧画面指纹，每期同款紫底版式帧撞库。目标：**每期 ≥60% 画面与历史成片不同**，实拍画面是最强的原创信号。

## 定位与配额（用户定的，不要超）

- **动效为主，实拍/图片只做点缀：每期 2–3 处**（一段前景实拍、一处背景用法、一张图片，各算一处）
- 单段前景实拍 2–4 秒；背景用法可以垫更长
- 数据/图表场景继续用 Remotion 动效——这是品牌优势，不用实拍替代

## 三种用法（按优先级）

1. **画中画卡片**（首选）：实拍装进品牌色描边的圆角卡片，紫底动效仍是画面主体，实拍是动效系统里的一个"窗口"
2. **背景层**：实拍/图片压暗（黑遮罩 40–60%）+ 轻微紫 tint，替换该场景的 Backdrop，上面照常放动效元素
3. **全屏切出**（少用）：官方发布会人物讲话这类强素材，2–4 秒，涟漪转场进出

融合规则：进出实拍一律涟漪/擦除转场不硬切；所有实拍统一压轻微品牌紫 tint；**静态图片必须动起来，不许静止怼屏**——首选 `broll_fetch.py animate`（DepthFlow 2.5D 视差运镜，深度感远强于平面缩放；产物入片时放大 3–5% 裁掉边缘拉丝），次选 Remotion motionkit 的 `KenBurns` 组件（缓推缓移）。
横屏素材上 9:16：主体居中的直接裁切放大；不能裁的用"上标题 / 中画面 / 下留白"三段式，底用品牌动效底（不用烂大街的模糊背景）。

## 分镜映射（口播讲到什么给什么）

| 口播内容 | 画面 | 来源 |
|---|---|---|
| 具体公司/产品 | 产品实拍、发布会画面 | press kit / keynote / 图库 |
| 人物（鲍威尔/CEO） | 官方讲话片段，或抠图出场（Exec.jsx） | Fed/国会**官方频道** |
| 数字/财报/走势 | 动效图表（不换） | Remotion 自制 |
| 抽象概念（通胀/放水） | 隐喻实拍（超市价签/印钞） | 图库 / AI 生成 |
| 铺垫/情绪句 | 城市航拍、交易所空镜 | 图库 |

分镜表素材列写法：`S3 | 实拍·画中画 | pexels:12345 超市价签 | 2.5s`

## 素材获取：scripts/broll_fetch.py

素材池 `~/broll-pool/`（videos/ images/ + ledger.json 台账）。

```bash
python3 <skill>/scripts/broll_fetch.py search "stock trading" --portrait   # 四源并搜(结果自带 ✔已入池/⛔已用于 台账标注)
python3 <skill>/scripts/broll_fetch.py fetch pexels:12345 --query "交易大屏"
python3 <skill>/scripts/broll_fetch.py yt "<YouTube/Vimeo url>" --section 12:30-13:10
python3 <skill>/scripts/broll_fetch.py qc pexels:12345 -n 4                # 抽帧质检: 逐张 Read 看图(相关性/水印/画质), 不合格换候选
python3 <skill>/scripts/broll_fetch.py animate openverse:xxx --preset zoomin --time 4 --height 1920  # 静图→2.5D 运镜视频(DepthFlow, M1 秒级渲染)
python3 <skill>/scripts/broll_fetch.py used pexels:12345 --video <slug>    # 成片后必做
python3 <skill>/scripts/broll_fetch.py list --unused
```

**入片前质检（qc）**：拉回的视频素材一律先 `qc` 抽帧、用 Read 逐张看——①与口播语义相关 ②无水印/台标 ③画质构图能用；顺带从帧文件名的秒数记下最贴合的选段区间。

**静图盘活（animate）**：presets = zoomin(默认)/zoomout/dolly/orbital/circle/vertical/horizontal；B-roll 点缀用 zoomin/dolly，循环背景用 circle/orbital。产物自动入池记台账、继承源图授权；**属 AI 加工素材，发抖音需标注 AIGC**。同一张图换不同 preset 输出的画面不同，可跨期复用源图（产物仍不跨期复用）。

信源优先级：
1. **图库 API**：Pexels（首选，可商用免署名）、Pixabay（动画图表类强）——key 免费注册，存钥匙串 `pexels-api-key` / `pixabay-api-key`
2. **官方公有领域**：美联储/国会听证会**官方频道**视频 = 美国政府作品可商用。⚠️ 搜索结果里的第三方转播台（RSBN 等）和 C-SPAN 自有机位**不是** PD，认准 channel 名
3. **AI 生成**：ChatCut video-gen（Seedance/Kling）/image-gen，每期唯一零版权——**发抖音必须主动标"AI 生成"**，不标被检出会叠加处罚
4. **公司 press kit / keynote**：editorial 用途；keynote 片段单段几秒~十几秒、解说为主、**绝不搬带背景音乐的原声段**

YouTube 下载遇 "Sign in to confirm you're not a bot" → 加 `--browser-cookies chrome`（首次弹钥匙串授权）。依赖：yt-dlp 装在 python3.11（`yt-dlp[default]`，含 EJS 组件）+ nvm node 做 JS runtime，脚本已自动处理。

## 合规红线

- 只从源头拿无水印素材（图库 API 直链 / yt-dlp 原流 / douyin-downloader 无水印接口）；**绝不抹除、裁掉他人视频的水印台标**——著作权法第 53 条(七)"删除权利管理信息"，抖音按搬运处置
- Getty/视觉中国带水印预览图绝不能上片
- Pexels 素材：成片简介带一句"部分素材来自 Pexels"；Openverse 的 CC BY/BY-SA 图：简介署名作者（fetch 时脚本会提示）

## 防复用（和首帧铁律同级的硬规则）

- 选素材前先 `list` 查台账：**已用过的素材不跨期原样复用**（同素材两期都用=又撞画面指纹），必须复用时换裁切/运镜/局部放大
- 每期成片交付后立刻 `used --video <slug>` 记账
