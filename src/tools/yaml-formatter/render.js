import { escapeHtml } from "../../shared/format.js";
import { getYamlStats } from "./data.js";

export function renderEmpty(outputEl, jsonEl, statsEl, errorEl) {
  outputEl.textContent = "请粘贴 YAML 或 JSON 内容并点击操作按钮。";
  jsonEl.textContent = "JSON 预览会显示在这里。";
  statsEl.innerHTML = "";
  hideError(errorEl);
}

export function renderResult(result, outputEl, jsonEl, statsEl, errorEl) {
  outputEl.textContent = result.output;
  jsonEl.textContent = JSON.stringify(result.parsed, null, 2);
  renderStats(getYamlStats(result.parsed, result.output), statsEl);
  hideError(errorEl);
}

export function renderJsonResult(result, outputEl, jsonEl, statsEl, errorEl) {
  outputEl.textContent = result.output;
  jsonEl.textContent = result.output;
  renderStats(getYamlStats(result.parsed, result.output), statsEl);
  hideError(errorEl);
}

export function renderError(message, outputEl, jsonEl, statsEl, errorEl) {
  outputEl.textContent = "";
  jsonEl.textContent = "";
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
      <div class="devtool-stat"><strong>${escapeHtml(stats.type)}</strong><span>根类型</span></div>
      <div class="devtool-stat"><strong>${stats.keys}</strong><span>键数</span></div>
      <div class="devtool-stat"><strong>${stats.lines}</strong><span>行数</span></div>
      <div class="devtool-stat"><strong>${stats.chars}</strong><span>字符</span></div>
    </div>
  `;
}
