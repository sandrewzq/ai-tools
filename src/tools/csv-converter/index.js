import * as dom from "../../shared/dom-cache.js";
import { debounce } from "../../shared/format.js";
import { csvToJson, getCsvExample } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "csv-converter",
  route: "#csv-converter",
  title: "CSV 转 JSON / 表格",
  kicker: "CSV Converter",
  description: "解析 CSV 为 JSON，并提供表格预览、分隔符识别和表头选项。",
};

let eventsBound = false;
let debouncedConvert;
let lastJson = "";

export function init() {
  debouncedConvert = debounce(runConvert, 250);
  if (!eventsBound) {
    bindEvents();
    eventsBound = true;
  }
  if (dom.csvConverter.input.value.trim()) runConvert();
  else render.renderEmpty(dom.csvConverter.json, dom.csvConverter.table, dom.csvConverter.stats, dom.csvConverter.error);
}

export function destroy() {}

function bindEvents() {
  dom.csvConverter.input.addEventListener("input", () => debouncedConvert());
  dom.csvConverter.delimiter.addEventListener("change", runConvert);
  dom.csvConverter.hasHeader.addEventListener("change", runConvert);
  dom.csvConverter.convertBtn.addEventListener("click", runConvert);
  dom.csvConverter.exampleBtn.addEventListener("click", () => {
    dom.csvConverter.input.value = getCsvExample();
    runConvert();
  });
  dom.csvConverter.copyBtn.addEventListener("click", copyJson);
  dom.csvConverter.clearBtn.addEventListener("click", clearAll);
}

function runConvert() {
  const result = csvToJson(dom.csvConverter.input.value, {
    delimiter: dom.csvConverter.delimiter.value,
    hasHeader: dom.csvConverter.hasHeader.checked,
  });
  if (result.error) {
    lastJson = "";
    render.renderError(result.error, dom.csvConverter.json, dom.csvConverter.table, dom.csvConverter.stats, dom.csvConverter.error);
    return;
  }
  lastJson = result.output;
  render.renderResult(result, dom.csvConverter.json, dom.csvConverter.table, dom.csvConverter.stats, dom.csvConverter.error);
}

async function copyJson() {
  if (!lastJson) return;
  try {
    await navigator.clipboard.writeText(lastJson);
    showToast("已复制 JSON");
  } catch {
    showToast("复制失败");
  }
}

function clearAll() {
  dom.csvConverter.input.value = "";
  lastJson = "";
  render.renderEmpty(dom.csvConverter.json, dom.csvConverter.table, dom.csvConverter.stats, dom.csvConverter.error);
}

function showToast(message) {
  dom.csvConverter.toast.textContent = message;
  dom.csvConverter.toast.classList.remove("hidden");
  clearTimeout(dom.csvConverter.toast._timeout);
  dom.csvConverter.toast._timeout = setTimeout(() => dom.csvConverter.toast.classList.add("hidden"), 1800);
}
