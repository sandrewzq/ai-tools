import * as dom from "../../shared/dom-cache.js";
import { estimateTokens, getTextStats } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "token-calculator",
  route: "#token-calculator",
  title: "Token 计算器",
  kicker: "Token Estimator",
  description: "估算文本在不同大模型下的 token 消耗，支持 GPT / Claude 系列，实时统计中英文字数和预估费用。",
};

let debounceTimer = null;

export function init() {
  render.renderModelOptions(dom.tokenCalc.modelSelect);
  bindEvents();
  render.renderEmpty(dom.tokenCalc.statsContainer, dom.tokenCalc.detailsContainer);
}

export function destroy() {
  clearTimeout(debounceTimer);
}

function bindEvents() {
  dom.tokenCalc.textInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doCalculate, 300);
  });

  dom.tokenCalc.modelSelect.addEventListener("change", doCalculate);
  dom.tokenCalc.clearBtn.addEventListener("click", clearAll);
}

function doCalculate() {
  const text = dom.tokenCalc.textInput.value;
  const modelId = dom.tokenCalc.modelSelect.value;

  if (!text.trim()) {
    render.renderEmpty(dom.tokenCalc.statsContainer, dom.tokenCalc.detailsContainer);
    return;
  }

  const tokens = estimateTokens(text);
  const stats = getTextStats(text);

  render.renderStats(tokens, stats, modelId, dom.tokenCalc.statsContainer, dom.tokenCalc.detailsContainer);
}

function clearAll() {
  dom.tokenCalc.textInput.value = "";
  render.renderEmpty(dom.tokenCalc.statsContainer, dom.tokenCalc.detailsContainer);
}
