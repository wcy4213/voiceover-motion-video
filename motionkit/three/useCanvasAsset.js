// 在 ThreeCanvas 里异步加载资源（贴图等）的正确姿势：delayRender 挡截帧 → 资源就绪 → advance() 手动重画 → continueRender。
// 同 Globe3D 的做法；只 setState 不 advance 会截到空画面。
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {useThree} from '@react-three/fiber';

export const useCanvasAsset = (load, deps, label = 'three asset') => {
  const advance = useThree((s) => s.advance);
  const [handle] = useState(() => delayRender(label));
  const [value, setValue] = useState(null);
  useEffect(() => {
    let alive = true;
    Promise.resolve()
      .then(load)
      .then((v) => {
        if (!alive) return;
        setValue(v);
        // 等 React 把新 mesh 挂进场景后再画
        requestAnimationFrame(() => { advance(performance.now()); continueRender(handle); });
      })
      .catch((e) => { console.error(`[${label}]`, e); continueRender(handle); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
};
