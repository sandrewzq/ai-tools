import { hexToHsl, hexToRgb, hslToHex, readableTextColor } from "../../shared/color.js";

export function paletteStyleConfig(style) {
  const configs = {
    tech: { name: "科技冷静", primaryS: 76, primaryL: 54, secondaryShift: 78, secondaryS: 64, secondaryL: 45, accentShift: -42, accentS: 82, accentL: 58, bgShift: 8, bgS: 42, bgL: 96, surfaceShift: 4, surfaceS: 36, surfaceL: 100 },
    warm: { name: "温暖友好", primaryS: 72, primaryL: 52, secondaryShift: 34, secondaryS: 70, secondaryL: 62, accentShift: -24, accentS: 78, accentL: 60, bgShift: 18, bgS: 58, bgL: 95, surfaceShift: 12, surfaceS: 50, surfaceL: 99 },
    fresh: { name: "清爽自然", primaryS: 62, primaryL: 46, secondaryShift: 42, secondaryS: 54, secondaryL: 50, accentShift: 96, accentS: 58, accentL: 56, bgShift: 36, bgS: 48, bgL: 96, surfaceShift: 28, surfaceS: 42, surfaceL: 99 },
    luxury: { name: "高级克制", primaryS: 42, primaryL: 34, secondaryShift: 28, secondaryS: 36, secondaryL: 48, accentShift: -36, accentS: 48, accentL: 44, bgShift: 8, bgS: 22, bgL: 94, surfaceShift: 5, surfaceS: 18, surfaceL: 98 },
    cyber: { name: "赛博活力", primaryS: 88, primaryL: 58, secondaryShift: 118, secondaryS: 86, secondaryL: 54, accentShift: -86, accentS: 90, accentL: 62, bgShift: 220, bgS: 28, bgL: 10, surfaceShift: 220, surfaceS: 24, surfaceL: 16 },
  };
  return configs[style] || configs.tech;
}

export function palettePresetConfig(preset) {
  const presets = {
    sakura: {
      name: "雾白深蓝",
      text: "#1F2937",
      muted: "#667085",
      colors: [
        { role: "primary", label: "Deep Blue", hex: "#2563EB", usage: "主按钮、链接、导航选中" },
        { role: "secondary", label: "Sky Mist", hex: "#DBEAFE", usage: "标签底色、辅助模块" },
        { role: "accent", label: "Soft Cyan", hex: "#06B6D4", usage: "数据高亮、轻量强调" },
        { role: "background", label: "Cloud White", hex: "#F8FAFC", usage: "清爽页面背景" },
        { role: "surface", label: "Pure Surface", hex: "#FFFFFF", usage: "卡片、输入、弹窗" },
      ],
    },
    bamboo: {
      name: "鼠尾草奶油",
      text: "#24352F",
      muted: "#6B7A72",
      colors: [
        { role: "primary", label: "Sage", hex: "#5F8D73", usage: "自然主按钮、品牌识别" },
        { role: "secondary", label: "Pale Sage", hex: "#D8E7DD", usage: "标签、信息块背景" },
        { role: "accent", label: "Warm Sand", hex: "#D6A96A", usage: "小面积强调、徽标" },
        { role: "background", label: "Cream", hex: "#F7F3EA", usage: "柔和页面背景" },
        { role: "surface", label: "Soft Linen", hex: "#FFFCF6", usage: "卡片、表单、浮层" },
      ],
    },
    porcelain: {
      name: "冷雾青瓷",
      text: "#20313A",
      muted: "#607D87",
      colors: [
        { role: "primary", label: "Porcelain Teal", hex: "#2F8F9D", usage: "主按钮、链接、导航" },
        { role: "secondary", label: "Mist Blue", hex: "#D7E9ED", usage: "次级区域、提示背景" },
        { role: "accent", label: "Lake Blue", hex: "#6D9DC5", usage: "图表、数据高亮" },
        { role: "background", label: "Blue Fog", hex: "#F2F7F8", usage: "低眩光页面背景" },
        { role: "surface", label: "Ice Surface", hex: "#FFFFFF", usage: "内容卡片、输入区域" },
      ],
    },
    sunset: {
      name: "杏仁暖阳",
      text: "#3F332A",
      muted: "#7C6656",
      colors: [
        { role: "primary", label: "Terracotta", hex: "#C96F4A", usage: "温暖主按钮、品牌色" },
        { role: "secondary", label: "Apricot", hex: "#F4C7A1", usage: "标签、辅助按钮" },
        { role: "accent", label: "Honey", hex: "#E7A84B", usage: "重点提醒、小面积点缀" },
        { role: "background", label: "Almond", hex: "#FAF1E6", usage: "温润页面背景" },
        { role: "surface", label: "Warm White", hex: "#FFF8F0", usage: "卡片、弹窗、内容容器" },
      ],
    },
    ink: {
      name: "炭黑云灰",
      text: "#111827",
      muted: "#6B7280",
      colors: [
        { role: "primary", label: "Charcoal", hex: "#111827", usage: "高级主按钮、标题强调" },
        { role: "secondary", label: "Cool Gray", hex: "#E5E7EB", usage: "分割区域、辅助背景" },
        { role: "accent", label: "Clean Indigo", hex: "#6366F1", usage: "链接、重点操作" },
        { role: "background", label: "Snow Gray", hex: "#F9FAFB", usage: "干净页面背景" },
        { role: "surface", label: "White Panel", hex: "#FFFFFF", usage: "卡片、面板、输入" },
      ],
    },
    cream: {
      name: "奶油玫瑰",
      text: "#443137",
      muted: "#8B6F78",
      colors: [
        { role: "primary", label: "Rose Taupe", hex: "#A55C6B", usage: "柔和主按钮、品牌识别" },
        { role: "secondary", label: "Blush", hex: "#F3D7DC", usage: "辅助按钮、信息底色" },
        { role: "accent", label: "Peach", hex: "#E7A08B", usage: "强调按钮、提示状态" },
        { role: "background", label: "Cream Rose", hex: "#FFF5F3", usage: "页面背景、营销区块" },
        { role: "surface", label: "Soft White", hex: "#FFFFFF", usage: "卡片、浮层、表单区域" },
      ],
    },
    softNeutral: {
      name: "现代办公",
      text: "#1F2937",
      muted: "#6B7280",
      colors: [
        { role: "primary", label: "Office Blue", hex: "#3B82F6", usage: "主按钮、链接、当前导航" },
        { role: "secondary", label: "Slate Soft", hex: "#E2E8F0", usage: "次级按钮、分割区域" },
        { role: "accent", label: "Teal Fresh", hex: "#14B8A6", usage: "成功状态、轻量强调" },
        { role: "background", label: "Workspace", hex: "#F5F7FA", usage: "低眩光页面背景" },
        { role: "surface", label: "Clean Surface", hex: "#FFFFFF", usage: "卡片、输入、数据面板" },
      ],
    },
    warmReading: {
      name: "暖纸阅读",
      text: "#2F2A24",
      muted: "#7A6B5C",
      colors: [
        { role: "primary", label: "Walnut", hex: "#7C4A2D", usage: "文章链接、主操作" },
        { role: "secondary", label: "Paper Beige", hex: "#EFE4D2", usage: "次级背景、提示容器" },
        { role: "accent", label: "Olive Gold", hex: "#A78B4F", usage: "引导提示、小面积强调" },
        { role: "background", label: "Paper White", hex: "#FBF7EF", usage: "长阅读背景" },
        { role: "surface", label: "Cream Panel", hex: "#FFFDF8", usage: "卡片、侧栏、目录" },
      ],
    },
    pastelFocus: {
      name: "薰衣草雾",
      text: "#312E5C",
      muted: "#6E6A93",
      colors: [
        { role: "primary", label: "Lavender", hex: "#7C6FF6", usage: "轻量主按钮、聚焦状态" },
        { role: "secondary", label: "Lilac Mist", hex: "#E9E5FF", usage: "分组背景、信息区域" },
        { role: "accent", label: "Soft Pink", hex: "#F0A6CA", usage: "CTA、提醒、徽标" },
        { role: "background", label: "Cloud Lilac", hex: "#FAF9FF", usage: "干净页面背景" },
        { role: "surface", label: "White Lilac", hex: "#FFFFFF", usage: "卡片、筛选区域" },
      ],
    },
    solarizedLight: {
      name: "海盐薄荷",
      text: "#163B3A",
      muted: "#5F7F7D",
      colors: [
        { role: "primary", label: "Deep Mint", hex: "#0F766E", usage: "链接、主按钮、信息状态" },
        { role: "secondary", label: "Mint Wash", hex: "#CCFBF1", usage: "成功状态、辅助强调" },
        { role: "accent", label: "Coral", hex: "#FB7185", usage: "重点标记、提示" },
        { role: "background", label: "Sea Salt", hex: "#F0FDFA", usage: "舒适页面背景" },
        { role: "surface", label: "Foam", hex: "#FFFFFF", usage: "卡片、代码块、面板" },
      ],
    },
    nordCalm: {
      name: "北境冰蓝",
      text: "#1E293B",
      muted: "#64748B",
      colors: [
        { role: "primary", label: "Frost Blue", hex: "#4F7CAC", usage: "主按钮、链接、选中状态" },
        { role: "secondary", label: "Ice Blue", hex: "#DCEBFA", usage: "图表、辅助按钮" },
        { role: "accent", label: "Aurora", hex: "#9B8AFB", usage: "柔和强调、装饰元素" },
        { role: "background", label: "Snow", hex: "#F4F7FB", usage: "低噪声页面背景" },
        { role: "surface", label: "Ice Surface", hex: "#FFFFFF", usage: "卡片、面板、输入区域" },
      ],
    },
    softIvory: {
      name: "月光石灰",
      text: "#26313D",
      muted: "#718096",
      colors: [
        { role: "primary", label: "Moon Slate", hex: "#3A4A5F", usage: "标题、导航、主操作" },
        { role: "secondary", label: "Stone Mist", hex: "#E6EAF0", usage: "次级按钮、分组背景" },
        { role: "accent", label: "Calm Blue", hex: "#7BA7C7", usage: "链接、轻量强调" },
        { role: "background", label: "Moon White", hex: "#F6F7F9", usage: "低噪声页面背景" },
        { role: "surface", label: "Clean White", hex: "#FFFFFF", usage: "卡片、表格、输入区域" },
      ],
    },
    sageStone: {
      name: "森林雾绿",
      text: "#1F352D",
      muted: "#687A70",
      colors: [
        { role: "primary", label: "Forest", hex: "#2F6B4F", usage: "品牌主色、主要按钮" },
        { role: "secondary", label: "Sage Wash", hex: "#DDEADF", usage: "标签、辅助区域" },
        { role: "accent", label: "Clay Gold", hex: "#C6A15B", usage: "徽标、重点数据" },
        { role: "background", label: "Moss White", hex: "#F4F8F3", usage: "自然舒缓背景" },
        { role: "surface", label: "Leaf White", hex: "#FFFFFF", usage: "卡片、弹窗、表单" },
      ],
    },
    mistBlue: {
      name: "深海浅蓝",
      text: "#172A3A",
      muted: "#607487",
      colors: [
        { role: "primary", label: "Ocean", hex: "#1D6F8F", usage: "主按钮、导航、链接" },
        { role: "secondary", label: "Aqua Mist", hex: "#D8EEF4", usage: "提示背景、辅助按钮" },
        { role: "accent", label: "Sea Coral", hex: "#EF8E7D", usage: "重点提醒、小面积点缀" },
        { role: "background", label: "Sea Foam", hex: "#F3FAFC", usage: "清爽页面背景" },
        { role: "surface", label: "White Wave", hex: "#FFFFFF", usage: "数据卡片、输入面板" },
      ],
    },
    oatCoffee: {
      name: "可可燕麦",
      text: "#3A2D28",
      muted: "#7C685F",
      colors: [
        { role: "primary", label: "Cocoa", hex: "#6B4636", usage: "生活方式主色、标题" },
        { role: "secondary", label: "Oat", hex: "#E8D8C3", usage: "按钮、标签、筛选项" },
        { role: "accent", label: "Blue Gray", hex: "#6F8AA3", usage: "信息状态、链接" },
        { role: "background", label: "Oat Milk", hex: "#FAF4EA", usage: "温暖低疲劳背景" },
        { role: "surface", label: "Cream Foam", hex: "#FFFDF8", usage: "卡片、内容容器" },
      ],
    },
    creamApricot: {
      name: "蜜桃奶油",
      text: "#4A2F2A",
      muted: "#8A6B64",
      colors: [
        { role: "primary", label: "Peach", hex: "#D87A66", usage: "主按钮、品牌识别" },
        { role: "secondary", label: "Cream Peach", hex: "#F8D8CB", usage: "辅助背景、标签" },
        { role: "accent", label: "Berry", hex: "#B65C7A", usage: "温柔提醒、徽标" },
        { role: "background", label: "Peach White", hex: "#FFF6F2", usage: "柔和页面背景" },
        { role: "surface", label: "Milk White", hex: "#FFFFFF", usage: "卡片、输入、浮层" },
      ],
    },
    pearlMist: {
      name: "珍珠紫灰",
      text: "#2D2A3D",
      muted: "#77738A",
      colors: [
        { role: "primary", label: "Pearl Purple", hex: "#6D5BD0", usage: "标题、导航、主操作" },
        { role: "secondary", label: "Purple Mist", hex: "#E7E3FF", usage: "辅助按钮、边框" },
        { role: "accent", label: "Soft Mint", hex: "#7BCDBA", usage: "轻量高亮、图表" },
        { role: "background", label: "Pearl White", hex: "#FAFAFF", usage: "清爽应用背景" },
        { role: "surface", label: "White Pearl", hex: "#FFFFFF", usage: "数据面板、列表" },
      ],
    },
  };
  return preset === undefined ? presets : presets[preset] || null;
}

export function buildGeneratedPalette(baseHsl, styleConfig) {
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

export function buildPresetPalette(preset) {
  const colors = preset.colors.map((color) => paletteColor(color.role, color.label, color.hex, color.usage));
  colors.push(paletteColor("text", "文字色", preset.text, "标题和正文"));
  colors.push(paletteColor("muted", "弱文字", preset.muted, "说明文字、次级信息"));
  return colors;
}

export function paletteColor(role, label, hex, usage) {
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
