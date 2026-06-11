import { escapeHtml } from "../../shared/format.js";
import { getXmlStats } from "./data.js";

export function renderEmpty(outputEl, treeEl, statsEl, errorEl) {
  outputEl.textContent = "请粘贴 XML 内容并点击操作按钮。";
  treeEl.textContent = "XML 树结构 JSON 会显示在这里。";
  statsEl.innerHTML = "";
  hideError(errorEl);
}

export function renderResult(result, outputEl, treeEl, statsEl, errorEl) {
  outputEl.textContent = result.output;
  treeEl.textContent = JSON.stringify(result.tree, null, 2);
  renderStats(getXmlStats(result.tree, result.output), statsEl);
  hideError(errorEl);
}

export function renderError(message, outputEl, treeEl, statsEl, errorEl) {
  outputEl.textContent = "";
  treeEl.textContent = "";
  statsEl.innerHTML = "";
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function hideError(errorEl) {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}

function renderStats(stats, container) {
  container.innerHTML = `
    <div class="devtool-stats-grid">
      <div class="devtool-stat"><strong>${escapeHtml(stats.root)}</strong><span>根节点</span></div>
      <div class="devtool-stat"><strong>${stats.nodes}</strong><span>节点</span></div>
      <div class="devtool-stat"><strong>${stats.attrs}</strong><span>属性</span></div>
      <div class="devtool-stat"><strong>${stats.lines}</strong><span>行数</span></div>
    </div>
  `;
}
