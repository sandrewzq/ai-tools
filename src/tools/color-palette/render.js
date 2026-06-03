import { escapeHtml } from "../../shared/format.js";

export function renderPaletteSwatches(colors, container) {
  const fragment = document.createDocumentFragment();

  colors.forEach((color) => {
    const article = document.createElement("article");
    article.className = "palette-swatch";
    article.style.setProperty("--swatch-color", color.hex);
    article.innerHTML = `
      <span class="swatch-chip"></span>
      <strong>${escapeHtml(color.label)}</strong>
      <div class="swatch-copy-row">
        <button class="swatch-copy-btn" type="button" data-copy-color="${color.hex}" data-copy-label="HEX">HEX ${color.hex}</button>
        <button class="swatch-copy-btn" type="button" data-copy-color="${escapeHtml(color.rgb)}" data-copy-label="RGB">RGB ${escapeHtml(color.rgb)}</button>
      </div>
      <small>${escapeHtml(color.usage)}</small>
    `;
    fragment.appendChild(article);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

export function buildPaletteCss(colors) {
  return `:root {\n${colors.map((color) => `  --color-${color.role}: ${color.hex};`).join("\n")}\n}`;
}

export function buildPaletteGuide(styleName, colors, isPreset) {
  const primary = colors.find((color) => color.role === "primary");
  const accent = colors.find((color) => color.role === "accent");
  const background = colors.find((color) => color.role === "background");
  return [
    `${isPreset ? "精选方案" : "生成风格"}：${styleName}`,
    `建议比例：背景 ${background.hex} 使用 60%，主色 ${primary.hex} 使用 30%，强调色 ${accent.hex} 控制在 10% 以内。`,
    "主色用于关键按钮和链接，辅助色用于图表或次级操作，强调色只用于提醒、徽标和关键数据。",
    "如果用于正式产品页，建议再根据品牌资产微调饱和度，并检查真实文本的对比度。",
  ].join("\n");
}

export function applyPalettePreview(colors, previewEl) {
  colors.forEach((color) => {
    previewEl.style.setProperty(`--preview-${color.role}`, color.hex);
  });
}
