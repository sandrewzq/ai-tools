import { hexToHsl, hexToRgb, hslToHex, readableTextColor } from "./src/shared/color.js";
import { escapeHtml, formatMs, formatNumber, prettyJson, shorten, timestampString } from "./src/shared/format.js";
import { deepMerge, parseJsonObject } from "./src/shared/object.js";
import { average, numericSort, percentile, roughTokenEstimate } from "./src/shared/stats.js";
import { getStorageItem, removeStorageItem, setStorageItem } from "./src/shared/storage.js";
import { joinUrl, shouldUseProxy } from "./src/shared/url.js";
import { normalizeErrorMessage, parseFloatOrThrow, parseNonNegativeInt, parsePositiveInt, safeReadText } from "./src/shared/validation.js";
import { getToolIds } from "./src/core/registry.js";

const STORAGE_KEY = "llm-speed-bench-static-v1";
const DEFAULT_VIEW = "home";
const DEFAULT_PALETTE = {
  style: "tech",
  preset: "sakura",
  baseColor: "#2563eb",
};

const dom = {
  homeView: document.querySelector("#homeView"),
  speedTestView: document.querySelector("#speedTestView"),
  colorPaletteView: document.querySelector("#colorPaletteView"),
  viewLinks: document.querySelectorAll("[data-view-link]"),
  paletteStyleInput: document.querySelector("#paletteStyleInput"),
  palettePresetInput: document.querySelector("#palettePresetInput"),
  paletteBaseColorInput: document.querySelector("#paletteBaseColorInput"),
  paletteBaseColorTextInput: document.querySelector("#paletteBaseColorTextInput"),
  paletteBaseColorPreview: document.querySelector("#paletteBaseColorPreview"),
  paletteAutoModeBtn: document.querySelector("#paletteAutoModeBtn"),
  palettePresetModeBtn: document.querySelector("#palettePresetModeBtn"),
  palettePresetTabs: document.querySelector("#palettePresetTabs"),
  generatePaletteBtn: document.querySelector("#generatePaletteBtn"),
  resetPaletteBtn: document.querySelector("#resetPaletteBtn"),
  copyPaletteCssBtn: document.querySelector("#copyPaletteCssBtn"),
  copyPaletteJsonBtn: document.querySelector("#copyPaletteJsonBtn"),
  paletteStatus: document.querySelector("#paletteStatus"),
  paletteSwatches: document.querySelector("#paletteSwatches"),
  paletteCssOutput: document.querySelector("#paletteCssOutput"),
  paletteGuideOutput: document.querySelector("#paletteGuideOutput"),
  palettePreview: document.querySelector("#palettePreview"),
  palettePreviewBrand: document.querySelector("#palettePreviewBrand"),
  palettePreviewNavPrimary: document.querySelector("#palettePreviewNavPrimary"),
  palettePreviewNavSecondary: document.querySelector("#palettePreviewNavSecondary"),
  palettePreviewNavTertiary: document.querySelector("#palettePreviewNavTertiary"),
  palettePreviewKicker: document.querySelector("#palettePreviewKicker"),
  palettePreviewTitle: document.querySelector("#palettePreviewTitle"),
  palettePreviewText: document.querySelector("#palettePreviewText"),
  palettePreviewAction: document.querySelector("#palettePreviewAction"),
  promptInput: document.querySelector("#promptInput"),
  systemPromptInput: document.querySelector("#systemPromptInput"),
  roundsInput: document.querySelector("#roundsInput"),
  warmupInput: document.querySelector("#warmupInput"),
  maxTokensInput: document.querySelector("#maxTokensInput"),
  temperatureInput: document.querySelector("#temperatureInput"),
  addOpenAiBtn: document.querySelector("#addOpenAiBtn"),
  addAnthropicBtn: document.querySelector("#addAnthropicBtn"),
  addOllamaBtn: document.querySelector("#addOllamaBtn"),
  exampleBtn: document.querySelector("#exampleBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  runBtn: document.querySelector("#runBtn"),
  stopBtn: document.querySelector("#stopBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  clearLogBtn: document.querySelector("#clearLogBtn"),
  targetsContainer: document.querySelector("#targetsContainer"),
  targetTemplate: document.querySelector("#targetTemplate"),
  summaryEmpty: document.querySelector("#summaryEmpty"),
  summaryBoard: document.querySelector("#summaryBoard"),
  summaryTableWrap: document.querySelector("#summaryTableWrap"),
  summaryTableBody: document.querySelector("#summaryTableBody"),
  detailsEmpty: document.querySelector("#detailsEmpty"),
  detailsTableWrap: document.querySelector("#detailsTableWrap"),
  detailsTableBody: document.querySelector("#detailsTableBody"),
  logOutput: document.querySelector("#logOutput"),
  statusMessage: document.querySelector("#statusMessage"),
};

let currentAbortController = null;
let latestExportPayload = null;
let latestPalettePayload = null;

bootstrap();

function bootstrap() {
  bindEvents();
  syncViewFromHash();
  if (window.location.protocol === "file:") {
    log("当前是直接打开的本地页面模式。", "info", true);
  } else if (!shouldUseProxy()) {
    log("当前是静态发布模式，会直接请求目标接口；如果接口未开启 CORS，浏览器会拦截请求。", "info", true);
  }
  restoreFromStorage();
  if (!dom.targetsContainer.children.length) {
    addTargetCard({ kind: "openai" });
  }
  renderPalettePresetTabs();
  setPaletteMode("auto", false);
  generatePalette();
  syncExportButton();
}

function bindEvents() {
  window.addEventListener("hashchange", syncViewFromHash);
  dom.viewLinks.forEach((link) => {
    link.addEventListener("click", () => showView(link.dataset.viewLink));
  });
  dom.addOpenAiBtn.addEventListener("click", () => addTargetCard({ kind: "openai" }));
  dom.addAnthropicBtn.addEventListener("click", () => addTargetCard({ kind: "anthropic" }));
  dom.addOllamaBtn.addEventListener("click", () => addTargetCard({ kind: "ollama" }));
  dom.paletteAutoModeBtn.addEventListener("click", () => setPaletteMode("auto"));
  dom.palettePresetModeBtn.addEventListener("click", () => setPaletteMode("preset"));
  dom.generatePaletteBtn.addEventListener("click", generatePalette);
  dom.resetPaletteBtn.addEventListener("click", resetPalette);
  dom.copyPaletteCssBtn.addEventListener("click", () => copyPaletteText(dom.paletteCssOutput.value, "CSS 变量已复制。"));
  dom.copyPaletteJsonBtn.addEventListener("click", () => copyPaletteText(JSON.stringify(latestPalettePayload, null, 2), "JSON 已复制。"));
  dom.paletteStyleInput.addEventListener("input", generatePalette);
  dom.paletteStyleInput.addEventListener("change", generatePalette);
  dom.paletteBaseColorInput.addEventListener("input", () => syncBaseColor(dom.paletteBaseColorInput.value));
  dom.paletteBaseColorInput.addEventListener("change", () => syncBaseColor(dom.paletteBaseColorInput.value));
  dom.paletteBaseColorTextInput.addEventListener("input", () => syncBaseColorText(dom.paletteBaseColorTextInput.value));
  dom.paletteBaseColorTextInput.addEventListener("change", () => syncBaseColorText(dom.paletteBaseColorTextInput.value));
  dom.palettePresetInput.addEventListener("change", () => {
    setPaletteMode("preset", false);
    generatePalette();
  });
  dom.exampleBtn.addEventListener("click", fillExampleConfig);
  dom.resetBtn.addEventListener("click", resetPage);
  dom.runBtn.addEventListener("click", runBenchmark);
  dom.stopBtn.addEventListener("click", stopBenchmark);
  dom.exportBtn.addEventListener("click", exportResults);
  dom.clearLogBtn.addEventListener("click", () => {
    dom.logOutput.textContent = "等待开始…";
  });

  [
    dom.promptInput,
    dom.systemPromptInput,
    dom.roundsInput,
    dom.warmupInput,
    dom.maxTokensInput,
    dom.temperatureInput,
  ].forEach((element) => {
    element.addEventListener("input", saveToStorage);
  });
}

function syncViewFromHash() {
  const view = window.location.hash.replace("#", "") || DEFAULT_VIEW;
  showView(view);
}

function showView(view) {
  const normalizedView = getToolIds().includes(view) ? view : DEFAULT_VIEW;
  dom.homeView.classList.toggle("hidden", normalizedView !== "home");
  dom.speedTestView.classList.toggle("hidden", normalizedView !== "speed-test");
  dom.colorPaletteView.classList.toggle("hidden", normalizedView !== "color-palette");
  dom.viewLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === normalizedView);
  });
}

function setPaletteMode(mode, shouldGenerate = true) {
  const normalizedMode = mode === "preset" ? "preset" : "auto";
  dom.palettePresetInput.value = normalizedMode === "preset" && dom.palettePresetInput.value
    ? dom.palettePresetInput.value
    : "";
  dom.paletteAutoModeBtn.classList.toggle("active", normalizedMode === "auto");
  dom.palettePresetModeBtn.classList.toggle("active", normalizedMode === "preset");
  dom.palettePresetTabs.classList.toggle("hidden", normalizedMode !== "preset");
  document.querySelectorAll(".palette-auto-field").forEach((element) => {
    element.classList.toggle("hidden", normalizedMode !== "auto");
  });
  if (normalizedMode === "preset" && !dom.palettePresetInput.value) {
    dom.palettePresetInput.value = DEFAULT_PALETTE.preset;
  }
  syncPalettePresetTabs();
  if (shouldGenerate) {
    generatePalette();
  }
}

function syncBaseColor(hex) {
  const normalizedHex = normalizeHexColor(hex);
  if (!normalizedHex) {
    return;
  }
  dom.paletteBaseColorInput.value = normalizedHex;
  dom.paletteBaseColorTextInput.value = normalizedHex;
  dom.paletteBaseColorPreview.style.setProperty("--selected-color", normalizedHex);
  generatePalette();
}

function syncBaseColorText(value) {
  const normalizedHex = normalizeHexColor(value);
  if (!normalizedHex) {
    return;
  }
  syncBaseColor(normalizedHex);
}

function normalizeHexColor(value) {
  const raw = value.trim();
  const hex = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toUpperCase() : null;
}

function generatePalette() {
  const style = dom.paletteStyleInput.value;
  const preset = dom.palettePresetInput.value;
  const baseHex = dom.paletteBaseColorInput.value;
  const baseHsl = hexToHsl(baseHex);
  const styleConfig = paletteStyleConfig(style);
  const presetConfig = palettePresetConfig(preset);
  const colors = presetConfig
    ? buildPresetPalette(presetConfig)
    : buildGeneratedPalette(baseHsl, styleConfig);

  const css = buildPaletteCss(colors);
  const guide = buildPaletteGuide(presetConfig?.name || styleConfig.name, colors, Boolean(presetConfig));
  latestPalettePayload = {
    style: presetConfig?.name || styleConfig.name,
    mode: presetConfig ? "preset" : "generated",
    colors,
    cssVariables: Object.fromEntries(colors.map((color) => [`--color-${color.role}`, color.hex])),
  };

  renderPaletteSwatches(colors);
  dom.paletteCssOutput.value = css;
  dom.paletteGuideOutput.value = guide;
  applyPalettePreview(colors);
}

function renderPalettePresetTabs() {
  const presets = palettePresetConfig();
  dom.palettePresetTabs.innerHTML = Object.entries(presets)
    .map(([id, preset]) => `
      <button class="palette-preset-tab" type="button" data-palette-preset="${id}">
        <span class="preset-color-row">
          ${preset.colors.slice(0, 5).map((color) => `<i style="--preset-color:${color.hex}"></i>`).join("")}
        </span>
        <strong>${escapeHtml(preset.name)}</strong>
      </button>
    `)
    .join("");
  dom.palettePresetTabs.querySelectorAll("[data-palette-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      dom.palettePresetInput.value = button.dataset.palettePreset;
      setPaletteMode("preset");
    });
  });
  syncPalettePresetTabs();
}

function syncPalettePresetTabs() {
  dom.palettePresetTabs.querySelectorAll("[data-palette-preset]").forEach((button) => {
    button.classList.toggle("active", button.dataset.palettePreset === dom.palettePresetInput.value);
  });
}

function resetPalette() {
  dom.paletteStyleInput.value = DEFAULT_PALETTE.style;
  dom.palettePresetInput.value = "";
  syncBaseColor(DEFAULT_PALETTE.baseColor);
  setPaletteMode("auto", false);
  generatePalette();
  showPaletteStatus("已恢复默认配色参数。", "info");
}

function buildGeneratedPalette(baseHsl, styleConfig) {
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

function buildPresetPalette(preset) {
  const colors = preset.colors.map((color) => paletteColor(color.role, color.label, color.hex, color.usage));
  colors.push(paletteColor("text", "文字色", preset.text, "标题和正文"));
  colors.push(paletteColor("muted", "弱文字", preset.muted, "说明文字、次级信息"));
  return colors;
}

function paletteColor(role, label, hex, usage) {
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

function paletteStyleConfig(style) {
  const configs = {
    tech: { name: "科技冷静", primaryS: 76, primaryL: 54, secondaryShift: 78, secondaryS: 64, secondaryL: 45, accentShift: -42, accentS: 82, accentL: 58, bgShift: 8, bgS: 42, bgL: 96, surfaceShift: 4, surfaceS: 36, surfaceL: 100 },
    warm: { name: "温暖友好", primaryS: 72, primaryL: 52, secondaryShift: 34, secondaryS: 70, secondaryL: 62, accentShift: -24, accentS: 78, accentL: 60, bgShift: 18, bgS: 58, bgL: 95, surfaceShift: 12, surfaceS: 50, surfaceL: 99 },
    fresh: { name: "清爽自然", primaryS: 62, primaryL: 46, secondaryShift: 42, secondaryS: 54, secondaryL: 50, accentShift: 96, accentS: 58, accentL: 56, bgShift: 36, bgS: 48, bgL: 96, surfaceShift: 28, surfaceS: 42, surfaceL: 99 },
    luxury: { name: "高级克制", primaryS: 42, primaryL: 34, secondaryShift: 28, secondaryS: 36, secondaryL: 48, accentShift: -36, accentS: 48, accentL: 44, bgShift: 8, bgS: 22, bgL: 94, surfaceShift: 5, surfaceS: 18, surfaceL: 98 },
    cyber: { name: "赛博活力", primaryS: 88, primaryL: 58, secondaryShift: 118, secondaryS: 86, secondaryL: 54, accentShift: -86, accentS: 90, accentL: 62, bgShift: 220, bgS: 28, bgL: 10, surfaceShift: 220, surfaceS: 24, surfaceL: 16 },
  };
  return configs[style] || configs.tech;
}

function palettePresetConfig(preset) {
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

function renderPaletteSwatches(colors) {
  dom.paletteSwatches.innerHTML = colors
    .map(
      (color) => `
        <article class="palette-swatch" style="--swatch-color:${color.hex}">
          <span class="swatch-chip"></span>
          <strong>${escapeHtml(color.label)}</strong>
          <div class="swatch-copy-row">
            <button class="swatch-copy-btn" type="button" data-copy-color="${color.hex}" data-copy-label="HEX">HEX ${color.hex}</button>
            <button class="swatch-copy-btn" type="button" data-copy-color="${escapeHtml(color.rgb)}" data-copy-label="RGB">RGB ${escapeHtml(color.rgb)}</button>
          </div>
          <small>${escapeHtml(color.usage)}</small>
        </article>
      `,
    )
    .join("");

  dom.paletteSwatches.querySelectorAll("[data-copy-color]").forEach((button) => {
    button.addEventListener("click", () => copyPaletteText(button.dataset.copyColor, `${button.dataset.copyLabel} 已复制：${button.dataset.copyColor}`));
  });
}

function buildPaletteCss(colors) {
  return `:root {\n${colors.map((color) => `  --color-${color.role}: ${color.hex};`).join("\n")}\n}`;
}

function buildPaletteGuide(styleName, colors, isPreset) {
  const primary = colors.find((color) => color.role === "primary");
  const accent = colors.find((color) => color.role === "accent");
  const background = colors.find((color) => color.role === "background");
  return [
    `${isPreset ? "精选方案" : "生成风格"}：${styleName}`,
    `建议比例：背景 ${background.hex} 使用 60%，主色 ${primary.hex} 使用 30%，强调色 ${accent.hex} 控制在 10% 以内。`,
    "主色用于关键按钮和链接，辅助色用于图表或次级操作，强调色只用于提醒、徽标和关键数据。",
    "如果用于正式产品页，建议再根据品牌资产微调饱和度，并检查真实文本的对比度。",
  ].join("\n");
}

function applyPalettePreview(colors) {
  colors.forEach((color) => {
    dom.palettePreview.style.setProperty(`--preview-${color.role}`, color.hex);
  });
}

async function copyPaletteText(text, message) {
  if (!text) {
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showPaletteStatus(message, "success");
  } catch {
    showPaletteStatus("复制失败，请手动复制文本框内容。", "error");
  }
}

function showPaletteStatus(message, level) {
  dom.paletteStatus.textContent = message;
  dom.paletteStatus.className = `status-message status-${level}`;
}

function addTargetCard(initial = {}) {
  const fragment = dom.targetTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".target-card");
  const enabled = card.querySelector(".target-enabled");
  const name = card.querySelector(".target-name");
  const kind = card.querySelector(".target-kind");
  const baseUrl = card.querySelector(".target-base-url");
  const model = card.querySelector(".target-model");
  const modelSelect = card.querySelector(".target-model-select");
  const fetchModelsBtn = card.querySelector(".fetch-models-btn");
  const endpointPath = card.querySelector(".target-endpoint-path");
  const apiKey = card.querySelector(".target-api-key");
  const extraHeaders = card.querySelector(".target-extra-headers");
  const extraBody = card.querySelector(".target-extra-body");
  const badge = card.querySelector(".target-type-badge");
  const removeBtn = card.querySelector(".remove-target-btn");

  enabled.checked = initial.enabled ?? true;
  name.value = initial.name ?? "";
  kind.value = initial.kind ?? "openai";
  baseUrl.value = initial.baseUrl ?? "";
  model.value = initial.model ?? "";
  endpointPath.value = initial.endpointPath ?? defaultEndpointFor(kind.value);
  apiKey.value = initial.apiKey ?? "";
  extraHeaders.value = initial.extraHeadersText ?? prettyJson(initial.extraHeaders);
  extraBody.value = initial.extraBodyText ?? prettyJson(initial.extraBody);

  const saveFields = [enabled, name, kind, baseUrl, model, endpointPath, extraHeaders, extraBody];
  saveFields.forEach((element) => {
    element.addEventListener("input", saveToStorage);
    element.addEventListener("change", saveToStorage);
  });

  apiKey.addEventListener("input", () => {
    if (apiKey.dataset.noticeShown === "1") {
      return;
    }
    apiKey.dataset.noticeShown = "1";
    log("API Key 不会写入 localStorage，只保留在当前页面里。");
  });

  kind.addEventListener("change", () => {
    badge.textContent = typeLabel(kind.value);
    endpointPath.value = defaultEndpointFor(kind.value);
    apiKey.closest(".field").style.display = "flex";
    modelSelect.classList.add("hidden");
    saveToStorage();
  });

  removeBtn.addEventListener("click", () => {
    card.remove();
    saveToStorage();
  });

  fetchModelsBtn.addEventListener("click", async () => {
    await fetchModelList({
      kind: kind.value,
      baseUrl: baseUrl.value,
      apiKey: apiKey.value,
      extraHeaders: extraHeaders.value,
      modelInput: model,
      modelSelect: modelSelect,
      fetchBtn: fetchModelsBtn,
    });
  });

  modelSelect.addEventListener("change", () => {
    if (modelSelect.value) {
      model.value = modelSelect.value;
      saveToStorage();
    }
  });

  badge.textContent = typeLabel(kind.value);
  apiKey.closest(".field").style.display = "flex";

  dom.targetsContainer.appendChild(fragment);
}

function fillExampleConfig() {
  dom.promptInput.value = "请用 300 字解释什么是 RAG，并补充一个电商客服场景案例。";
  dom.systemPromptInput.value = "";
  dom.roundsInput.value = "3";
  dom.warmupInput.value = "1";
  dom.maxTokensInput.value = "256";
  dom.temperatureInput.value = "0";

  saveToStorage();
  showStatus("已填充测试参数，接口配置保持不变。", "info");
  log("已填充测试参数，接口配置保持不变。");
}

function resetPage() {
  if (!removeStorageItem(STORAGE_KEY)) {
    log("当前浏览器不允许清理本地缓存。", "error", true);
  }
  dom.promptInput.value = "";
  dom.systemPromptInput.value = "";
  dom.roundsInput.value = "3";
  dom.warmupInput.value = "1";
  dom.maxTokensInput.value = "256";
  dom.temperatureInput.value = "0";
  dom.targetsContainer.innerHTML = "";
  addTargetCard({ kind: "openai" });
  latestExportPayload = null;
  clearResults();
  syncExportButton();
  log("页面已重置。");
}

async function runBenchmark() {
  clearResults();
  hideStatus();
  latestExportPayload = null;
  syncExportButton();

  let config;
  try {
    config = readConfigFromPage();
  } catch (error) {
    showStatus(error.message, "error");
    log(error.message, "error");
    return;
  }

  if (!config.targets.length) {
    showStatus("至少需要启用一个接口。", "error");
    log("至少需要启用一个接口。", "error");
    return;
  }

  currentAbortController = new AbortController();
  setRunning(true);
  showStatus("测速已开始，请查看下方日志和结果。", "info");
  log(
    `开始测速：${config.targets.length} 个接口，正式轮数 ${config.rounds}，预热轮数 ${config.warmupRounds}。`,
  );

  const runResults = [];

  try {
    for (const target of config.targets) {
      log(`准备测试 ${target.name} (${target.kind})。`);

      for (let warmupIndex = 1; warmupIndex <= config.warmupRounds; warmupIndex += 1) {
        log(`[预热 ${warmupIndex}/${config.warmupRounds}] ${target.name}`);
        await executeSingleRun(target, config, {
          signal: currentAbortController.signal,
          round: warmupIndex,
          warmup: true,
        });
      }

      for (let roundIndex = 1; roundIndex <= config.rounds; roundIndex += 1) {
        log(`[正式 ${roundIndex}/${config.rounds}] ${target.name}`);
        const result = await executeSingleRun(target, config, {
          signal: currentAbortController.signal,
          round: roundIndex,
          warmup: false,
        });
        runResults.push(result);
        renderDetails(runResults);
        renderSummary(runResults);
        latestExportPayload = {
          generatedAt: new Date().toISOString(),
          config: redactSecrets(config),
          runs: runResults,
          summary: buildSummary(runResults),
        };
        syncExportButton();
      }
    }

    const failedCount = runResults.filter((item) => item.status === "error").length;
    if (failedCount) {
      showStatus(`测速结束，${failedCount} 轮失败，详情见逐轮结果和日志。`, "error");
    } else {
      showStatus("测速完成。", "success");
    }
    log("测速完成。");
  } catch (error) {
    if (error.name === "AbortError") {
      showStatus("测速已手动停止。", "error");
      log("测速已手动停止。", "error");
    } else {
      showStatus(error.message || String(error), "error");
      log(error.message || String(error), "error");
    }
  } finally {
    currentAbortController = null;
    setRunning(false);
  }
}

function stopBenchmark() {
  if (currentAbortController) {
    currentAbortController.abort();
  }
}

function showStatus(message, level = "info") {
  dom.statusMessage.textContent = message;
  dom.statusMessage.className = `status-message status-${level}`;
}

function hideStatus() {
  dom.statusMessage.textContent = "";
  dom.statusMessage.className = "status-message hidden";
}

async function executeSingleRun(target, config, context) {
  const requestStartedAt = performance.now();

  try {
    const providerResult = await runProviderBenchmark(target, config, context.signal);

    const totalLatencyMs = performance.now() - requestStartedAt;
    const completionTokens =
      providerResult.completionTokens ??
      roughTokenEstimate(providerResult.outputText || "");
    const promptTokens =
      providerResult.promptTokens ??
      roughTokenEstimate([config.systemPrompt, config.prompt].filter(Boolean).join("\n"));
    const outputDurationMs =
      providerResult.ttftMs === null ? null : Math.max(totalLatencyMs - providerResult.ttftMs, 0);
    const tokensPerSecond =
      completionTokens > 0 && outputDurationMs && outputDurationMs > 0
        ? completionTokens / (outputDurationMs / 1000)
        : null;

    const result = {
      targetName: target.name,
      kind: target.kind,
      round: context.round,
      warmup: context.warmup,
      status: "ok",
      ttftMs: providerResult.ttftMs,
      totalLatencyMs,
      outputDurationMs,
      promptTokens,
      completionTokens,
      tokensPerSecond,
      providerTokensPerSecond: providerResult.providerTokensPerSecond ?? null,
      tokenSource: providerResult.tokenSource,
      note: providerResult.note || "",
    };

    if (!context.warmup) {
      log(
        `${target.name} 第 ${context.round} 轮完成：TTFT ${formatMs(result.ttftMs)}，总耗时 ${formatMs(result.totalLatencyMs)}，tokens/s ${formatNumber(result.tokensPerSecond)}。`,
      );
    }

    return result;
  } catch (error) {
    const result = {
      targetName: target.name,
      kind: target.kind,
      round: context.round,
      warmup: context.warmup,
      status: "error",
      ttftMs: null,
      totalLatencyMs: performance.now() - requestStartedAt,
      outputDurationMs: null,
      promptTokens: null,
      completionTokens: null,
      tokensPerSecond: null,
      providerTokensPerSecond: null,
      tokenSource: null,
      note: normalizeErrorMessage(error),
    };

    if (!context.warmup) {
      log(`${target.name} 第 ${context.round} 轮失败：${result.note}`, "error");
    } else {
      log(`${target.name} 预热失败：${result.note}`, "error");
    }

    return result;
  }
}

async function runProviderBenchmark(target, config, signal) {
  if (target.kind === "anthropic") {
    return runAnthropicBenchmark(target, config, signal);
  }
  if (target.kind === "ollama") {
    return runOllamaBenchmark(target, config, signal);
  }
  return runOpenAiBenchmark(target, config, signal);
}

async function runOpenAiBenchmark(target, config, signal) {
  const apiUrl = joinUrl(target.baseUrl, target.endpointPath || "/chat/completions");
  const url = shouldUseProxy() ? `/proxy/${apiUrl}` : apiUrl;
  const headers = {
    "Content-Type": "application/json",
    ...target.extraHeaders,
  };

  if (target.apiKey) {
    headers.Authorization = `Bearer ${target.apiKey}`;
  }

  const payload = {
    model: target.model,
    messages: buildMessages(config),
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
    stream_options: {
      include_usage: true,
    },
    ...target.extraBody,
  };

  const requestStartedAt = performance.now();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${await safeReadText(response)}`);
  }

  if (!response.body) {
    throw new Error("目标接口没有返回可读流。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let outputText = "";
  let usage = null;
  let ttftMs = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || !line.startsWith("data:")) {
        continue;
      }

      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") {
        continue;
      }

      const chunk = JSON.parse(data);
      if (chunk.usage) {
        usage = chunk.usage;
      }

      const piece = extractOpenAiText(chunk);
      if (piece) {
        if (ttftMs === null) {
          ttftMs = performance.now() - requestStartedAt;
        }
        outputText += piece;
      }
    }
  }

  if (buffer.trim().startsWith("data:")) {
    const maybeJson = buffer.trim().slice(5).trim();
    if (maybeJson && maybeJson !== "[DONE]") {
      const chunk = JSON.parse(maybeJson);
      if (chunk.usage) {
        usage = chunk.usage;
      }
      const piece = extractOpenAiText(chunk);
      if (piece) {
        if (ttftMs === null) {
          ttftMs = performance.now() - requestStartedAt;
        }
        outputText += piece;
      }
    }
  }

  return {
    outputText,
    ttftMs,
    promptTokens: usage?.prompt_tokens ?? null,
    completionTokens: usage?.completion_tokens ?? null,
    providerTokensPerSecond: null,
    tokenSource: usage?.completion_tokens ? "api" : "estimated",
    note: usage?.completion_tokens ? "" : "接口未返回 usage，tokens 使用估算值",
  };
}

async function runAnthropicBenchmark(target, config, signal) {
  const apiUrl = joinUrl(target.baseUrl, target.endpointPath || "/messages");
  const url = shouldUseProxy() ? `/proxy/${apiUrl}` : apiUrl;
  const headers = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    ...target.extraHeaders,
  };

  if (target.apiKey) {
    headers["x-api-key"] = target.apiKey;
  }

  const payload = {
    model: target.model,
    messages: [{ role: "user", content: config.prompt }],
    system: config.systemPrompt || undefined,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
    ...target.extraBody,
  };

  const requestStartedAt = performance.now();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${await safeReadText(response)}`);
  }

  if (!response.body) {
    throw new Error("Anthropic 接口没有返回可读流。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let outputText = "";
  let usage = null;
  let ttftMs = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || !line.startsWith("data:")) {
        continue;
      }

      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") {
        continue;
      }

      const chunk = JSON.parse(data);
      if (chunk.type === "error") {
        throw new Error(chunk.error?.message || "Anthropic 流式响应返回错误");
      }
      if (chunk.usage) {
        usage = { ...usage, ...chunk.usage };
      }

      const piece = extractAnthropicText(chunk);
      if (piece) {
        if (ttftMs === null) {
          ttftMs = performance.now() - requestStartedAt;
        }
        outputText += piece;
      }
    }
  }

  return {
    outputText,
    ttftMs,
    promptTokens: usage?.input_tokens ?? null,
    completionTokens: usage?.output_tokens ?? null,
    providerTokensPerSecond: null,
    tokenSource: usage?.output_tokens ? "api" : "estimated",
    note: usage?.output_tokens ? "" : "接口未返回 usage，tokens 使用估算值",
  };
}

async function runOllamaBenchmark(target, config, signal) {
  const apiUrl = joinUrl(target.baseUrl, target.endpointPath || "/api/generate");
  const url = shouldUseProxy() ? `/proxy/${apiUrl}` : apiUrl;
  const payload = deepMerge(
    {
      model: target.model,
      prompt: config.prompt,
      system: config.systemPrompt || undefined,
      stream: true,
      options: {
        num_predict: config.maxTokens,
        temperature: config.temperature,
      },
    },
    target.extraBody,
  );

  const requestStartedAt = performance.now();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...target.extraHeaders,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${await safeReadText(response)}`);
  }

  if (!response.body) {
    throw new Error("Ollama 没有返回可读流。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let outputText = "";
  let finalChunk = null;
  let ttftMs = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }

      const chunk = JSON.parse(line);
      if (chunk.error) {
        throw new Error(chunk.error);
      }
      if (chunk.response) {
        if (ttftMs === null) {
          ttftMs = performance.now() - requestStartedAt;
        }
        outputText += chunk.response;
      }
      if (chunk.done) {
        finalChunk = chunk;
      }
    }
  }

  if (buffer.trim()) {
    const chunk = JSON.parse(buffer.trim());
    if (chunk.error) {
      throw new Error(chunk.error);
    }
    if (chunk.response) {
      if (ttftMs === null) {
        ttftMs = performance.now() - requestStartedAt;
      }
      outputText += chunk.response;
    }
    if (chunk.done) {
      finalChunk = chunk;
    }
  }

  const providerTokensPerSecond =
    finalChunk?.eval_count && finalChunk?.eval_duration
      ? finalChunk.eval_count / (finalChunk.eval_duration / 1_000_000_000)
      : null;

  return {
    outputText,
    ttftMs,
    promptTokens: finalChunk?.prompt_eval_count ?? null,
    completionTokens: finalChunk?.eval_count ?? null,
    providerTokensPerSecond,
    tokenSource: finalChunk?.eval_count ? "api" : "estimated",
    note: finalChunk?.eval_count ? "" : "未拿到 eval_count，tokens 使用估算值",
  };
}

function renderSummary(results) {
  const summary = buildSummary(results);
  const successful = results.filter((item) => item.status === "ok");

  if (!summary.length) {
    dom.summaryEmpty.classList.remove("hidden");
    dom.summaryBoard.classList.add("hidden");
    dom.summaryTableWrap.classList.add("hidden");
    return;
  }

  dom.summaryEmpty.classList.add("hidden");
  dom.summaryBoard.classList.remove("hidden");
  dom.summaryTableWrap.classList.remove("hidden");

  const fastest = summary[0];
  const ttftCandidates = summary.filter((item) => Number.isFinite(item.avgTtftMs));
  const bestTtft =
    ttftCandidates.length > 0
      ? [...ttftCandidates].sort((a, b) => numericSort(a.avgTtftMs, b.avgTtftMs))[0]
      : fastest;
  const successRate = `${successful.length}/${results.length}`;

  dom.summaryBoard.innerHTML = `
    <article class="metric-card">
      <strong>最快输出</strong>
      <span>${escapeHtml(fastest.targetName)}</span>
      <small>${formatNumber(fastest.avgTokensPerSecond)} tokens/s</small>
    </article>
    <article class="metric-card">
      <strong>最低 TTFT</strong>
      <span>${escapeHtml(bestTtft.targetName)}</span>
      <small>${formatMs(bestTtft.avgTtftMs)}</small>
    </article>
    <article class="metric-card">
      <strong>成功率</strong>
      <span>${successRate}</span>
      <small>仅统计正式轮</small>
    </article>
  `;

  dom.summaryTableBody.innerHTML = summary
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.targetName)}</td>
          <td>${item.okCount}/${item.totalCount}</td>
          <td>${formatMs(item.avgTtftMs)}</td>
          <td>${formatMs(item.p95TotalLatencyMs)}</td>
          <td>${formatNumber(item.avgTokensPerSecond)}</td>
          <td>${formatNumber(item.avgProviderTokensPerSecond)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderDetails(results) {
  if (!results.length) {
    dom.detailsEmpty.classList.remove("hidden");
    dom.detailsTableWrap.classList.add("hidden");
    return;
  }

  dom.detailsEmpty.classList.add("hidden");
  dom.detailsTableWrap.classList.remove("hidden");

  dom.detailsTableBody.innerHTML = results
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.targetName)}</td>
          <td>${item.round}</td>
          <td class="${item.status === "ok" ? "status-ok" : "status-error"}">${item.status}</td>
          <td>${formatMs(item.ttftMs)}</td>
          <td>${formatMs(item.totalLatencyMs)}</td>
          <td>${formatNumber(item.completionTokens)}</td>
          <td>${formatNumber(item.tokensPerSecond)}</td>
          <td title="${escapeHtml(item.note || "")}">${escapeHtml(shorten(item.note || "-", 72))}</td>
        </tr>
      `,
    )
    .join("");
}

function buildSummary(results) {
  const groups = new Map();

  for (const item of results) {
    if (item.warmup) {
      continue;
    }
    if (!groups.has(item.targetName)) {
      groups.set(item.targetName, []);
    }
    groups.get(item.targetName).push(item);
  }

  return [...groups.entries()]
    .map(([targetName, items]) => {
      const okItems = items.filter((item) => item.status === "ok");
      return {
        targetName,
        totalCount: items.length,
        okCount: okItems.length,
        avgTtftMs: average(okItems.map((item) => item.ttftMs)),
        p95TotalLatencyMs: percentile(okItems.map((item) => item.totalLatencyMs), 95),
        avgTokensPerSecond: average(okItems.map((item) => item.tokensPerSecond)),
        avgProviderTokensPerSecond: average(okItems.map((item) => item.providerTokensPerSecond)),
      };
    })
    .sort((a, b) => {
      if (a.okCount !== b.okCount) {
        return b.okCount - a.okCount;
      }
      return numericSort(b.avgTokensPerSecond, a.avgTokensPerSecond);
    });
}

function readConfigFromPage() {
  const prompt = dom.promptInput.value.trim();
  if (!prompt) {
    throw new Error("请先填写测试提示词。");
  }

  const targets = [...dom.targetsContainer.querySelectorAll(".target-card")]
    .map(readTargetCard)
    .filter((target) => target.enabled);

  return {
    prompt,
    systemPrompt: dom.systemPromptInput.value.trim(),
    rounds: parsePositiveInt(dom.roundsInput.value, "正式轮数"),
    warmupRounds: parseNonNegativeInt(dom.warmupInput.value, "预热轮数"),
    maxTokens: parsePositiveInt(dom.maxTokensInput.value, "最大输出 Token"),
    temperature: parseFloatOrThrow(dom.temperatureInput.value, "Temperature"),
    targets,
  };
}

function readTargetCard(card) {
  const kind = card.querySelector(".target-kind").value;
  const baseUrl = card.querySelector(".target-base-url").value.trim();
  const model = card.querySelector(".target-model").value.trim();
  const endpointPath = card.querySelector(".target-endpoint-path").value.trim();
  const name =
    card.querySelector(".target-name").value.trim() || `${kind}-${model || "unnamed"}`;
  const apiKey = card.querySelector(".target-api-key").value.trim();
  const extraHeadersText = card.querySelector(".target-extra-headers").value.trim();
  const extraBodyText = card.querySelector(".target-extra-body").value.trim();

  if (!baseUrl) {
    throw new Error(`接口 ${name} 缺少 Base URL。`);
  }

  if (!model) {
    throw new Error(`接口 ${name} 缺少模型名。`);
  }

  return {
    enabled: card.querySelector(".target-enabled").checked,
    kind,
    name,
    baseUrl,
    model,
    endpointPath: endpointPath || defaultEndpointFor(kind),
    apiKey,
    extraHeaders: parseJsonObject(extraHeadersText, `${name} 的额外 Headers`),
    extraBody: parseJsonObject(extraBodyText, `${name} 的额外 Body`),
  };
}

function restoreFromStorage() {
  const raw = getStorageItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const data = JSON.parse(raw);
    dom.promptInput.value = data.prompt ?? "";
    dom.systemPromptInput.value = data.systemPrompt ?? "";
    dom.roundsInput.value = String(data.rounds ?? 3);
    dom.warmupInput.value = String(data.warmupRounds ?? 1);
    dom.maxTokensInput.value = String(data.maxTokens ?? 256);
    dom.temperatureInput.value = String(data.temperature ?? 0);
    dom.targetsContainer.innerHTML = "";
    (data.targets ?? []).forEach((target) => addTargetCard(target));
  } catch {
    log("本地缓存读取失败，已忽略。", "error");
  }
}

function saveToStorage() {
  const payload = {
    prompt: dom.promptInput.value,
    systemPrompt: dom.systemPromptInput.value,
    rounds: dom.roundsInput.value,
    warmupRounds: dom.warmupInput.value,
    maxTokens: dom.maxTokensInput.value,
    temperature: dom.temperatureInput.value,
    targets: [...dom.targetsContainer.querySelectorAll(".target-card")].map((card) => ({
      enabled: card.querySelector(".target-enabled").checked,
      kind: card.querySelector(".target-kind").value,
      name: card.querySelector(".target-name").value,
      baseUrl: card.querySelector(".target-base-url").value,
      model: card.querySelector(".target-model").value,
      endpointPath: card.querySelector(".target-endpoint-path").value,
      extraHeadersText: card.querySelector(".target-extra-headers").value,
      extraBodyText: card.querySelector(".target-extra-body").value,
    })),
  };

  if (!setStorageItem(STORAGE_KEY, JSON.stringify(payload))) {
    log("当前浏览器不允许写入本地缓存，页面仍可继续使用。", "error", true);
  }
}

function clearResults() {
  dom.summaryTableBody.innerHTML = "";
  dom.detailsTableBody.innerHTML = "";
  dom.summaryEmpty.classList.remove("hidden");
  dom.summaryBoard.classList.add("hidden");
  dom.summaryTableWrap.classList.add("hidden");
  dom.detailsEmpty.classList.remove("hidden");
  dom.detailsTableWrap.classList.add("hidden");
}

function exportResults() {
  if (!latestExportPayload) {
    return;
  }

  const blob = new Blob([JSON.stringify(latestExportPayload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `llm-speed-bench-${timestampString()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function setRunning(isRunning) {
  dom.runBtn.disabled = isRunning;
  dom.stopBtn.disabled = !isRunning;
}

function syncExportButton() {
  dom.exportBtn.disabled = !latestExportPayload;
}

function log(message, level = "info", dedupe = false) {
  const prefix = level === "error" ? "[ERROR]" : "[INFO]";
  const line = `${new Date().toLocaleTimeString()} ${prefix} ${message}`;
  if (dedupe && dom.logOutput.textContent.includes(line)) {
    return;
  }
  if (dom.logOutput.textContent === "等待开始…") {
    dom.logOutput.textContent = line;
  } else {
    dom.logOutput.textContent += `\n${line}`;
  }
  dom.logOutput.scrollTop = dom.logOutput.scrollHeight;
}

function buildMessages(config) {
  const messages = [];
  if (config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }
  messages.push({ role: "user", content: config.prompt });
  return messages;
}

function extractOpenAiText(chunk) {
  if (!Array.isArray(chunk.choices)) {
    return "";
  }

  let text = "";
  for (const choice of chunk.choices) {
    const delta = choice.delta ?? {};
    text += normalizeChunkText(delta.content);
    text += normalizeChunkText(delta.reasoning_content);
  }
  return text;
}

function extractAnthropicText(chunk) {
  if (chunk.type === "content_block_delta") {
    return normalizeChunkText(chunk.delta?.text);
  }
  if (chunk.type === "content_block_start") {
    return normalizeChunkText(chunk.content_block?.text);
  }
  return "";
}

function normalizeChunkText(value) {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (typeof item?.text === "string") {
          return item.text;
        }
        if (typeof item?.content === "string") {
          return item.content;
        }
        return "";
      })
      .join("");
  }
  return "";
}

function defaultEndpointFor(kind) {
  if (kind === "anthropic") {
    return "/messages";
  }
  if (kind === "ollama") {
    return "/api/generate";
  }
  return "/chat/completions";
}

function typeLabel(kind) {
  if (kind === "anthropic") {
    return "Anthropic";
  }
  if (kind === "ollama") {
    return "Ollama";
  }
  return "OpenAI 兼容";
}

function redactSecrets(config) {
  return {
    ...config,
    targets: config.targets.map((target) => ({
      ...target,
      apiKey: target.apiKey ? "***" : "",
    })),
  };
}

async function fetchModelList({ kind, baseUrl, apiKey, extraHeaders, modelInput, modelSelect, fetchBtn }) {
  if (!baseUrl.trim()) {
    log("请先填写 Base URL", "error");
    return;
  }

  const originalText = fetchBtn.textContent;
  fetchBtn.disabled = true;
  fetchBtn.textContent = "获取中...";
  modelSelect.classList.add("hidden");

  try {
    let models = [];
    if (kind === "anthropic") {
      models = await fetchAnthropicModels(baseUrl, apiKey, extraHeaders);
    } else if (kind === "ollama") {
      models = await fetchOllamaModels(baseUrl);
    } else {
      models = await fetchOpenAiModels(baseUrl, apiKey, extraHeaders);
    }

    if (models.length === 0) {
      log("未获取到模型列表", "error");
      return;
    }

    modelSelect.innerHTML = '<option value="">-- 选择模型 --</option>';
    models.forEach((modelName) => {
      const option = document.createElement("option");
      option.value = modelName;
      option.textContent = modelName;
      modelSelect.appendChild(option);
    });

    if (!modelInput.value.trim()) {
      modelInput.value = models[0];
      saveToStorage();
    }
    modelSelect.value = modelInput.value.trim();
    modelSelect.classList.remove("hidden");
    log(`成功获取 ${models.length} 个模型`);
  } catch (error) {
    log(`获取模型列表失败: ${error.message}`, "error");
    showStatus(`获取模型列表失败：${error.message}`, "error");
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = originalText;
  }
}

async function fetchAnthropicModels(baseUrl, apiKey, extraHeadersText) {
  const modelUrl = joinUrl(baseUrl, "/models");
  const url = shouldUseProxy() ? `/proxy/${modelUrl}` : modelUrl;
  const headers = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    ...parseJsonObject(extraHeadersText, "额外 Headers"),
  };

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.data || !Array.isArray(data.data)) {
    throw new Error("接口返回格式不正确");
  }

  return data.data
    .map((item) => item.id || item.model)
    .filter(Boolean)
    .sort();
}

async function fetchOpenAiModels(baseUrl, apiKey, extraHeadersText) {
  const modelUrl = joinUrl(baseUrl, "/models");
  const url = shouldUseProxy() ? `/proxy/${modelUrl}` : modelUrl;
  
  const headers = {
    "Content-Type": "application/json",
    ...parseJsonObject(extraHeadersText, "额外 Headers"),
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.data || !Array.isArray(data.data)) {
    throw new Error("接口返回格式不正确");
  }

  return data.data
    .map((item) => item.id || item.model)
    .filter(Boolean)
    .sort();
}

async function fetchOllamaModels(baseUrl) {
  const modelUrl = joinUrl(baseUrl, "/api/tags");
  const url = shouldUseProxy() ? `/proxy/${modelUrl}` : modelUrl;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.models || !Array.isArray(data.models)) {
    throw new Error("接口返回格式不正确");
  }

  return data.models
    .map((item) => item.name || item.model)
    .filter(Boolean)
    .sort();
}
