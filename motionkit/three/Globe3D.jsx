// motionkit/three/Globe3D.jsx — 3D 地球（three-globe，MIT）：全球市场/供应链/资金流向场景
// 品牌紫球体 + 紫色大气辉光 + 黄色标记点 + 紫→黄弧线，整球自转由 frame 驱动。
// 确定性要点：pointsTransitionDuration/arcsTransitionDuration 置 0（three-globe 内部 tween
// 走墙钟时间，不归 Remotion 管，必须关掉）；不用 arcDash 动画。
// 用法：放进 <ThreeStage>（默认相机 position:[0,60,320] 即可）。globe 半径固定 100 world 单位。
import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import {useThree} from '@react-three/fiber';
import {Color} from 'three';
import ThreeGlobe from 'three-globe';

// 默认数据：全球主要金融中心 + 资金流向弧线（可整体替换）
const HUBS = [
  {lat: 40.71, lng: -74.01},   // 纽约
  {lat: 51.51, lng: -0.13},    // 伦敦
  {lat: 22.32, lng: 114.17},   // 香港
  {lat: 35.68, lng: 139.69},   // 东京
  {lat: 31.23, lng: 121.47},   // 上海
  {lat: 50.11, lng: 8.68},     // 法兰克福
  {lat: 1.35, lng: 103.82},    // 新加坡
  {lat: 37.77, lng: -122.42},  // 旧金山
];
const FLOWS = [
  {startLat: 40.71, startLng: -74.01, endLat: 51.51, endLng: -0.13},
  {startLat: 40.71, startLng: -74.01, endLat: 22.32, endLng: 114.17},
  {startLat: 51.51, startLng: -0.13, endLat: 1.35, endLng: 103.82},
  {startLat: 35.68, startLng: 139.69, endLat: 37.77, endLng: -122.42},
  {startLat: 22.32, startLng: 114.17, endLat: 31.23, endLng: 121.47},
];

export const Globe3D = ({
  points = HUBS,
  arcs = FLOWS,
  tilt = 0.32,          // X 轴倾角（弧度）
  spinFrom = 3.6,       // Y 轴起始角：默认让美洲/欧亚弧线面向镜头
  spinSpeed = 0.004,    // 每帧自转增量（弧度）
  pointColor = '#F9F339',
  arcColors = ['#6F00FF', '#F9F339'],
  surface = '#38125f',
  graticules = true,    // 经纬网格线，不用贴图也有"地球感"
}) => {
  const frame = useCurrentFrame();
  const advance = useThree((s) => s.advance);
  // three-globe 的层构建是异步的（kapsule setTimeout 批处理），而渲染模式下 ThreeCanvas
  // 是 frameloop='never'、每帧只 advance 一次——层建完时那一笔已经画过了。
  // 所以：delayRender 挡住截帧，等球体网格挂进场景后手动 advance() 重画再放行。
  const [buildHandle] = useState(() =>
    delayRender('Globe3D: waiting for three-globe layers')
  );
  const globe = useMemo(() => {
    // animateIn 必须关：默认会走墙钟 tween 缩放入场，截帧会逮到中途的半大球（非确定性）
    const g = new ThreeGlobe({animateIn: false})
      .showAtmosphere(true)
      .atmosphereColor('#A050FF')
      .atmosphereAltitude(0.16)
      .pointsData(points)
      .pointColor(() => pointColor)
      .pointAltitude(0.015)
      .pointRadius(0.9)
      .pointsTransitionDuration(0)
      .arcsData(arcs)
      .arcColor(() => arcColors)
      .arcAltitude(0.22)
      .arcStroke(0.55)
      .arcsTransitionDuration(0)
      .showGraticules(graticules);
    const mat = g.globeMaterial();
    mat.color = new Color(surface);
    mat.emissive = new Color('#2a0a52');
    mat.emissiveIntensity = 0.55;
    mat.shininess = 8;
    return g;
  }, [points, arcs, pointColor, arcColors, surface, graticules]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (globe.children.length > 0) {
        clearInterval(timer);
        advance(performance.now());
        continueRender(buildHandle);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [globe, advance, buildHandle]);
  return (
    <group rotation={[tilt, spinFrom + frame * spinSpeed, 0]}>
      <primitive object={globe} />
    </group>
  );
};
