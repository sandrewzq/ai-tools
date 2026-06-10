import * as dom from "../../shared/dom-cache.js";
import { formatJson, compressJson, validateJson } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "json-formatter",
  route: "#json-formatter",
  title: "JSON 格式化器",
  kicker: "JSON Formatter",
  description: "格式化、压缩和校验 JSON 数据，支持语法高亮、树形折叠浏览和结构分析。",
};

let lastParsed = null;

export function init() {
  bindEvents();
  render.renderEmpty(dom.jsonFormatter.outputContainer);
  dom.jsonFormatter.statsContainer.innerHTML = "";
}

export function destroy() {}

function bindEvents() {
  dom.jsonFormatter.formatBtn.addEventListener("click", () => doAction("format"));
  dom.jsonFormatter.compressBtn.addEventListener("click", () => doAction("compress"));
  dom.jsonFormatter.validateBtn.addEventListener("click", () => doAction("validate"));
  dom.jsonFormatter.copyBtn.addEventListener("click", copyOutput);
  dom.jsonFormatter.copyIndentBtn.addEventListener("click", copyIndented);
  dom.jsonFormatter.clearBtn.addEventListener("click", clearAll);
}

function doAction(action) {
  const input = dom.jsonFormatter.textInput.value.trim();
  if (!input) {
    render.renderEmpty(dom.jsonFormatter.outputContainer);
    dom.jsonFormatter.statsContainer.innerHTML = "";
    return;
  }

  const result = validateJson(input);
  if (!result.valid) {
    render.renderError(result.error, dom.jsonFormatter.outputContainer);
    dom.jsonFormatter.statsContainer.innerHTML = "";
    dom.jsonFormatter.copyBtn.disabled = true;
    dom.jsonFormatter.copyIndentBtn.disabled = true;
    return;
  }

  lastParsed = result.parsed;

  if (action === "format") {
    dom.jsonFormatter.textInput.value = formatJson(input);
    render.renderOutput(result.parsed, dom.jsonFormatter.outputContainer);
  } else if (action === "compress") {
    dom.jsonFormatter.textInput.value = compressJson(input);
    render.renderOutput(result.parsed, dom.jsonFormatter.outputContainer);
  } else if (action === "validate") {
    render.renderOutput(result.parsed, dom.jsonFormatter.outputContainer);
  }

  render.renderStats(result.parsed, dom.jsonFormatter.statsContainer);
  dom.jsonFormatter.copyBtn.disabled = false;
  dom.jsonFormatter.copyIndentBtn.disabled = false;
}

async function copyOutput() {
  if (!lastParsed) return;
  try {
    await navigator.clipboard.writeText(JSON.stringify(lastParsed, null, 2));
    showToast("已复制格式化后的 JSON");
  } catch {
    showToast("复制失败");
  }
}

async function copyIndented() {
  if (!lastParsed) return;
  try {
    await navigator.clipboard.writeText(JSON.stringify(lastParsed, null, 2));
    showToast("已复制带缩进的 JSON");
  } catch {
    showToast("复制失败");
  }
}

function clearAll() {
  dom.jsonFormatter.textInput.value = "";
  render.renderEmpty(dom.jsonFormatter.outputContainer);
  dom.jsonFormatter.statsContainer.innerHTML = "";
  dom.jsonFormatter.copyBtn.disabled = true;
  dom.jsonFormatter.copyIndentBtn.disabled = true;
  lastParsed = null;
}

function showToast(message) {
  dom.jsonFormatter.toast.textContent = message;
  dom.jsonFormatter.toast.classList.remove("hidden");
  dom.jsonFormatter.toast.classList.add("toast-visible");
  clearTimeout(dom.jsonFormatter.toast._timeout);
  dom.jsonFormatter.toast._timeout = setTimeout(() => {
    dom.jsonFormatter.toast.classList.remove("toast-visible");
    dom.jsonFormatter.toast.classList.add("hidden");
  }, 2000);
}
