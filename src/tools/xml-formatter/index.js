import * as dom from "../../shared/dom-cache.js";
import { debounce } from "../../shared/format.js";
import { compactXml, formatXml, xmlToJson } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "xml-formatter",
  route: "#xml-formatter",
  title: "XML 格式化器",
  kicker: "XML Formatter",
  description: "格式化、压缩和校验 XML，支持 XML 树结构 JSON 预览。",
};

let eventsBound = false;
let debouncedValidate;
let lastOutput = "";

export function init() {
  debouncedValidate = debounce(() => runAction("format", false), 250);
  if (!eventsBound) {
    bindEvents();
    eventsBound = true;
  }
  if (dom.xmlFormatter.input.value.trim()) runAction("format", false);
  else render.renderEmpty(dom.xmlFormatter.output, dom.xmlFormatter.tree, dom.xmlFormatter.stats, dom.xmlFormatter.error);
}

export function destroy() {}

function bindEvents() {
  dom.xmlFormatter.input.addEventListener("input", () => debouncedValidate());
  dom.xmlFormatter.formatBtn.addEventListener("click", () => runAction("format", true));
  dom.xmlFormatter.compactBtn.addEventListener("click", () => runAction("compact", true));
  dom.xmlFormatter.toJsonBtn.addEventListener("click", () => runAction("to-json", false));
  dom.xmlFormatter.copyBtn.addEventListener("click", copyOutput);
  dom.xmlFormatter.clearBtn.addEventListener("click", clearAll);
}

function runAction(action, writeBack) {
  const input = dom.xmlFormatter.input.value.trim();
  if (!input) {
    lastOutput = "";
    render.renderEmpty(dom.xmlFormatter.output, dom.xmlFormatter.tree, dom.xmlFormatter.stats, dom.xmlFormatter.error);
    return;
  }
  const result = action === "compact" ? compactXml(input) : action === "to-json" ? xmlToJson(input) : formatXml(input);
  if (result.error) {
    lastOutput = "";
    render.renderError(result.error, dom.xmlFormatter.output, dom.xmlFormatter.tree, dom.xmlFormatter.stats, dom.xmlFormatter.error);
    return;
  }
  lastOutput = result.output;
  if (writeBack) dom.xmlFormatter.input.value = result.output;
  render.renderResult(result, dom.xmlFormatter.output, dom.xmlFormatter.tree, dom.xmlFormatter.stats, dom.xmlFormatter.error);
}

async function copyOutput() {
  if (!lastOutput) return;
  try {
    await navigator.clipboard.writeText(lastOutput);
    showToast("已复制结果");
  } catch {
    showToast("复制失败");
  }
}

function clearAll() {
  dom.xmlFormatter.input.value = "";
  lastOutput = "";
  render.renderEmpty(dom.xmlFormatter.output, dom.xmlFormatter.tree, dom.xmlFormatter.stats, dom.xmlFormatter.error);
}

function showToast(message) {
  dom.xmlFormatter.toast.textContent = message;
  dom.xmlFormatter.toast.classList.remove("hidden");
  clearTimeout(dom.xmlFormatter.toast._timeout);
  dom.xmlFormatter.toast._timeout = setTimeout(() => dom.xmlFormatter.toast.classList.add("hidden"), 1800);
}
