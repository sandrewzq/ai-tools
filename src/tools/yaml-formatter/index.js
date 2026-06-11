import * as dom from "../../shared/dom-cache.js";
import { debounce } from "../../shared/format.js";
import { compactYaml, formatYaml, jsonToYaml, yamlToJson } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "yaml-formatter",
  route: "#yaml-formatter",
  title: "YAML 格式化器",
  kicker: "YAML Formatter",
  description: "格式化、压缩和校验 YAML，支持 YAML 与 JSON 基础互转。",
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
  if (dom.yamlFormatter.input.value.trim()) runAction("format", false);
  else render.renderEmpty(dom.yamlFormatter.output, dom.yamlFormatter.jsonOutput, dom.yamlFormatter.stats, dom.yamlFormatter.error);
}

export function destroy() {}

function bindEvents() {
  dom.yamlFormatter.input.addEventListener("input", () => debouncedValidate());
  dom.yamlFormatter.formatBtn.addEventListener("click", () => runAction("format", true));
  dom.yamlFormatter.compactBtn.addEventListener("click", () => runAction("compact", true));
  dom.yamlFormatter.toJsonBtn.addEventListener("click", () => runAction("to-json", true));
  dom.yamlFormatter.fromJsonBtn.addEventListener("click", () => runAction("from-json", true));
  dom.yamlFormatter.copyBtn.addEventListener("click", copyOutput);
  dom.yamlFormatter.clearBtn.addEventListener("click", clearAll);
}

function runAction(action, writeBack) {
  const input = dom.yamlFormatter.input.value.trim();
  if (!input) {
    lastOutput = "";
    render.renderEmpty(dom.yamlFormatter.output, dom.yamlFormatter.jsonOutput, dom.yamlFormatter.stats, dom.yamlFormatter.error);
    return;
  }

  const result = action === "compact" ? compactYaml(input) : action === "to-json" ? yamlToJson(input) : action === "from-json" ? jsonToYaml(input) : formatYaml(input);
  if (result.error) {
    lastOutput = "";
    render.renderError(result.error, dom.yamlFormatter.output, dom.yamlFormatter.jsonOutput, dom.yamlFormatter.stats, dom.yamlFormatter.error);
    return;
  }
  lastOutput = result.output;
  if (writeBack) dom.yamlFormatter.input.value = result.output;
  if (action === "to-json") render.renderJsonResult(result, dom.yamlFormatter.output, dom.yamlFormatter.jsonOutput, dom.yamlFormatter.stats, dom.yamlFormatter.error);
  else render.renderResult(result, dom.yamlFormatter.output, dom.yamlFormatter.jsonOutput, dom.yamlFormatter.stats, dom.yamlFormatter.error);
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
  dom.yamlFormatter.input.value = "";
  lastOutput = "";
  render.renderEmpty(dom.yamlFormatter.output, dom.yamlFormatter.jsonOutput, dom.yamlFormatter.stats, dom.yamlFormatter.error);
}

function showToast(message) {
  dom.yamlFormatter.toast.textContent = message;
  dom.yamlFormatter.toast.classList.remove("hidden");
  clearTimeout(dom.yamlFormatter.toast._timeout);
  dom.yamlFormatter.toast._timeout = setTimeout(() => dom.yamlFormatter.toast.classList.add("hidden"), 1800);
}
