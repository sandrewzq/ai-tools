import { setCurrentView } from "./app-state.js";

const DEFAULT_VIEW = "home";
let currentTool = null;

// 动态导入路径映射
const toolImporters = {
  "speed-test": () => import("../tools/speed-test/index.js"),
  "color-palette": () => import("../tools/color-palette/index.js"),
  "prompt-templates": () => import("../tools/prompt-templates/index.js"),
  "text-chunker": () => import("../tools/text-chunker/index.js"),
  "text-differ": () => import("../tools/text-differ/index.js"),
  "token-calculator": () => import("../tools/token-calculator/index.js"),
  "json-formatter": () => import("../tools/json-formatter/index.js"),
  "regex-tester": () => import("../tools/regex-tester/index.js"),
  "encoding-converter": () => import("../tools/encoding-converter/index.js"),
  "timestamp-converter": () => import("../tools/timestamp-converter/index.js"),
  "curl-converter": () => import("../tools/curl-converter/index.js"),
  "qr-generator": () => import("../tools/qr-generator/index.js"),
  "uuid-generator": () => import("../tools/uuid-generator/index.js"),
  "hash-generator": () => import("../tools/hash-generator/index.js"),
  "jwt-debugger": () => import("../tools/jwt-debugger/index.js"),
};

// 已加载的工具模块缓存
const loadedTools = new Map();

// 所有工具 ID
const TOOL_IDS = Object.keys(toolImporters);

const viewMap = {
  home: "homeView",
  "speed-test": "speedTestView",
  "color-palette": "colorPaletteView",
  "prompt-templates": "promptTemplatesView",
  "text-chunker": "textChunkerView",
  "text-differ": "textDifferView",
  "token-calculator": "tokenCalculatorView",
  "json-formatter": "jsonFormatterView",
  "regex-tester": "regexTesterView",
  "encoding-converter": "encodingConverterView",
  "timestamp-converter": "timestampConverterView",
  "curl-converter": "curlConverterView",
  "qr-generator": "qrGeneratorView",
  "uuid-generator": "uuidGeneratorView",
  "hash-generator": "hashGeneratorView",
  "jwt-debugger": "jwtDebuggerView",
};

export function initRouter() {
  window.addEventListener("hashchange", () => syncView());
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.addEventListener("click", () => showView(link.dataset.viewLink));
  });
  syncView();
}

async function loadTool(toolId) {
  if (loadedTools.has(toolId)) return loadedTools.get(toolId);
  const importer = toolImporters[toolId];
  if (!importer) return null;
  const mod = await importer();
  loadedTools.set(toolId, mod);
  return mod;
}

function syncView() {
  const view = (window.location.hash || "#").slice(1) || DEFAULT_VIEW;
  showView(view);
}

async function showView(view) {
  const normalizedView = TOOL_IDS.includes(view) ? view : DEFAULT_VIEW;

  // 隐藏所有视图
  document.querySelectorAll(".tool-view").forEach((el) => el.classList.add("hidden"));

  // 显示目标视图
  const targetEl = document.getElementById(viewMap[normalizedView]);
  if (targetEl) targetEl.classList.remove("hidden");

  // 更新导航激活状态
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === normalizedView);
  });

  // 工具生命周期
  if (currentTool && currentTool !== normalizedView && currentTool.destroy) {
    currentTool.destroy();
  }

  if (normalizedView !== "home" && currentTool !== normalizedView) {
    const toolModule = await loadTool(normalizedView);
    if (toolModule?.init) toolModule.init();
  }

  currentTool = normalizedView;
  setCurrentView(normalizedView);
}
