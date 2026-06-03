# AI 工具箱渐进式重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `app.js`（1689 行）拆分为职责清晰的模块，保持纯静态、零依赖

**Architecture:** 按工具拆分，每个工具独立管理状态/渲染/事件；`app.js` 精简为入口；提取 `core/router.js` 管理 Hash 路由和工具生命周期

**Tech Stack:** 纯原生 ES Modules，零 npm 依赖，GitHub Pages 直接可用

---

## 文件结构

### 新建文件
- `src/core/router.js` — Hash 路由 + 视图切换 + 工具生命周期
- `src/core/app-state.js` — 极简全局状态
- `src/shared/dom-cache.js` — DOM 元素缓存（按视图分组）
- `src/tools/color-palette/palette-data.js` — 预设配色 + 生成逻辑
- `src/tools/color-palette/render.js` — 配色 DOM 渲染
- `src/tools/speed-test/benchmark.js` — 测速核心逻辑 + 结果渲染
- `src/tools/speed-test/providers.js` — OpenAI/Anthropic/Ollama provider
- `src/tools/speed-test/model-fetcher.js` — 获取模型列表

### 修改文件
- `src/tools/color-palette/index.js` — 添加 `init()`/`destroy()` 生命周期
- `src/tools/speed-test/index.js` — 添加 `init()`/`destroy()` 生命周期
- `app.js` — 精简为入口文件

---

## Task 1: 创建 core/router.js + app-state.js

**Files:**
- Create: `src/core/app-state.js`
- Create: `src/core/router.js`

- [ ] **Step 1: 创建 app-state.js**

```javascript
let currentView = "home";

export function getCurrentView() {
  return currentView;
}

export function setCurrentView(view) {
  currentView = view;
}
```

- [ ] **Step 2: 创建 router.js**

```javascript
import { getToolIds } from "./registry.js";
import { setCurrentView, getCurrentView } from "./app-state.js";

const DEFAULT_VIEW = "home";
let currentTool = null;

export function initRouter(toolsMap) {
  window.addEventListener("hashchange", () => syncView(toolsMap));
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.addEventListener("click", () => showView(link.dataset.viewLink, toolsMap));
  });
  syncView(toolsMap);
}

function syncView(toolsMap) {
  const view = window.location.hash.replace("#", "") || DEFAULT_VIEW;
  showView(view, toolsMap);
}

function showView(view, toolsMap) {
  const normalizedView = getToolIds().includes(view) ? view : DEFAULT_VIEW;
  
  // 隐藏所有视图
  document.querySelectorAll(".tool-view").forEach((el) => el.classList.add("hidden"));
  document.querySelector("#homeView")?.classList.add("hidden");
  
  // 显示目标视图
  const viewMap = {
    home: "homeView",
    "speed-test": "speedTestView",
    "color-palette": "colorPaletteView",
  };
  const targetEl = document.getElementById(viewMap[normalizedView]);
  if (targetEl) targetEl.classList.remove("hidden");
  
  // 更新导航激活状态
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === normalizedView);
  });
  
  // 工具生命周期
  if (currentTool && currentTool !== normalizedView && toolsMap[currentTool]?.destroy) {
    toolsMap[currentTool].destroy();
  }
  if (toolsMap[normalizedView]?.init && currentTool !== normalizedView) {
    toolsMap[normalizedView].init();
  }
  
  currentTool = normalizedView;
  setCurrentView(normalizedView);
}
```

- [ ] **Step 3: 验证语法**

在浏览器控制台或 Node 中检查语法正确性。

---

## Task 2: 创建 shared/dom-cache.js

**Files:**
- Create: `src/shared/dom-cache.js`

- [ ] **Step 1: 创建 dom-cache.js**

按视图分组缓存所有 DOM 查询：

```javascript
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
```

---

## Task 3: 提取 palette-data.js + 拆分配色工具

**Files:**
- Create: `src/tools/color-palette/palette-data.js`
- Create: `src/tools/color-palette/render.js`
- Modify: `src/tools/color-palette/index.js`

- [ ] **Step 1: 从 app.js 提取配色数据到 palette-data.js**

包含：
- `paletteStyleConfig(style)` — 风格配置
- `palettePresetConfig(preset)` — 预设配置（全部 16 个预设）
- `buildGeneratedPalette(baseHsl, styleConfig)` — 生成配色
- `buildPresetPalette(preset)` — 预设配色
- `paletteColor(role, label, hex, usage)` — 颜色对象构造

- [ ] **Step 2: 从 app.js 提取配色渲染到 render.js**

包含：
- `renderPaletteSwatches(colors)` — 渲染色板（使用 DocumentFragment 优化）
- `buildPaletteCss(colors)` — 生成 CSS
- `buildPaletteGuide(styleName, colors, isPreset)` — 生成设计建议
- `applyPalettePreview(colors, dom)` — 应用预览

- [ ] **Step 3: 重写 color-palette/index.js**

导出 `meta` + `init()` + `destroy()`：

```javascript
import { meta } from "./meta.js"; // 或保留在当前文件
import * as data from "./palette-data.js";
import * as render from "./render.js";
import * as dom from "../../shared/dom-cache.js";

let latestPalettePayload = null;
let currentMode = "auto";

export { meta };

export function init() {
  bindEvents();
  renderPalettePresetTabs();
  setMode("auto", false);
  generatePalette();
}

export function destroy() {
  // 配色工具无特殊清理需求
}

// ... 内部函数：bindEvents, setMode, generatePalette, syncBaseColor, etc.
```

---

## Task 4: 拆分测速工具

**Files:**
- Create: `src/tools/speed-test/providers.js`
- Create: `src/tools/speed-test/model-fetcher.js`
- Create: `src/tools/speed-test/benchmark.js`
- Modify: `src/tools/speed-test/index.js`

- [ ] **Step 1: 提取 providers.js**

包含三个 provider 函数：
- `runOpenAiBenchmark(target, config, signal)`
- `runAnthropicBenchmark(target, config, signal)`
- `runOllamaBenchmark(target, config, signal)`

提取公共 SSE 流读取逻辑为 `readSseStream(response, parser)` 辅助函数。

- [ ] **Step 2: 提取 model-fetcher.js**

包含：
- `fetchModelList(params)` — 主入口
- `fetchOpenAiModels(baseUrl, apiKey, extraHeaders)`
- `fetchAnthropicModels(baseUrl, apiKey, extraHeaders)`
- `fetchOllamaModels(baseUrl)`

- [ ] **Step 3: 提取 benchmark.js**

包含：
- `runBenchmark(config, onProgress)` — 主测速逻辑
- `executeSingleRun(target, config, signal)` — 单轮执行
- `renderSummary(results)` — 渲染汇总
- `renderDetails(results)` — 渲染明细
- `buildSummary(results)` — 构建汇总数据
- `readConfigFromPage()` — 读取页面配置
- `readTargetCard(card)` — 读取单个目标卡片

- [ ] **Step 4: 重写 speed-test/index.js**

导出 `meta` + `init()` + `destroy()`：

```javascript
import { meta } from "./meta.js";
import * as benchmark from "./benchmark.js";
import * as modelFetcher from "./model-fetcher.js";
import * as dom from "../../shared/dom-cache.js";

let currentAbortController = null;

export { meta };

export function init() {
  bindEvents();
  restoreFromStorage();
  if (!dom.speedTest.targetsContainer.children.length) {
    addTargetCard({ kind: "openai" });
  }
}

export function destroy() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

// ... 内部函数
```

---

## Task 5: 精简 app.js

**Files:**
- Modify: `app.js`

- [ ] **Step 1: 重写 app.js 为入口文件**

```javascript
import { initRouter } from "./src/core/router.js";
import * as colorPalette from "./src/tools/color-palette/index.js";
import * as speedTest from "./src/tools/speed-test/index.js";

const toolsMap = {
  home: { init: () => {}, destroy: () => {} },
  "speed-test": speedTest,
  "color-palette": colorPalette,
};

initRouter(toolsMap);
```

---

## Task 6: 本地验证测试

**Files:**
- 所有修改的文件

- [ ] **Step 1: 启动本地服务器**

Run: `node server.js`

- [ ] **Step 2: 验证首页加载**

访问 http://localhost:8080
Expected: 首页正常显示，工具导航可用

- [ ] **Step 3: 验证配色工具**

点击"AI 配色推荐"
Expected: 
- 配色页面正常显示
- 自动生成模式可用
- 预设模式可用
- 生成/重置/复制按钮工作正常
- 预览区域更新正确

- [ ] **Step 4: 验证测速工具**

点击"大模型测速"
Expected:
- 测速页面正常显示
- 添加/删除接口卡片正常
- 获取模型列表正常
- 填充示例正常
- 开始测速流程正常（可用 mock 接口测试）

- [ ] **Step 5: 验证路由切换**

在配色和测速之间多次切换
Expected:
- 视图切换正常
- 无内存泄漏
- 状态保持正确

- [ ] **Step 6: 验证 GitHub Pages 兼容性**

确认 `index.html` 中 `<script type="module" src="./app.js">` 路径正确
Expected: 无需构建步骤，直接打开 `index.html` 也能工作（除跨域外）

---

## Spec 覆盖检查

| 需求 | 对应 Task |
|------|-----------|
| 架构解耦 | Task 3, 4, 5 |
| 性能优化（DOM 批量操作） | Task 3 (render.js) |
| 性能优化（事件委托） | Task 3, 4 (index.js) |
| 性能优化（DOM 缓存） | Task 2 |
| 代码质量（消除重复） | Task 4 (providers.js) |
| 零依赖保持 | 全部（无 npm 包） |
| GitHub Pages 兼容 | Task 6 |

---

## Placeholder 扫描

- [x] 无 "TBD" / "TODO"
- [x] 无 "implement later"
- [x] 所有函数签名一致
- [x] 文件路径准确
