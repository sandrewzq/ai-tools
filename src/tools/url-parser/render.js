import { escapeHtml } from "../../shared/format.js";

export function renderEmpty(partsEl, queryEl, jsonEl, rebuiltEl, errorEl) {
  partsEl.innerHTML = '<div class="empty-state">请输入 URL 后查看拆解结果。</div>';
  queryEl.innerHTML = '<div class="empty-state">Query 参数会显示在这里。</div>';
  jsonEl.textContent = "{}";
  rebuiltEl.textContent = "";
  hideError(errorEl);
}

export function renderResult(result, partsEl, queryEl, jsonEl, rebuiltEl, errorEl) {
  partsEl.innerHTML = Object.entries(result.parts).map(([key, value]) => `
    <div class="url-part-row">
      <span>${escapeHtml(key)}</span>
      <code>${escapeHtml(value || "-")}</code>
    </div>
  `).join("");
  queryEl.innerHTML = result.query.length ? `
    <table class="result-table result-table-small devtool-table">
      <thead><tr><th>#</th><th>Key</th><th>Value</th></tr></thead>
      <tbody>${result.query.map((item) => `<tr><td>${item.index}</td><td>${escapeHtml(item.key)}</td><td>${escapeHtml(item.value)}</td></tr>`).join("")}</tbody>
    </table>
  ` : '<div class="empty-state">当前 URL 没有 Query 参数。</div>';
  jsonEl.textContent = JSON.stringify(result.queryJson, null, 2);
  rebuiltEl.textContent = result.parts.href;
  hideError(errorEl);
}

export function renderError(message, partsEl, queryEl, jsonEl, rebuiltEl, errorEl) {
  partsEl.innerHTML = "";
  queryEl.innerHTML = "";
  jsonEl.textContent = "";
  rebuiltEl.textContent = "";
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function hideError(errorEl) {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}
