# fonts/

仓库里只随附 **SIL OFL 1.1** 字体（可自由再分发）：得意黑 Smiley Sans、站酷快乐体、Montserrat Black、Playfair Display Black、Abril Fatface、Oswald、JetBrains Mono，以及 Montserrat 的 three.js typeface JSON（给 `Number3D` 用）。许可原文在 `LICENSES/`。

`motionkit/type.js` 还登记了一批**厂商免费商用但不允许第三方再分发/转格式**的中文字体（阿里巴巴普惠体、阿里妈妈数黑体/东方大楷/方圆体、站酷高端黑/文艺体、优设标题黑、庞门正道标题体、钉钉进步体、MiSans、HarmonyOS Sans、思源黑体、猫啃网风雅宋）。它们不在仓库里，请运行：

```bash
bash public/fonts/fetch_fonts.sh      # 从官方渠道下载到本目录（思源/风雅宋是 OFL，其余为厂商声明）
```

逐款许可结论见 `agent/craft/fonts-license.md`。要点：
- 没有一款是 CC0；视频与广告用途全部可商用。
- 厂商声明类字体**不得子集化 / 转 woff2 / 转 typeface JSON**；方圆体须在发布简介署名；钉钉进步体不得上传到任何仓库。
- 付费投放版用 `PAIRS_AD`（全 OFL + 华为/小米明文允许广告用途），不用 macOS 系统字体。
- 缺字体时 `useFonts()` 静默回退到 PingFang/系统黑体，不会报错——渲样张（`motionkit/demo-type`）确认。
