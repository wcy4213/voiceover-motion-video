// 把 TTF/OTF 转成 three.js typeface JSON（给 TextGeometry / Number3D 用）。只保留指定字符，文件小、加载快。
// 用法：node scripts/tools/ttf2typeface.mjs public/fonts/Montserrat-Black.otf public/fonts/montserrat-black.typeface.json
import fs from 'node:fs';
// three 自带的 TTFLoader 会从 CDN 拉 opentype.js，离线不可用；用 drei 依赖里的 three-stdlib 版本（内置 opentype）
import {TTFLoader} from '../../node_modules/.pnpm/three-stdlib@2.36.1_three@0.185.1/node_modules/three-stdlib/loaders/TTFLoader.js';

const [, , src, dst, chars = '0123456789.,+-−%$¥€£xX×bpBPKMTkmt ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'] = process.argv;
const buf = fs.readFileSync(src);
const json = new TTFLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const keep = new Set([...chars]);
json.glyphs = Object.fromEntries(Object.entries(json.glyphs).filter(([k]) => keep.has(k)));
fs.writeFileSync(dst, JSON.stringify(json));
console.log(`wrote ${dst}: ${Object.keys(json.glyphs).length} glyphs, ${(fs.statSync(dst).size / 1024).toFixed(1)} KB`);
