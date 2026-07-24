# B-roll 实拍素材规范（短视频平台去同质化）

**背景**：抖音/TikTok 对"同质化素材"的判定口径（巨量千川官方）是——仅替换少量元素、仅调亮度/色调/转场的素材即算同质化；查重靠抽帧画面指纹。全屏动效模板视频每期同款底色版式帧极易撞库（真实踩坑：连续多期被判"批量发布低质内容"限流）。目标：**每期 ≥60% 画面与历史成片不同**，实拍画面是最强的原创信号。

## 定位与配额

- **动效为主，实拍/图片只做点缀：每期 2–3 处**（一段前景实拍、一处背景用法、一张图片，各算一处）
- 单段前景实拍 2–4 秒；背景用法可以垫更长
- 数据/图表场景继续用 Remotion 动效——这是品牌识别度所在，不用实拍替代

## 三种用法（按优先级）

1. **画中画卡片**（首选）：实拍装进品牌色描边的圆角卡片，动效底仍是画面主体，实拍是动效系统里的一个"窗口"
2. **背景层**：实拍/图片压暗（黑遮罩 40–60%）+ 轻微品牌色 tint，替换该场景的 Backdrop，上面照常放动效元素
3. **全屏切出**（少用）：官方发布会人物讲话这类强素材，2–4 秒，品牌转场进出

融合规则：进出实拍一律用品牌转场（涟漪/擦除）不硬切；所有实拍统一压轻微品牌色 tint 统一色调；**静态图片必须加 Ken Burns 缓推缓移**，不许静止怼屏。
横屏素材上 9:16：主体居中的直接裁切放大；不能裁的用"上标题 / 中画面 / 下留白"三段式，底用品牌动效底（不用烂大街的模糊背景）。

## 分镜映射（口播讲到什么给什么）

| 口播内容 | 画面 | 来源 |
|---|---|---|
| 具体公司/产品 | 产品实拍、发布会画面 | press kit / keynote / 图库 |
| 人物（央行行长/CEO） | 官方讲话片段，或抠图出场（ExecQuote） | 政府机构**官方频道** |
| 数字/财报/走势 | 动效图表（不换） | Remotion 自制 |
| 抽象概念（通胀/放水） | 隐喻实拍（超市价签/印钞） | 图库 / AI 生成 |
| 铺垫/情绪句 | 城市航拍、交易所空镜 | 图库 |

分镜表素材列写法：`S3 | 实拍·画中画 | pexels:12345 超市价签 | 2.5s`

## 素材获取：scripts/broll_fetch.py

素材池默认 `~/broll-pool/`（可用环境变量 `BROLL_POOL` 改），含 videos/ images/ 和 ledger.json 台账。

```bash
python3 scripts/broll_fetch.py search "stock trading" --portrait   # 四源并搜
python3 scripts/broll_fetch.py fetch pexels:12345 --query "交易大屏"
python3 scripts/broll_fetch.py yt "<YouTube/Vimeo url>" --section 12:30-13:10
python3 scripts/broll_fetch.py used pexels:12345 --video <slug>    # 成片后必做
python3 scripts/broll_fetch.py list --unused
```

信源优先级：
1. **图库 API**：[Pexels](https://www.pexels.com/api/)（首选，可商用免署名）、[Pixabay](https://pixabay.com/api/docs/)（动画图表类强）——key 免费注册，存环境变量 `PEXELS_API_KEY`/`PIXABAY_API_KEY` 或 macOS 钥匙串（service 名 `pexels-api-key`/`pixabay-api-key`）
2. **官方公有领域**：美联储发布会、国会听证会等**政府官方频道**视频 = 美国政府作品（17 U.S.C. §105），可商用。⚠️ 搜索结果里的第三方转播台和 C-SPAN 自有机位**不是**公有领域，认准 channel 名
3. **AI 生成**：文生视频/图（Seedance、Kling 等），每期唯一零版权——**发平台必须主动标"AI 生成"**，不标被检出会叠加处罚
4. **公司 press kit / keynote**：仅限编辑用途；keynote 片段单段几秒~十几秒、解说为主、**绝不搬带背景音乐的原声段**

YouTube 下载遇 "Sign in to confirm you're not a bot" → 加 `--browser-cookies chrome`（首次弹钥匙串授权）。依赖：`pip install "yt-dlp[default]"`（含 EJS 组件）+ node/deno 做 JS runtime，脚本自动探测。

## 合规红线

- 只从源头拿无水印素材（图库 API 直链 / yt-dlp 原流）；**绝不抹除、裁掉他人视频的水印台标**——中国《著作权法》第 53 条(七)"删除权利管理信息"构成侵权，平台按搬运处置
- Getty/视觉中国等付费图库的带水印预览图绝不能上片
- Pexels 素材：成片简介带一句"部分素材来自 Pexels"（API 使用条款要求）；Openverse 的 CC BY/BY-SA 图：简介署名作者（fetch 时脚本会提示）

## 防复用（和首帧规范同级的硬规则）

- 选素材前先 `list` 查台账：**已用过的素材不跨期原样复用**（同素材两期都用=又撞画面指纹），必须复用时换裁切/运镜/局部放大
- 每期成片交付后立刻 `used --video <slug>` 记账
