// 排版自动质检：检测元素相互重叠 + 越界出框。
// 把合成加载进 Remotion 渲染用 Chrome，逐帧取所有可见叶子元素的包围盒，
// 两两求交集超过阈值即报告；另报水平出框（半个字被画布切掉）和越界安全区。
//
// 用法（在你的 Remotion 工程目录里跑）:
//   node overlap-check.mjs <entry> <CompId> [step=10] [minOverlapRatio=0.16]
// 可选环境变量:
//   SAFE_TOP=118        顶部安全线（有顶部章节标签时用）
//   SAFE_BOTTOM_PAD=0   底部预留 px（恢复字幕安全区时设 175）
//   带 data-subtitle 属性的元素自动跳过越界检查。
//
// 已内置四类假阳性抑制: ①纯文本按 fontSize*0.82 收成墨迹框（带 border/背景的
// 药丸卡片不收）②父子嵌套 contains ③祖先 overflow:hidden 裁切 ④backface-hidden
// 3D 翻面两面同空间（需向上继承祖先标记）。装饰粒子层叠在文字上属故意分层，人工放行。
//
// 依赖解析: 默认从当前工程 require.resolve('@remotion/bundler'/'renderer')。
// pnpm 工程二者不是直接依赖时，用 REMOTION_BUNDLER / REMOTION_RENDERER 环境变量
// 指到 node_modules/.pnpm/@remotion+…/node_modules/@remotion/{bundler,renderer}/dist/index.js
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(path.resolve("package.json"));
const resolveDep = (name, envOverride) => {
  if (envOverride) return pathToFileURL(path.resolve(envOverride)).href;
  return pathToFileURL(require.resolve(`@remotion/${name}`)).href;
};

const { bundle } = await import(resolveDep("bundler", process.env.REMOTION_BUNDLER));
const renderer = await import(resolveDep("renderer", process.env.REMOTION_RENDERER));
const { openBrowser, getCompositions, ensureBrowser } = renderer;

const ENTRY = process.argv[2];
const COMP_ID = process.argv[3];
const STEP = Number(process.argv[4] ?? 10);
const MIN_RATIO = Number(process.argv[5] ?? 0.16);
if (!ENTRY || !COMP_ID) {
  console.error("用法: node overlap-check.mjs <entry> <CompId> [step] [minOverlapRatio]");
  process.exit(1);
}

if (ensureBrowser) await ensureBrowser();

console.log("[overlap] bundling…");
const bundleDir = await bundle({ entryPoint: path.resolve(ENTRY) });

// bundle() 给的是本地目录，Chrome 需要 http URL —— 起个最小静态服务
const fs = await import("node:fs");
const http = await import("node:http");
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".woff2": "font/woff2", ".map": "application/json",
};
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.join(bundleDir, rel === "/" ? "/index.html" : rel);
  if (!file.startsWith(bundleDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end("nf");
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const serveUrl = `http://127.0.0.1:${server.address().port}`;
console.log(`[overlap] serving bundle at ${serveUrl}`);

const browser = await openBrowser("chrome");
const comps = await getCompositions(serveUrl);
const comp = comps.find((c) => c.id === COMP_ID);
if (!comp) {
  throw new Error(`composition ${COMP_ID} not found`);
}
console.log(`[overlap] ${comp.id} ${comp.width}x${comp.height} ${comp.durationInFrames}f, step=${STEP}`);

const page = await browser.newPage({ context: null, logLevel: "error", indent: false });
// 页面 console 回调需要 sourceMapGetter，不给会在首条 console 日志时崩
page.sourceMapGetter = () => null;
await page.setViewport({ width: comp.width, height: comp.height, deviceScaleFactor: 1 });
await page.goto({ url: `${serveUrl}/index.html`, timeout: 60000 });
await page.evaluateHandle(`window.remotion_setBundleMode({
  type: 'composition',
  compositionName: ${JSON.stringify(comp.id)},
  serializedResolvedPropsWithSchema: ${JSON.stringify(JSON.stringify(comp.props ?? {}))},
  compositionDurationInFrames: ${comp.durationInFrames},
  compositionFps: ${comp.fps},
  compositionHeight: ${comp.height},
  compositionWidth: ${comp.width},
  compositionDefaultCodec: 'h264',
  compositionDefaultOutName: null,
  compositionRenderDefaults: {},
})`);

// 页面内：收集"有实际内容的叶子元素"包围盒并两两求交
const PROBE = `(() => {
  const out = [];
  const nodes = document.querySelectorAll('div, span, svg, img');
  for (const el of nodes) {
    const st = getComputedStyle(el);
    if (st.opacity === '0' || st.visibility === 'hidden' || st.display === 'none') continue;
    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0
    );
    const isMedia = el.tagName === 'IMG' || el.tagName === 'SVG';
    if (!hasDirectText && !isMedia) continue;
    let r = el.getBoundingClientRect();
    // 纯文本元素：行高留白不算占位，按字号收成墨迹框，否则大字号全是假阳性
    const hasChrome =
      (st.borderTopWidth !== '0px' && st.borderTopStyle !== 'none') ||
      (st.backgroundColor && st.backgroundColor !== 'rgba(0, 0, 0, 0)') ||
      (st.backgroundImage && st.backgroundImage !== 'none');
    if (hasDirectText && !isMedia && !hasChrome) {
      const fs = parseFloat(st.fontSize) || 0;
      const ink = fs * 0.82;
      if (r.height > ink + 2) {
        const pad = (r.height - ink) / 2;
        r = { x: r.x, y: r.y + pad, width: r.width, height: ink,
              bottom: r.y + pad + ink, top: r.y + pad };
      }
    }
    if (r.width < 6 || r.height < 6) continue;
    if (r.bottom < 0 || r.top > window.innerHeight) continue;
    // 累计祖先链 opacity，整体淡出的拍不算
    let eff = 1, p = el;
    while (p && p !== document.body) { eff *= parseFloat(getComputedStyle(p).opacity || '1'); p = p.parentElement; }
    if (eff < 0.12) continue;
    // 被祖先 overflow:hidden 裁掉的部分不算占位
    let cx0 = r.x, cy0 = r.y, cx1 = r.x + r.width, cy1 = r.y + r.height;
    let anc = el.parentElement, backface = st.backfaceVisibility === 'hidden';
    while (anc && anc !== document.body) {
      const as = getComputedStyle(anc);
      if (as.backfaceVisibility === 'hidden') backface = true;
      if (as.overflow === 'hidden' || as.overflowX === 'hidden' || as.overflowY === 'hidden') {
        const ar = anc.getBoundingClientRect();
        cx0 = Math.max(cx0, ar.x); cy0 = Math.max(cy0, ar.y);
        cx1 = Math.min(cx1, ar.right); cy1 = Math.min(cy1, ar.bottom);
      }
      anc = anc.parentElement;
    }
    if (cx1 - cx0 < 6 || cy1 - cy0 < 6) continue;
    out.push({
      el,
      backface,
      tag: el.tagName,
      text: (el.textContent || '').trim().slice(0, 22),
      x: Math.round(cx0), y: Math.round(cy0),
      w: Math.round(cx1 - cx0), h: Math.round(cy1 - cy0),
      op: +eff.toFixed(2),
    });
  }
  const hits = [];
  for (let i = 0; i < out.length; i++) {
    for (let j = i + 1; j < out.length; j++) {
      const a = out[i], b = out[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      if (a.backface && b.backface) continue;
      const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
      const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      if (ix <= 2 || iy <= 2) continue;
      const inter = ix * iy;
      const areaA = a.w * a.h, areaB = b.w * b.h;
      const ratio = inter / Math.min(areaA, areaB);
      const contained =
        (a.x <= b.x && a.y <= b.y && a.x + a.w >= b.x + b.w && a.y + a.h >= b.y + b.h) ||
        (b.x <= a.x && b.y <= a.y && b.x + b.w >= a.x + a.w && b.y + b.h >= a.y + a.h);
      if (contained) continue;
      if (ratio >= ${MIN_RATIO}) {
        const strip = (o) => ({ tag: o.tag, text: o.text, x: o.x, y: o.y, w: o.w, h: o.h, op: o.op });
        hits.push({ a: strip(a), b: strip(b), ratio: +ratio.toFixed(2) });
      }
    }
  }
  return hits;
})()`;

const SAFE_TOP = Number(process.env.SAFE_TOP ?? 118);
const SAFE_BOTTOM = comp.height - Number(process.env.SAFE_BOTTOM_PAD ?? 0);
// 左右边界：留 8px 容差给字形抗锯齿。水平出框 = 半个字被画布裁掉，比越界更致命
const SAFE_LEFT = 8, SAFE_RIGHT = comp.width - 8;
const OOB = `(() => {
  const bad = [];
  for (const el of document.querySelectorAll('div, span, svg, img')) {
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none') continue;
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText && el.tagName !== 'IMG') continue;
    let eff = 1, p = el;
    while (p && p !== document.body) { eff *= parseFloat(getComputedStyle(p).opacity || '1'); p = p.parentElement; }
    if (eff < 0.12) continue;
    if ((el.textContent || '').length && el.closest('[data-subtitle]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 6 || r.height < 6) continue;
    const fs = parseFloat(st.fontSize) || 0;
    const ink = hasText ? fs * 0.82 : r.height;
    const pad = Math.max(0, (r.height - ink) / 2);
    const top = r.y + pad, bot = r.y + r.height - pad;
    const vBad = bot > ${SAFE_BOTTOM} + 2 || top < ${SAFE_TOP} - 2;
    const hBad = r.x < ${SAFE_LEFT} || r.x + r.width > ${SAFE_RIGHT};
    if (vBad || hBad) {
      bad.push({
        text: (el.textContent || el.tagName).trim().slice(0, 20),
        top: Math.round(top), bot: Math.round(bot),
        x: Math.round(r.x), right: Math.round(r.x + r.width),
        kind: hBad ? (vBad ? 'HV' : 'H') : 'V',
      });
    }
  }
  return bad;
})()`;

const findings = [];
const oobFindings = [];
for (let f = 0; f < comp.durationInFrames; f += STEP) {
  await page.evaluate(`window.remotion_setFrame(${f}, ${JSON.stringify(comp.id)}, 0)`);
  await new Promise((r) => setTimeout(r, 12));
  const hits = await page.evaluate(PROBE);
  const val = hits?.value ?? hits;
  if (Array.isArray(val) && val.length) {
    findings.push({ frame: f, hits: val });
  }
  const oob = await page.evaluate(OOB);
  const oobVal = oob?.value ?? oob;
  if (Array.isArray(oobVal) && oobVal.length) oobFindings.push({ frame: f, items: oobVal });
  if (f % (STEP * 40) === 0) process.stdout.write(`\r[overlap] frame ${f}/${comp.durationInFrames}   `);
}
process.stdout.write("\n");

// 按"元素文本对"聚合，输出连续帧区间
const groups = new Map();
for (const { frame, hits } of findings) {
  for (const h of hits) {
    const key = `${h.a.text} ⟷ ${h.b.text}`;
    if (!groups.has(key)) groups.set(key, { frames: [], maxRatio: 0, sample: h });
    const g = groups.get(key);
    g.frames.push(frame);
    if (h.ratio > g.maxRatio) { g.maxRatio = h.ratio; g.sample = h; }
  }
}
const sorted = [...groups.entries()].sort((x, y) => y[1].maxRatio - x[1].maxRatio);
console.log(`\n=== 检出 ${sorted.length} 组重叠 ===`);
for (const [key, g] of sorted) {
  const f0 = Math.min(...g.frames), f1 = Math.max(...g.frames);
  console.log(
    `重叠 ${(g.maxRatio * 100).toFixed(0)}%  帧 ${f0}-${f1} (${g.frames.length}次)  ${key}\n` +
    `        A[${g.sample.a.x},${g.sample.a.y} ${g.sample.a.w}x${g.sample.a.h}]  ` +
    `B[${g.sample.b.x},${g.sample.b.y} ${g.sample.b.w}x${g.sample.b.h}]`
  );
}
// 越界报告
const oobGroups = new Map();
for (const { frame, items } of oobFindings) {
  for (const it of items) {
    const k = it.text;
    if (!oobGroups.has(k)) oobGroups.set(k, { frames: [], worst: it });
    const g = oobGroups.get(k);
    g.frames.push(frame);
    if (it.bot > g.worst.bot || it.top < g.worst.top) g.worst = it;
  }
}
const hGroups = [...oobGroups].filter(([, g]) => g.worst.kind !== 'V');
const vGroups = [...oobGroups].filter(([, g]) => g.worst.kind === 'V');
console.log(`\n=== ★水平出框 ${hGroups.length} 组 (左${SAFE_LEFT} / 右${SAFE_RIGHT}) ===`);
for (const [k, g] of hGroups) {
  console.log(
    `帧 ${Math.min(...g.frames)}-${Math.max(...g.frames)}  x=${g.worst.x}→${g.worst.right}  ` +
    `${g.worst.right > SAFE_RIGHT ? `右超 ${g.worst.right - SAFE_RIGHT}px` : `左超 ${SAFE_LEFT - g.worst.x}px`}  ${k}`
  );
}
console.log(`\n=== 越界安全区(上下) ${vGroups.length} 组 (顶${SAFE_TOP} / 底${SAFE_BOTTOM}) ===`);
for (const [k, g] of vGroups) {
  console.log(`帧 ${Math.min(...g.frames)}-${Math.max(...g.frames)}  top=${g.worst.top} bot=${g.worst.bot}  ${k}`);
}

await browser.close({ silent: true });
server.close();
