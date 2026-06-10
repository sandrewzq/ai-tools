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

// 提示词模板工具
export const promptTemplates = {
  view: document.querySelector("#promptTemplatesView"),
  searchInput: document.querySelector("#promptSearchInput"),
  categoryTabs: document.querySelector("#promptCategoryTabs"),
  cardsContainer: document.querySelector("#promptCardsContainer"),
  emptyState: document.querySelector("#promptEmptyState"),
  toast: document.querySelector("#promptToast"),
};

// 文本分块器
export const textChunker = {
  view: document.querySelector("#textChunkerView"),
  textInput: document.querySelector("#chunkerTextInput"),
  chunkSize: document.querySelector("#chunkerChunkSize"),
  overlap: document.querySelector("#chunkerOverlap"),
  splitMode: document.querySelector("#chunkerSplitMode"),
  chunkBtn: document.querySelector("#chunkerChunkBtn"),
  resetBtn: document.querySelector("#chunkerResetBtn"),
  copyAllBtn: document.querySelector("#chunkerCopyAllBtn"),
  statsContainer: document.querySelector("#chunkerStatsContainer"),
  chunksContainer: document.querySelector("#chunkerChunksContainer"),
  toast: document.querySelector("#chunkerToast"),
};

// 文本比对器
export const textDiffer = {
  view: document.querySelector("#textDifferView"),
  textA: document.querySelector("#differTextA"),
  textB: document.querySelector("#differTextB"),
  compareBtn: document.querySelector("#differCompareBtn"),
  swapBtn: document.querySelector("#differSwapBtn"),
  resetBtn: document.querySelector("#differResetBtn"),
  statsContainer: document.querySelector("#differStatsContainer"),
  diffOutput: document.querySelector("#differDiffOutput"),
};

// Token 计算器
export const tokenCalc = {
  view: document.querySelector("#tokenCalculatorView"),
  textInput: document.querySelector("#tokenCalcTextInput"),
  modelSelect: document.querySelector("#tokenCalcModelSelect"),
  clearBtn: document.querySelector("#tokenCalcClearBtn"),
  statsContainer: document.querySelector("#tokenCalcStatsContainer"),
  detailsContainer: document.querySelector("#tokenCalcDetailsContainer"),
};

// JSON 格式化器
export const jsonFormatter = {
  view: document.querySelector("#jsonFormatterView"),
  textInput: document.querySelector("#jsonFormatterInput"),
  formatBtn: document.querySelector("#jsonFormatBtn"),
  compressBtn: document.querySelector("#jsonCompressBtn"),
  validateBtn: document.querySelector("#jsonValidateBtn"),
  copyBtn: document.querySelector("#jsonCopyBtn"),
  copyIndentBtn: document.querySelector("#jsonCopyIndentBtn"),
  clearBtn: document.querySelector("#jsonClearBtn"),
  statsContainer: document.querySelector("#jsonFormatterStats"),
  outputContainer: document.querySelector("#jsonFormatterOutput"),
  toast: document.querySelector("#jsonFormatterToast"),
};
