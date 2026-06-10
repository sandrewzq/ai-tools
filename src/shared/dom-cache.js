// 懒加载辅助：仅在首次访问时执行 querySelector
function lazyNS(factory) {
  let cache = null;
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (!cache) cache = factory();
        return cache[prop];
      },
      // 支持可选链和 in 操作
      has(_, prop) {
        if (!cache) cache = factory();
        return prop in cache;
      },
    },
  );
}

// 首页
export const home = lazyNS(() => ({
  view: document.querySelector("#homeView"),
}));

// 配色工具
export const colorPalette = lazyNS(() => ({
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
}));

// 测速工具
export const speedTest = lazyNS(() => ({
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
}));

// UUID 生成器
export const uuidGenerator = lazyNS(() => ({
  view: document.querySelector("#uuidGeneratorView"),
  versionSelect: document.querySelector("#uuidVersionSelect"),
  countInput: document.querySelector("#uuidCountInput"),
  noHyphensCheck: document.querySelector("#uuidNoHyphens"),
  uppercaseCheck: document.querySelector("#uuidUppercase"),
  generateBtn: document.querySelector("#uuidGenerateBtn"),
  copyAllBtn: document.querySelector("#uuidCopyAllBtn"),
  uuidList: document.querySelector("#uuidList"),
}));

// 哈希生成器
export const hashGenerator = lazyNS(() => ({
  view: document.querySelector("#hashGeneratorView"),
  input: document.querySelector("#hashInput"),
  algoSelect: document.querySelector("#hashAlgoSelect"),
  result: document.querySelector("#hashResult"),
}));

// JWT 调试器
export const jwtDebugger = lazyNS(() => ({
  view: document.querySelector("#jwtDebuggerView"),
  tokenInput: document.querySelector("#jwtTokenInput"),
  headerOutput: document.querySelector("#jwtHeaderOutput"),
  payloadOutput: document.querySelector("#jwtPayloadOutput"),
  sigOutput: document.querySelector("#jwtSigOutput"),
  verifyOutput: document.querySelector("#jwtVerifyOutput"),
  verifyBtn: document.querySelector("#jwtVerifyBtn"),
  copyHeaderBtn: document.querySelector("#jwtCopyHeaderBtn"),
  copyPayloadBtn: document.querySelector("#jwtCopyPayloadBtn"),
  secretInput: document.querySelector("#jwtSecretInput"),
}));

// 导航
export const nav = lazyNS(() => ({
  links: document.querySelectorAll("[data-view-link]"),
}));

// 提示词模板工具
export const promptTemplates = lazyNS(() => ({
  view: document.querySelector("#promptTemplatesView"),
  searchInput: document.querySelector("#promptSearchInput"),
  categoryTabs: document.querySelector("#promptCategoryTabs"),
  cardsContainer: document.querySelector("#promptCardsContainer"),
  emptyState: document.querySelector("#promptEmptyState"),
  toast: document.querySelector("#promptToast"),
}));

// 文本分块器
export const textChunker = lazyNS(() => ({
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
}));

// 文本比对器
export const textDiffer = lazyNS(() => ({
  view: document.querySelector("#textDifferView"),
  textA: document.querySelector("#differTextA"),
  textB: document.querySelector("#differTextB"),
  compareBtn: document.querySelector("#differCompareBtn"),
  swapBtn: document.querySelector("#differSwapBtn"),
  resetBtn: document.querySelector("#differResetBtn"),
  statsContainer: document.querySelector("#differStatsContainer"),
  diffOutput: document.querySelector("#differDiffOutput"),
}));

// Token 计算器
export const tokenCalc = lazyNS(() => ({
  view: document.querySelector("#tokenCalculatorView"),
  textInput: document.querySelector("#tokenCalcTextInput"),
  modelSelect: document.querySelector("#tokenCalcModelSelect"),
  clearBtn: document.querySelector("#tokenCalcClearBtn"),
  statsContainer: document.querySelector("#tokenCalcStatsContainer"),
  detailsContainer: document.querySelector("#tokenCalcDetailsContainer"),
}));

// JSON 格式化器
export const jsonFormatter = lazyNS(() => ({
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
}));

// 正则测试器
export const regexTester = lazyNS(() => ({
  view: document.querySelector("#regexTesterView"),
  regexInput: document.querySelector("#regexPatternInput"),
  flagsInput: document.querySelector("#regexFlagsInput"),
  testText: document.querySelector("#regexTestTextInput"),
  matchContainer: document.querySelector("#regexMatchesContainer"),
  highlightContainer: document.querySelector("#regexHighlightContainer"),
  statsContainer: document.querySelector("#regexStatsContainer"),
}));

// 编码转换器
export const encodingConverter = lazyNS(() => ({
  view: document.querySelector("#encodingConverterView"),
  input: document.querySelector("#encInputText"),
  output: document.querySelector("#encOutputText"),
  error: document.querySelector("#encErrorContainer"),
  copyBtn: document.querySelector("#encCopyBtn"),
  swapBtn: document.querySelector("#encSwapBtn"),
  clearBtn: document.querySelector("#encClearBtn"),
  toast: document.querySelector("#encToast"),
}));

// 时间戳转换器
export const timestampConverter = lazyNS(() => ({
  view: document.querySelector("#timestampConverterView"),
  currentContainer: document.querySelector("#tsCurrentContainer"),
  tsInput: document.querySelector("#tsInput"),
  convertTsBtn: document.querySelector("#tsConvertBtn"),
  nowSecBtn: document.querySelector("#tsNowSecBtn"),
  nowMsBtn: document.querySelector("#tsNowMsBtn"),
  tzSelectTs: document.querySelector("#tsTzSelect"),
  tsResultContainer: document.querySelector("#tsResultContainer"),
  dateInput: document.querySelector("#tsDateInput"),
  convertDateBtn: document.querySelector("#tsDateConvertBtn"),
  nowDateBtn: document.querySelector("#tsNowDateBtn"),
  tzSelectDate: document.querySelector("#tsTzSelectDate"),
  dateResultContainer: document.querySelector("#tsDateResultContainer"),
  toast: document.querySelector("#tsToast"),
}));

// cURL 转代码
export const curlConverter = lazyNS(() => ({
  view: document.querySelector("#curlConverterView"),
  curlInput: document.querySelector("#curlCommandInput"),
  convertBtn: document.querySelector("#curlConvertBtn"),
  exampleBtn: document.querySelector("#curlExampleBtn"),
  summary: document.querySelector("#curlSummaryContainer"),
  error: document.querySelector("#curlErrorContainer"),
  fetchOutput: document.querySelector("#curlFetchOutput"),
  pythonOutput: document.querySelector("#curlPythonOutput"),
  goOutput: document.querySelector("#curlGoOutput"),
  copyFetchBtn: document.querySelector("#curlCopyFetchBtn"),
  copyPythonBtn: document.querySelector("#curlCopyPythonBtn"),
  copyGoBtn: document.querySelector("#curlCopyGoBtn"),
  toast: document.querySelector("#curlToast"),
}));

// 二维码生成器
export const qrGenerator = lazyNS(() => ({
  view: document.querySelector("#qrGeneratorView"),
  qrInput: document.querySelector("#qrTextInput"),
  canvas: document.querySelector("#qrCanvas"),
  placeholder: document.querySelector("#qrGeneratorView .qr-placeholder"),
  downloadBtn: document.querySelector("#qrDownloadBtn"),
  versionInfo: document.querySelector("#qrVersionInfo"),
  sizeInfo: document.querySelector("#qrSizeInfo"),
  error: document.querySelector("#qrErrorContainer"),
}));
