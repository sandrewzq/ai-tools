import { escapeHtml } from "../../shared/format.js";
import { analyzeJson, renderJsonTree } from "./data.js";

export function renderOutput(parsed, container) {
  container.innerHTML = renderJsonTree(parsed);
  bindTreeToggle(container);
}

export function renderError(message, container) {
  container.innerHTML = `<div class="json-error">${escapeHtml(message)}</div>`;
}

export function renderEmpty(container) {
  container.innerHTML = '<div class="empty-state">请粘贴 JSON 文本并点击操作按钮。</div>';
}

export function renderStats(parsed, container) {
  const stats = analyzeJson(parsed);
  const jsonStr = JSON.stringify(parsed, null, 2);
  const lines = jsonStr.split("\n").length;

  container.innerHTML = `
    <div class="json-stats-grid">
      <div class="json-stat">
        <strong>${stats.type}</strong>
        <span>根类型</span>
      </div>
      <div class="json-stat">
        <strong>${stats.depth}</strong>
        <span>最大深度</span>
      </div>
      <div class="json-stat">
        <strong>${stats.keys}</strong>
        <span>键数</span>
      </div>
      <div class="json-stat">
        <strong>${lines}</strong>
        <span>行数</span>
      </div>
      <div class="json-stat">
        <strong>${stats.strings + stats.numbers + stats.booleans + stats.nulls}</strong>
        <span>值数</span>
      </div>
    </div>
  `;
}

function bindTreeToggle(container) {
  container.addEventListener("click", (e) => {
    const toggle = e.target.closest(".json-toggle");
    if (!toggle) return;

    const targetId = toggle.dataset.target;
    const parent = toggle.parentElement;

    // 折叠/展开
    const isCollapsed = parent.classList.toggle("collapsed");
    toggle.textContent = isCollapsed ? "▶" : "▼";

    // 隐藏/显示子节点
    let sibling = parent.nextElementSibling;
    const depth = parseInt(parent.dataset.depth, 10);
    while (sibling) {
      if (sibling.classList.contains("json-close")) {
        const sDepth = parseInt(sibling.dataset.depth, 10);
        if (sDepth === depth) break;
      }
      if (isCollapsed) {
        sibling.classList.add("json-hidden");
      } else {
        sibling.classList.remove("json-hidden");
      }
      sibling = sibling.nextElementSibling;
    }
  });
}
