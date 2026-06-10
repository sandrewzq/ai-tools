import * as dom from "../../shared/dom-cache.js";
import { testRegex } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "regex-tester",
  route: "#regex-tester",
  title: "正则测试器",
  kicker: "Regex Tester",
  description: "编写和测试正则表达式，实时高亮匹配结果，查看捕获组详情。",
};

let timer = null;

export function init() {
  bindEvents();
  render.renderEmpty(dom.regexTester.matchContainer, dom.regexTester.highlightContainer, dom.regexTester.statsContainer);
  // 读取 localStorage 中保存的正则和文本
  const savedRegex = localStorage.getItem("regexTesterPattern") || "";
  const savedFlags = localStorage.getItem("regexTesterFlags") || "g";
  const savedText = localStorage.getItem("regexTesterText") || "";
  dom.regexTester.regexInput.value = savedRegex;
  dom.regexTester.flagsInput.value = savedFlags;
  dom.regexTester.testText.value = savedText;
  if (savedRegex && savedText) runTest();
}

export function destroy() {}

function bindEvents() {
  dom.regexTester.regexInput.addEventListener("input", debounceRun);
  dom.regexTester.flagsInput.addEventListener("input", debounceRun);
  dom.regexTester.testText.addEventListener("input", debounceRun);
}

function debounceRun() {
  clearTimeout(timer);
  timer = setTimeout(runTest, 200);
}

function runTest() {
  const pattern = dom.regexTester.regexInput.value;
  const flags = dom.regexTester.flagsInput.value;
  const text = dom.regexTester.testText.value;

  localStorage.setItem("regexTesterPattern", pattern);
  localStorage.setItem("regexTesterFlags", flags);
  localStorage.setItem("regexTesterText", text);

  const result = testRegex(pattern, flags, text);
  render.renderResult(
    result,
    dom.regexTester.matchContainer,
    dom.regexTester.highlightContainer,
    dom.regexTester.statsContainer,
  );
}
