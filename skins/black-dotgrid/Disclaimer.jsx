import React from "react";
import { F } from "./theme.js";

// 免责水印 —— 全片每帧常驻（财报解读 → "信息参考"版文案）
// 右上角：底部 175px 是字幕安全区，不能放左下。
export const DISCLAIMER_TEXT = "内容仅供信息参考 · 不构成投资建议";

export const Disclaimer = ({ text = DISCLAIMER_TEXT }) => (
  <div
    data-disclaimer=""
    style={{
      position: "absolute",
      top: 28,
      right: 34,
      zIndex: 9999,
      pointerEvents: "none",
      fontFamily: F.cn,
      fontSize: 26,
      fontWeight: 600,
      color: "#F2F2F2",
      opacity: 0.38,
      letterSpacing: 0.5,
      whiteSpace: "nowrap",
      textShadow: "0 2px 10px rgba(0,0,0,0.85)",
    }}
  >
    {text}
  </div>
);
