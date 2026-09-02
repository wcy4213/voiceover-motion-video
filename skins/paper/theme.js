// 投教07 德鲁肯米勒 —— 「分析师手账」皮肤（沿用投教03，纸色偏冷半档 + 换 seed 防重复画风）
export const C = {
  paper: "#F2EFE8",      // 纸底（比投教03 #F4F0E6 偏冷半档）
  paperDeep: "#E6E0D2",  // 纸底暗部/暗角
  ink: "#1A1A1A",
  ink2: "#4A4A46",
  pencil: "#6B6A64",
  purple: "#6F00FF",
  purpleSoft: "#A050FF",
  yellow: "#F9F339",
  highlight: "rgba(249, 243, 57, 0.62)",
  red: "#C5221F",
  green: "#0B8043",
  up: "#0B8043",
  down: "#C5221F",
  white: "#FFFFFF",
  black: "#050505",
};

export const F = {
  cn: '"PingFang SC", "Hiragino Sans GB", "Heiti SC", sans-serif',
  num: '-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
};

export const W = 1080;
export const H = 1440;
export const SUB_SAFE = 150;    // 底部字幕安全区
export const SAFE_BOTTOM = 165; // 贴底元素最低 bottom（章节纸条自身占 165–205）
export const BAR_TOP = H - 205; // 章节纸条上缘 y=1235，场景内容保持 y<1200

export const cardStyle = {
  background: "#FCFAF4",
  borderRadius: 10,
  boxShadow: "0 10px 26px rgba(26,22,10,0.20), 0 2px 4px rgba(26,22,10,0.12)",
};
