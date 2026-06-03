// 首页
export const home = {
  view: document.querySelector("#homeView"),
};

// 配色工具
export const colorPalette = {
  view: document.querySelector("#colorPaletteView"),
  styleInput: document.querySelector("#paletteStyleInput"),
  presetInput: document.querySelector("#palettePresetInput"),
  baseColorInput: document.querySelector("#paletteBaseColorInput"),
  baseColorTextInput: document.querySelector("#paletteBaseColorTextInput"),
  baseColorPreview: document.querySelector("#paletteBaseColorPreview"),
  autoModeBtn: document.querySelector("#paletteAutoModeBtn"),
  presetModeBtn: document.querySelector("#palettePresetModeBtn"),
  presetTabs: document.querySelector("#palettePresetTabs"),
  generateBtn: document.querySelector("#generatePaletteBtn"),
  resetBtn: document.querySelector("#resetPaletteBtn"),
  copyCssBtn: document.querySelector("#copyPaletteCssBtn"),
  copyJsonBtn: document.querySelector("#copyPaletteJsonBtn"),
  status: document.querySelector("#paletteStatus"),
  swatches: document.querySelector("#paletteSwatches"),
  cssOutput: document.querySelector("#paletteCssOutput"),
  guideOutput: document.querySelector("#paletteGuideOutput"),
  preview: document.querySelector("#palettePreview"),
  previewBrand: document.querySelector("#palettePreviewBrand"),
  previewNavPrimary: document.querySelector("#palettePreviewNavPrimary"),
  previewNavSecondary: document.querySelector("#palettePreviewNavSecondary"),
  previewNavTertiary: document.querySelector("#palettePreviewNavTertiary"),
  previewKicker: document.querySelector("#palettePreviewKicker"),
  previewTitle: document.querySelector("#palettePreviewTitle"),
  previewText: document.querySelector("#palettePreviewText"),
  previewAction: document.querySelector("#palettePreviewAction"),
};

// 测速工具
export const speedTest = {
  view: document.querySelector("#speedTestView"),
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

// 导航
export const nav = {
  links: document.querySelectorAll("[data-view-link]"),
};
