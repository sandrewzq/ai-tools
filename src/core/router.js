import { getToolIds } from "./registry.js";
import { setCurrentView } from "./app-state.js";

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

  // 显示目标视图
  const viewMap = {
    home: "homeView",
    "speed-test": "speedTestView",
    "color-palette": "colorPaletteView",
    "prompt-templates": "promptTemplatesView",
    "text-chunker": "textChunkerView",
    "text-differ": "textDifferView",
    "token-calculator": "tokenCalculatorView",
    "json-formatter": "jsonFormatterView",
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
