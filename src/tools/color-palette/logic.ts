import { hexToHsl, hexToRgb, hslToHex, readableTextColor, type Hsl } from "../../shared/color";

export type PaletteColor = {
  role: string;
  label: string;
  hex: string;
  rgb: string;
  hsl: string;
  usage: string;
};

export type PaletteStyle = {
  name: string;
  primaryS: number;
  primaryL: number;
  secondaryShift: number;
  secondaryS: number;
  secondaryL: number;
  accentShift: number;
  accentS: number;
  accentL: number;
  bgShift: number;
  bgS: number;
  bgL: number;
  surfaceShift: number;
  surfaceS: number;
  surfaceL: number;
};

export type PalettePreset = {
  name: string;
  text: string;
  muted: string;
  colors: Array<{ role: string; label: string; hex: string; usage: string }>;
};

const STYLES: Record<string, PaletteStyle> = {
  tech: { name: "科技冷静", primaryS: 76, primaryL: 54, secondaryShift: 78, secondaryS: 64, secondaryL: 45, accentShift: -42, accentS: 82, accentL: 58, bgShift: 8, bgS: 42, bgL: 96, surfaceShift: 4, surfaceS: 36, surfaceL: 100 },
  warm: { name: "温暖友好", primaryS: 72, primaryL: 52, secondaryShift: 34, secondaryS: 70, secondaryL: 62, accentShift: -24, accentS: 78, accentL: 60, bgShift: 18, bgS: 58, bgL: 95, surfaceShift: 12, surfaceS: 50, surfaceL: 99 },
  fresh: { name: "清爽自然", primaryS: 62, primaryL: 46, secondaryShift: 42, secondaryS: 54, secondaryL: 50, accentShift: 96, accentS: 58, accentL: 56, bgShift: 36, bgS: 48, bgL: 96, surfaceShift: 28, surfaceS: 42, surfaceL: 99 },
  luxury: { name: "高级克制", primaryS: 42, primaryL: 34, secondaryShift: 28, secondaryS: 36, secondaryL: 48, accentShift: -36, accentS: 48, accentL: 44, bgShift: 8, bgS: 22, bgL: 94, surfaceShift: 5, surfaceS: 18, surfaceL: 98 },
  cyber: { name: "赛博活力", primaryS: 88, primaryL: 58, secondaryShift: 118, secondaryS: 86, secondaryL: 54, accentShift: -86, accentS: 90, accentL: 62, bgShift: 220, bgS: 28, bgL: 10, surfaceShift: 220, surfaceS: 24, surfaceL: 16 },
};

const PRESETS: Record<string, PalettePreset> = {
  sakura: preset("雾白深蓝", "#1F2937", "#667085", [["primary", "Deep Blue", "#2563EB", "主按钮、链接、导航选中"], ["secondary", "Sky Mist", "#DBEAFE", "标签底色、辅助模块"], ["accent", "Soft Cyan", "#06B6D4", "数据高亮、轻量强调"], ["background", "Cloud White", "#F8FAFC", "清爽页面背景"], ["surface", "Pure Surface", "#FFFFFF", "卡片、输入、弹窗"]]),
  bamboo: preset("鼠尾草奶油", "#24352F", "#6B7A72", [["primary", "Sage", "#5F8D73", "自然主按钮、品牌识别"], ["secondary", "Pale Sage", "#D8E7DD", "标签、信息块背景"], ["accent", "Warm Sand", "#D6A96A", "小面积强调、徽标"], ["background", "Cream", "#F7F3EA", "柔和页面背景"], ["surface", "Soft Linen", "#FFFCF6", "卡片、表单、浮层"]]),
  porcelain: preset("冷雾青瓷", "#20313A", "#607D87", [["primary", "Porcelain Teal", "#2F8F9D", "主按钮、链接、导航"], ["secondary", "Mist Blue", "#D7E9ED", "次级区域、提示背景"], ["accent", "Lake Blue", "#6D9DC5", "图表、数据高亮"], ["background", "Blue Fog", "#F2F7F8", "低眩光页面背景"], ["surface", "Ice Surface", "#FFFFFF", "内容卡片、输入区域"]]),
  sunset: preset("杏仁暖阳", "#3F332A", "#7C6656", [["primary", "Terracotta", "#C96F4A", "温暖主按钮、品牌色"], ["secondary", "Apricot", "#F4C7A1", "标签、辅助按钮"], ["accent", "Honey", "#E7A84B", "重点提醒、小面积点缀"], ["background", "Almond", "#FAF1E6", "温润页面背景"], ["surface", "Warm White", "#FFF8F0", "卡片、弹窗、内容容器"]]),
  ink: preset("炭黑云灰", "#111827", "#6B7280", [["primary", "Charcoal", "#111827", "高级主按钮、标题强调"], ["secondary", "Cool Gray", "#E5E7EB", "分割区域、辅助背景"], ["accent", "Clean Indigo", "#6366F1", "链接、重点操作"], ["background", "Snow Gray", "#F9FAFB", "干净页面背景"], ["surface", "White Panel", "#FFFFFF", "卡片、面板、输入"]]),
  cream: preset("奶油玫瑰", "#443137", "#8B6F78", [["primary", "Rose Taupe", "#A55C6B", "柔和主按钮、品牌识别"], ["secondary", "Blush", "#F3D7DC", "辅助按钮、信息底色"], ["accent", "Peach", "#E7A08B", "强调按钮、提示状态"], ["background", "Cream Rose", "#FFF5F3", "页面背景、营销区块"], ["surface", "Soft White", "#FFFFFF", "卡片、浮层、表单区域"]]),
  softNeutral: preset("现代办公", "#1F2937", "#6B7280", [["primary", "Office Blue", "#3B82F6", "主按钮、链接、当前导航"], ["secondary", "Slate Soft", "#E2E8F0", "次级按钮、分割区域"], ["accent", "Teal Fresh", "#14B8A6", "成功状态、轻量强调"], ["background", "Workspace", "#F5F7FA", "低眩光页面背景"], ["surface", "Clean Surface", "#FFFFFF", "卡片、输入、数据面板"]]),
  warmReading: preset("暖纸阅读", "#2F2A24", "#7A6B5C", [["primary", "Walnut", "#7C4A2D", "文章链接、主操作"], ["secondary", "Paper Beige", "#EFE4D2", "次级背景、提示容器"], ["accent", "Olive Gold", "#A78B4F", "引导提示、小面积强调"], ["background", "Paper White", "#FBF7EF", "长阅读背景"], ["surface", "Cream Panel", "#FFFDF8", "卡片、侧栏、目录"]]),
  pastelFocus: preset("薰衣草雾", "#312E5C", "#6E6A93", [["primary", "Lavender", "#7C6FF6", "轻量主按钮、聚焦状态"], ["secondary", "Lilac Mist", "#E9E5FF", "分组背景、信息区域"], ["accent", "Soft Pink", "#F0A6CA", "CTA、提醒、徽标"], ["background", "Cloud Lilac", "#FAF9FF", "干净页面背景"], ["surface", "White Lilac", "#FFFFFF", "卡片、筛选区域"]]),
  solarizedLight: preset("海盐薄荷", "#163B3A", "#5F7F7D", [["primary", "Deep Mint", "#0F766E", "链接、主按钮、信息状态"], ["secondary", "Mint Wash", "#CCFBF1", "成功状态、辅助强调"], ["accent", "Coral", "#FB7185", "重点标记、提示"], ["background", "Sea Salt", "#F0FDFA", "舒适页面背景"], ["surface", "Foam", "#FFFFFF", "卡片、代码块、面板"]]),
  nordCalm: preset("北境冰蓝", "#1E293B", "#64748B", [["primary", "Frost Blue", "#4F7CAC", "主按钮、链接、选中状态"], ["secondary", "Ice Blue", "#DCEBFA", "图表、辅助按钮"], ["accent", "Aurora", "#9B8AFB", "柔和强调、装饰元素"], ["background", "Snow", "#F4F7FB", "低噪声页面背景"], ["surface", "Ice Surface", "#FFFFFF", "卡片、面板、输入区域"]]),
  softIvory: preset("月光石灰", "#26313D", "#718096", [["primary", "Moon Slate", "#3A4A5F", "标题、导航、主操作"], ["secondary", "Stone Mist", "#E6EAF0", "次级按钮、分组背景"], ["accent", "Calm Blue", "#7BA7C7", "链接、轻量强调"], ["background", "Moon White", "#F6F7F9", "低噪声页面背景"], ["surface", "Clean White", "#FFFFFF", "卡片、表格、输入区域"]]),
  sageStone: preset("森林雾绿", "#1F352D", "#687A70", [["primary", "Forest", "#2F6B4F", "品牌主色、主要按钮"], ["secondary", "Sage Wash", "#DDEADF", "标签、辅助区域"], ["accent", "Clay Gold", "#C6A15B", "徽标、重点数据"], ["background", "Moss White", "#F4F8F3", "自然舒缓背景"], ["surface", "Leaf White", "#FFFFFF", "卡片、弹窗、表单"]]),
  mistBlue: preset("深海浅蓝", "#172A3A", "#607487", [["primary", "Ocean", "#1D6F8F", "主按钮、导航、链接"], ["secondary", "Aqua Mist", "#D8EEF4", "提示背景、辅助按钮"], ["accent", "Sea Coral", "#EF8E7D", "重点提醒、小面积点缀"], ["background", "Sea Foam", "#F3FAFC", "清爽页面背景"], ["surface", "White Wave", "#FFFFFF", "数据卡片、输入面板"]]),
  oatCoffee: preset("可可燕麦", "#3A2D28", "#7C685F", [["primary", "Cocoa", "#6B4636", "生活方式主色、标题"], ["secondary", "Oat", "#E8D8C3", "按钮、标签、筛选项"], ["accent", "Blue Gray", "#6F8AA3", "信息状态、链接"], ["background", "Oat Milk", "#FAF4EA", "温暖低疲劳背景"], ["surface", "Cream Foam", "#FFFDF8", "卡片、内容容器"]]),
  creamApricot: preset("蜜桃奶油", "#4A2F2A", "#8A6B64", [["primary", "Peach", "#D87A66", "主按钮、品牌识别"], ["secondary", "Cream Peach", "#F8D8CB", "辅助背景、标签"], ["accent", "Berry", "#B65C7A", "温柔提醒、徽标"], ["background", "Peach White", "#FFF6F2", "柔和页面背景"], ["surface", "Milk White", "#FFFFFF", "卡片、输入、浮层"]]),
  pearlMist: preset("珍珠紫灰", "#2D2A3D", "#77738A", [["primary", "Pearl Purple", "#6D5BD0", "标题、导航、主操作"], ["secondary", "Purple Mist", "#E7E3FF", "辅助按钮、边框"], ["accent", "Soft Mint", "#7BCDBA", "轻量高亮、图表"], ["background", "Pearl White", "#FAFAFF", "清爽应用背景"], ["surface", "White Pearl", "#FFFFFF", "数据面板、列表"]]),
};

function preset(name: string, text: string, muted: string, colors: Array<[string, string, string, string]>): PalettePreset {
  return {
    name,
    text,
    muted,
    colors: colors.map(([role, label, hex, usage]) => ({ role, label, hex, usage })),
  };
}

export function paletteStyleConfig(style = "tech") {
  return STYLES[style] || STYLES.tech;
}

export function palettePresetConfig(): Record<string, PalettePreset>;
export function palettePresetConfig(presetId: string): PalettePreset | null;
export function palettePresetConfig(presetId?: string): Record<string, PalettePreset> | PalettePreset | null {
  return presetId === undefined ? PRESETS : PRESETS[presetId] || null;
}

export function normalizeHexColor(value: string) {
  const raw = value.trim();
  const hex = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toUpperCase() : null;
}

export function buildGeneratedPalette(baseHsl: Hsl, styleConfig: PaletteStyle) {
  const colors = [
    paletteColor("primary", "主色", hslToHex(baseHsl.h, styleConfig.primaryS, styleConfig.primaryL), "主按钮、链接、关键高亮"),
    paletteColor("secondary", "辅助色", hslToHex(baseHsl.h + styleConfig.secondaryShift, styleConfig.secondaryS, styleConfig.secondaryL), "标签、图表、辅助按钮"),
    paletteColor("accent", "强调色", hslToHex(baseHsl.h + styleConfig.accentShift, styleConfig.accentS, styleConfig.accentL), "活动状态、徽标、重点提醒"),
    paletteColor("background", "背景色", hslToHex(baseHsl.h + styleConfig.bgShift, styleConfig.bgS, styleConfig.bgL), "页面背景、大面积留白"),
    paletteColor("surface", "卡片色", hslToHex(baseHsl.h + styleConfig.surfaceShift, styleConfig.surfaceS, styleConfig.surfaceL), "卡片、面板、输入区域"),
  ];
  const textHex = readableTextColor(colors[3].hex);
  const mutedHex = hslToHex(baseHsl.h, 16, textHex === "#FFFFFF" ? 78 : 38);
  colors.push(paletteColor("text", "文字色", textHex === "#FFFFFF" ? "#F8FAFC" : "#10202B", "标题和正文"));
  colors.push(paletteColor("muted", "弱文字", mutedHex, "说明文字、次级信息"));
  return colors;
}

export function buildPresetPalette(palettePreset: PalettePreset) {
  const colors = palettePreset.colors.map((color) => paletteColor(color.role, color.label, color.hex, color.usage));
  colors.push(paletteColor("text", "文字色", palettePreset.text, "标题和正文"));
  colors.push(paletteColor("muted", "弱文字", palettePreset.muted, "说明文字、次级信息"));
  return colors;
}

export function paletteColor(role: string, label: string, hex: string, usage: string): PaletteColor {
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);
  return {
    role,
    label,
    hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
    usage,
  };
}

export function buildPaletteCss(colors: PaletteColor[]) {
  return `:root {\n${colors.map((color) => `  --color-${color.role}: ${color.hex};`).join("\n")}\n}`;
}

export function buildPaletteGuide(styleName: string, colors: PaletteColor[], isPreset: boolean) {
  const primary = colors.find((color) => color.role === "primary") || colors[0];
  const accent = colors.find((color) => color.role === "accent") || colors[2];
  const background = colors.find((color) => color.role === "background") || colors[3];
  return [
    `${isPreset ? "精选方案" : "生成风格"}：${styleName}`,
    `建议比例：背景 ${background.hex} 使用 60%，主色 ${primary.hex} 使用 30%，强调色 ${accent.hex} 控制在 10% 以内。`,
    "主色用于关键按钮和链接，辅助色用于图表或次级操作，强调色只用于提醒、徽标和关键数据。",
    "如果用于正式产品页，建议再根据品牌资产微调饱和度，并检查真实文本的对比度。",
  ].join("\n");
}
