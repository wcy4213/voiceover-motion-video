// typeface JSON → THREE.Font。**同步**：JSON 直接被 webpack 打包进来，不走异步 fetch——
// ThreeCanvas 是 frameloop='never'，异步加载完时那一帧已经画过了，画面会是空的（2026-10-08 实测）。
// 新字体：node scripts/tools/ttf2typeface.mjs <ttf> public/fonts/<name>.typeface.json，然后在这里 import 并加进 FONTS3D。
import {Font} from 'three/examples/jsm/loaders/FontLoader.js';
import montserratBlack from '../../public/fonts/montserrat-black.typeface.json';

const FONTS3D = {montserrat: montserratBlack};
const cache = new Map();
export const getFont3D = (key = 'montserrat') => {
  if (!cache.has(key)) cache.set(key, new Font(FONTS3D[key] || montserratBlack));
  return cache.get(key);
};
