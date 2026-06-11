export function renderColorResult(result, previewEl, formatsEl, errorEl) {
  errorEl.classList.add("hidden");
  errorEl.textContent = "";
  previewEl.innerHTML = `
    <div class="color-converter-swatch" style="--swatch:${result.preview}"></div>
    <div class="color-converter-preview-meta">
      <code>${result.hex}</code>
    </div>
  `;
  formatsEl.innerHTML = [
    ["HEX", result.hex],
    ["RGB", result.rgb],
    ["HSL", result.hsl],
    ["OKLCH", result.oklch],
  ]
    .map(
      ([label, value]) => `
        <div class="color-format-card">
          <span class="color-format-label">${label}</span>
          <code class="color-format-value">${value}</code>
          <button class="ghost-btn color-copy-btn" data-copy-value="${value}">复制</button>
        </div>
      `,
    )
    .join("");
}

export function renderColorEmpty(previewEl, formatsEl, errorEl) {
  previewEl.innerHTML = `<p class="color-converter-empty">输入颜色后显示预览</p>`;
  formatsEl.innerHTML = "";
  errorEl.classList.add("hidden");
  errorEl.textContent = "";
}

export function renderColorError(message, previewEl, formatsEl, errorEl) {
  previewEl.innerHTML = `<p class="color-converter-empty">无法生成颜色预览</p>`;
  formatsEl.innerHTML = "";
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}
