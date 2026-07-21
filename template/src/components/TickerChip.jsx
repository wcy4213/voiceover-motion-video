import React from "react";
import { Img, staticFile } from "remotion";
import { C, F } from "../theme.js";
import { Pop } from "./ui.jsx";

// 公司出场规范：官方 logo 圆角块 + 中文名 + $代码 药丸
export const Logo = ({ symbol, size = 120, radius = 0.24, style }) => (
  <Img
    src={staticFile(`logos/${symbol}.png`)}
    style={{
      width: size,
      height: size,
      borderRadius: size * radius,
      boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
      ...style,
    }}
  />
);

export const TickerChip = ({
  symbol,
  name,
  delay = 0,
  logoSize = 150,
  nameSize = 62,
  layout = "row", // row | column
  style,
}) => (
  <Pop delay={delay} style={style}>
    <div
      style={{
        display: "flex",
        flexDirection: layout,
        alignItems: "center",
        gap: layout === "row" ? 34 : 20,
        justifyContent: "center",
      }}
    >
      <Logo symbol={symbol} size={logoSize} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: layout === "row" ? "flex-start" : "center",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: F.cn,
            fontSize: nameSize,
            fontWeight: 600,
            color: C.white,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: F.num,
            fontSize: nameSize * 0.52,
            fontWeight: 700,
            letterSpacing: 2,
            color: C.blue2,
            background: "rgba(124,156,253,0.14)",
            border: "2px solid rgba(124,156,253,0.45)",
            borderRadius: 999,
            padding: "6px 22px",
          }}
        >
          ${symbol}
        </div>
      </div>
    </div>
  </Pop>
);
