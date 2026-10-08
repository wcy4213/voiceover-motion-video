import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONTS, SYS, T, useFonts} from '../type.js';

const SAMPLE = '美联储降息 3.2万亿 +18.6%';

export const Specimen = () => {
  useFonts();
  const rows = [...Object.keys(FONTS), ...Object.keys(SYS)];
  return (
    <AbsoluteFill style={{background: '#0B0B0D', padding: '36px 44px', color: '#fff'}}>
      {rows.map((k) => (
        <div key={k} style={{display: 'flex', alignItems: 'baseline', gap: 18, height: 64, borderBottom: '1px solid #222'}}>
          <div style={{width: 120, fontFamily: 'Menlo', fontSize: 18, color: '#8a8a92'}}>{k}</div>
          <div style={{fontFamily: T[k], fontSize: 46, whiteSpace: 'nowrap', lineHeight: 1}}>{SAMPLE}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
