import { escapeHtml } from "../../shared/format.js";
import { getCsvStats } from "./data.js";

export function renderEmpty(jsonEl, tableEl, statsEl, errorEl) {
  jsonEl.textContent = "[]";
  tableEl.innerHTML = '<div class="empty-state">CSV 表格预览会显示在这里。</div>';
  statsEl.innerHTML = "";
  hideError(errorEl);
}

export function renderResult(result, jsonEl, tableEl, statsEl, errorEl) {
  jsonEl.textContent = result.output;
  tableEl.innerHTML = renderTable(result.headers, result.rows);
  renderStats(getCsvStats(result), statsEl);
  hideError(errorEl);
}

export function renderError(message, jsonEl, tableEl, statsEl, errorEl) {
  jsonEl.textContent = "";
  tableEl.innerHTML = "";
  statsEl.innerHTML = "";
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function renderTable(headers, rows) {
  if (!rows.length) return '<div class="empty-state">没有数据行。</div>';
  const previewRows = rows.slice(0, 50);
  return `
    <table class="result-table result-table-small devtool-table">
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>${previewRows.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  `;
}

function renderStats(stats, container) {
  container.innerHTML = `
    <div class="devtool-stats-grid">
      <div class="devtool-stat"><strong>${stats.rows}</strong><span>行数</span></div>
      <div class="devtool-stat"><strong>${stats.columns}</strong><span>列数</span></div>
      <div class="devtool-stat"><strong>${escapeHtml(stats.delimiter)}</strong><span>分隔符</span></div>
    </div>
  `;
}

function hideError(errorEl) {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}
