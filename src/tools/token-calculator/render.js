import { MODELS } from "./data.js";

export function renderModelOptions(select) {
  select.innerHTML = MODELS.map(
    (m) => `<option value="${m.id}">${m.name}</option>`,
  ).join("");
}

export function renderStats(tokens, stats, modelId, container, detailContainer) {
  const model = MODELS.find((m) => m.id === modelId) || MODELS[0];
  const inputPrice = ((tokens / 1000) * model.priceInput).toFixed(4);
  const outputPrice = ((tokens / 1000) * model.priceOutput).toFixed(4);

  container.innerHTML = `
    <div class="token-stats-grid">
      <div class="token-stat-card">
        <div class="token-stat-value">${tokens.toLocaleString()}</div>
        <div class="token-stat-label">预估 Tokens</div>
      </div>
      <div class="token-stat-card">
        <div class="token-stat-value">${stats.chars.toLocaleString()}</div>
        <div class="token-stat-label">字符数</div>
      </div>
      <div class="token-stat-card">
        <div class="token-stat-value">${stats.chineseChars.toLocaleString()}</div>
        <div class="token-stat-label">中文字数</div>
      </div>
      <div class="token-stat-card">
        <div class="token-stat-value">${stats.englishWords.toLocaleString()}</div>
        <div class="token-stat-label">英文词数</div>
      </div>
    </div>
  `;

  detailContainer.innerHTML = `
    <div class="token-detail-row">
      <span>模型编码器</span>
      <span class="token-detail-value">${model.encoder}</span>
    </div>
    <div class="token-detail-row">
      <span>预估价格（Input）</span>
      <span class="token-detail-value">$${inputPrice}</span>
    </div>
    <div class="token-detail-row">
      <span>预估价格（Output）</span>
      <span class="token-detail-value">$${outputPrice}</span>
    </div>
  `;
}

export function renderEmpty(container, detailContainer) {
  container.innerHTML = '<div class="empty-state">输入文本后将自动显示 token 估算结果。</div>';
  detailContainer.innerHTML = "";
}
