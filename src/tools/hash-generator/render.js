export function renderResult(hash, container, algo) {
  container.innerHTML = `
    <div class="hash-result-row">
      <span class="hash-algo-tag">${algo}</span>
      <code class="hash-value">${hash}</code>
      <button class="ghost-btn hash-copy-btn" data-hash="${hash}" title="复制">复制</button>
    </div>
  `;
}

export function renderEmpty(container) {
  container.innerHTML = `<p class="hash-placeholder">输入文本后自动计算哈希值</p>`;
}

export function renderError(error, container) {
  container.innerHTML = `<p class="hash-placeholder" style="color:#f85149">${error}</p>`;
}
