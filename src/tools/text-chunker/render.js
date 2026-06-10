import { escapeHtml } from "../../shared/format.js";
import { SPLIT_MODES } from "./data.js";

export function renderSplitModeOptions(container) {
  container.innerHTML = SPLIT_MODES.map(
    (m) => `<option value="${m.key}">${m.label}</option>`,
  ).join("");
}

export function renderChunks(chunks, container) {
  const fragment = document.createDocumentFragment();

  chunks.forEach((chunk, index) => {
    const card = document.createElement("article");
    card.className = "chunk-card";
    card.innerHTML = `
      <div class="chunk-card-header">
        <div class="chunk-card-meta">
          <span class="chunk-badge">#${index + 1}</span>
          <span class="chunk-meta-text">${chunk.chars} 字</span>
          <span class="chunk-meta-text">~${chunk.tokens} tokens</span>
        </div>
        <button class="copy-btn chunk-copy-btn" type="button" data-index="${index}" aria-label="复制此分块">
          复制
        </button>
      </div>
      <pre class="chunk-card-text">${escapeHtml(chunk.text)}</pre>
    `;
    fragment.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

export function renderStats(chunks, container) {
  const totalChars = chunks.reduce((sum, c) => sum + c.chars, 0);
  const totalTokens = chunks.reduce((sum, c) => sum + c.tokens, 0);
  container.innerHTML = `
    <div class="chunk-stats">
      <div class="chunk-stat">
        <strong>${chunks.length}</strong>
        <span>分块数</span>
      </div>
      <div class="chunk-stat">
        <strong>${totalChars}</strong>
        <span>总字符数</span>
      </div>
      <div class="chunk-stat">
        <strong>~${totalTokens}</strong>
        <span>预估 Tokens</span>
      </div>
      <div class="chunk-stat">
        <strong>${chunks.length > 0 ? Math.round(totalChars / chunks.length) : 0}</strong>
        <span>平均每块</span>
      </div>
    </div>
  `;
}

export function renderEmpty(container) {
  container.innerHTML = '<div class="empty-state">请输入文本并点击「开始分块」。</div>';
}
