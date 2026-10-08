// 一次打包 → 批量抽帧 QC（避免每帧重新 bundle，关键帧抽查提速一个量级）
// 用法（在你的 Remotion 工程目录里跑）:
//   node qc-stills.mjs <entry> <CompId> <逗号分隔帧号> [outDir=out/stills] [scale=0.5]
// pnpm 工程 @remotion/{bundler,renderer} 不是直接依赖时，用
// REMOTION_BUNDLER / REMOTION_RENDERER 环境变量指到各自 dist/index.js 的绝对路径。
import { mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(path.resolve("package.json"));
const resolveDep = (name, envOverride) => {
  if (envOverride) return pathToFileURL(path.resolve(envOverride)).href;
  return pathToFileURL(require.resolve(`@remotion/${name}`)).href;
};

const bMod = await import(resolveDep("bundler", process.env.REMOTION_BUNDLER));
const rMod = await import(resolveDep("renderer", process.env.REMOTION_RENDERER));
const { bundle } = bMod.bundle ? bMod : bMod.default;
const R = rMod.getCompositions ? rMod : rMod.default;
const { getCompositions, renderStill, openBrowser, ensureBrowser } = R;

const [entry, compId, framesArg, outDir = "out/stills", scaleArg = "0.5"] = process.argv.slice(2);
if (!entry || !compId || !framesArg) {
  console.error("用法: node qc-stills.mjs <entry> <CompId> <帧号,帧号,...> [outDir] [scale]");
  process.exit(1);
}
const frames = framesArg.split(",").map((x) => parseInt(x.trim(), 10));
const scale = parseFloat(scaleArg);

mkdirSync(outDir, { recursive: true });
if (ensureBrowser) await ensureBrowser();
console.log("bundling…");
const serveUrl = await bundle({ entryPoint: path.resolve(entry) });
const comps = await getCompositions(serveUrl);
const comp = comps.find((c) => c.id === compId);
if (!comp) throw new Error(`composition ${compId} not found`);
const browser = await openBrowser("chrome");
for (const f of frames) {
  const out = path.join(outDir, `f${f}.png`);
  await renderStill({ composition: comp, serveUrl, output: out, frame: f, scale, puppeteerInstance: browser, imageFormat: "png", overwrite: true });
  console.log("✓", out);
}
await browser.close({ silent: true });
