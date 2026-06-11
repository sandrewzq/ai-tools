import * as dom from "../../shared/dom-cache.js";
import { debounce } from "../../shared/format.js";
import { getUrlExamples, parseUrl } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "url-parser",
  route: "#url-parser",
  title: "URL 解析器",
  kicker: "URL Parser",
  description: "拆解 URL 组成部分，查看 Query 表格、Query JSON 和重建结果。",
};

let eventsBound = false;
let debouncedParse;
let lastUrl = "";
let lastQueryJson = "";

export function init() {
  debouncedParse = debounce(runParse, 200);
  if (!eventsBound) {
    bindEvents();
    eventsBound = true;
  }
  if (dom.urlParser.input.value.trim()) runParse();
  else render.renderEmpty(dom.urlParser.parts, dom.urlParser.query, dom.urlParser.json, dom.urlParser.rebuilt, dom.urlParser.error);
}

export function destroy() {}

function bindEvents() {
  dom.urlParser.input.addEventListener("input", () => debouncedParse());
  dom.urlParser.parseBtn.addEventListener("click", runParse);
  dom.urlParser.exampleBtn.addEventListener("click", () => {
    dom.urlParser.input.value = getUrlExamples()[0];
    runParse();
  });
  dom.urlParser.copyUrlBtn.addEventListener("click", () => copyText(lastUrl));
  dom.urlParser.copyJsonBtn.addEventListener("click", () => copyText(lastQueryJson));
  dom.urlParser.clearBtn.addEventListener("click", clearAll);
}

function runParse() {
  const result = parseUrl(dom.urlParser.input.value);
  if (result.error) {
    lastUrl = "";
    lastQueryJson = "";
    render.renderError(result.error, dom.urlParser.parts, dom.urlParser.query, dom.urlParser.json, dom.urlParser.rebuilt, dom.urlParser.error);
    return;
  }
  lastUrl = result.parts.href;
  lastQueryJson = JSON.stringify(result.queryJson, null, 2);
  render.renderResult(result, dom.urlParser.parts, dom.urlParser.query, dom.urlParser.json, dom.urlParser.rebuilt, dom.urlParser.error);
}

async function copyText(value) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    showToast("已复制");
  } catch {
    showToast("复制失败");
  }
}

function clearAll() {
  dom.urlParser.input.value = "";
  lastUrl = "";
  lastQueryJson = "";
  render.renderEmpty(dom.urlParser.parts, dom.urlParser.query, dom.urlParser.json, dom.urlParser.rebuilt, dom.urlParser.error);
}

function showToast(message) {
  dom.urlParser.toast.textContent = message;
  dom.urlParser.toast.classList.remove("hidden");
  clearTimeout(dom.urlParser.toast._timeout);
  dom.urlParser.toast._timeout = setTimeout(() => dom.urlParser.toast.classList.add("hidden"), 1800);
}
