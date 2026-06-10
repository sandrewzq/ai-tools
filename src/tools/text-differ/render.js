import { escapeHtml } from "../../shared/format.js";

export function renderDiffResult(diffResult, container) {
  const fragment = document.createDocumentFragment();

  for (const item of diffResult) {
    const line = document.createElement("div");
    line.className = `diff-line diff-${item.type}`;

    const prefix = item.type === "added" ? "+" : item.type === "removed" ? "-" : " ";
    const numA = item.lineA != null ? item.lineA : "";
    const numB = item.lineB != null ? item.lineB : "";

    line.innerHTML = `
      <span class="diff-line-num diff-num-a">${numA}</span>
      <span class="diff-line-num diff-num-b">${numB}</span>
      <span class="diff-line-prefix">${prefix}</span>
      <span class="diff-line-text">${escapeHtml(item.text) || " "}</span>
    `;
    fragment.appendChild(line);
  }

  container.innerHTML = "";
  container.appendChild(fragment);
}

export function renderDiffStats(stats, container) {
  container.innerHTML = `
    <div class="diff-stats">
      <div class="diff-stat diff-stat-added">
        <strong>+${stats.added}</strong>
        <span>新增行</span>
      </div>
      <div class="diff-stat diff-stat-removed">
        <strong>-${stats.removed}</strong>
        <span>删除行</span>
      </div>
      <div class="diff-stat diff-stat-equal">
        <strong>${stats.equal}</strong>
        <span>未变行</span>
      </div>
    </div>
  `;
}

export function renderEmpty(container, statsContainer) {
  container.innerHTML = '<div class="empty-state">在左右两侧粘贴文本，点击「开始比对」。</div>';
  statsContainer.innerHTML = "";
}
