import { hexToHsl } from "../../shared/color.js";
import { escapeHtml } from "../../shared/format.js";
import * as dom from "../../shared/dom-cache.js";
import * as data from "./palette-data.js";
import * as render from "./render.js";

export const meta = {
  id: "color-palette",
  route: "#color-palette",
  title: "AI 配色推荐",
  kicker: "Palette Generator",
  description: "根据场景、风格和主色生成网页可用色板、CSS 变量和界面预览。",
};

const DEFAULT_PALETTE = {
  style: "tech",
  preset: "sakura",
  baseColor: "#2563eb",
};

let latestPalettePayload = null;
let currentMode = "auto";

export function init() {
  bindEvents();
  renderPalettePresetTabs();
  setMode("auto", false);
  generatePalette();
}

export function destroy() {
  // 配色工具无特殊清理需求
}

function bindEvents() {
  dom.colorPalette.autoModeBtn.addEventListener("click", () => setMode("auto"));
  dom.colorPalette.presetModeBtn.addEventListener("click", () => setMode("preset"));
  dom.colorPalette.generateBtn.addEventListener("click", generatePalette);
  dom.colorPalette.resetBtn.addEventListener("click", resetPalette);
  dom.colorPalette.copyCssBtn.addEventListener("click", () => copyPaletteText(dom.colorPalette.cssOutput.value, "CSS 变量已复制。"));
  dom.colorPalette.copyJsonBtn.addEventListener("click", () => copyPaletteText(JSON.stringify(latestPalettePayload, null, 2), "JSON 已复制。"));
  dom.colorPalette.styleInput.addEventListener("input", generatePalette);
  dom.colorPalette.styleInput.addEventListener("change", generatePalette);
  dom.colorPalette.baseColorInput.addEventListener("input", () => syncBaseColor(dom.colorPalette.baseColorInput.value));
  dom.colorPalette.baseColorInput.addEventListener("change", () => syncBaseColor(dom.colorPalette.baseColorInput.value));
  dom.colorPalette.baseColorTextInput.addEventListener("input", () => syncBaseColorText(dom.colorPalette.baseColorTextInput.value));
  dom.colorPalette.baseColorTextInput.addEventListener("change", () => syncBaseColorText(dom.colorPalette.baseColorTextInput.value));
  dom.colorPalette.presetInput.addEventListener("change", () => {
    setMode("preset", false);
    generatePalette();
  });

  // 事件委托：色板复制按钮
  dom.colorPalette.swatches.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-copy-color]");
    if (!btn) return;
    copyPaletteText(btn.dataset.copyColor, `${btn.dataset.copyLabel} 已复制：${btn.dataset.copyColor}`);
  });
}

function setMode(mode, shouldGenerate = true) {
  const normalizedMode = mode === "preset" ? "preset" : "auto";
  currentMode = normalizedMode;

  dom.colorPalette.presetInput.value = normalizedMode === "preset" && dom.colorPalette.presetInput.value
    ? dom.colorPalette.presetInput.value
    : "";
  dom.colorPalette.autoModeBtn.classList.toggle("active", normalizedMode === "auto");
  dom.colorPalette.presetModeBtn.classList.toggle("active", normalizedMode === "preset");
  dom.colorPalette.presetTabs.classList.toggle("hidden", normalizedMode !== "preset");
  document.querySelectorAll(".palette-auto-field").forEach((element) => {
    element.classList.toggle("hidden", normalizedMode !== "auto");
  });

  if (normalizedMode === "preset" && !dom.colorPalette.presetInput.value) {
    dom.colorPalette.presetInput.value = DEFAULT_PALETTE.preset;
  }
  syncPalettePresetTabs();
  if (shouldGenerate) {
    generatePalette();
  }
}

function syncBaseColor(hex) {
  const normalizedHex = normalizeHexColor(hex);
  if (!normalizedHex) return;
  dom.colorPalette.baseColorInput.value = normalizedHex;
  dom.colorPalette.baseColorTextInput.value = normalizedHex;
  dom.colorPalette.baseColorPreview.style.setProperty("--selected-color", normalizedHex);
  generatePalette();
}

function syncBaseColorText(value) {
  const normalizedHex = normalizeHexColor(value);
  if (!normalizedHex) return;
  syncBaseColor(normalizedHex);
}

function normalizeHexColor(value) {
  const raw = value.trim();
  const hex = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toUpperCase() : null;
}

function generatePalette() {
  const style = dom.colorPalette.styleInput.value;
  const preset = dom.colorPalette.presetInput.value;
  const baseHex = dom.colorPalette.baseColorInput.value;
  const baseHsl = hexToHsl(baseHex);
  const styleConfig = data.paletteStyleConfig(style);
  const presetConfig = data.palettePresetConfig(preset);
  const colors = presetConfig
    ? data.buildPresetPalette(presetConfig)
    : data.buildGeneratedPalette(baseHsl, styleConfig);

  const css = render.buildPaletteCss(colors);
  const guide = render.buildPaletteGuide(presetConfig?.name || styleConfig.name, colors, Boolean(presetConfig));
  latestPalettePayload = {
    style: presetConfig?.name || styleConfig.name,
    mode: presetConfig ? "preset" : "generated",
    colors,
    cssVariables: Object.fromEntries(colors.map((color) => [`--color-${color.role}`, color.hex])),
  };

  render.renderPaletteSwatches(colors, dom.colorPalette.swatches);
  dom.colorPalette.cssOutput.value = css;
  dom.colorPalette.guideOutput.value = guide;
  render.applyPalettePreview(colors, dom.colorPalette.preview);
}

function renderPalettePresetTabs() {
  const presets = data.palettePresetConfig();
  dom.colorPalette.presetTabs.innerHTML = Object.entries(presets)
    .map(([id, preset]) => `
      <button class="palette-preset-tab" type="button" data-palette-preset="${id}">
        <span class="preset-color-row">
          ${preset.colors.slice(0, 5).map((color) => `<i style="--preset-color:${color.hex}"></i>`).join("")}
        </span>
        <strong>${escapeHtml(preset.name)}</strong>
      </button>
    `)
    .join("");

  dom.colorPalette.presetTabs.querySelectorAll("[data-palette-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      dom.colorPalette.presetInput.value = button.dataset.palettePreset;
      setMode("preset");
    });
  });
  syncPalettePresetTabs();
}

function syncPalettePresetTabs() {
  dom.colorPalette.presetTabs.querySelectorAll("[data-palette-preset]").forEach((button) => {
    button.classList.toggle("active", button.dataset.palettePreset === dom.colorPalette.presetInput.value);
  });
}

function resetPalette() {
  dom.colorPalette.styleInput.value = DEFAULT_PALETTE.style;
  dom.colorPalette.presetInput.value = "";
  syncBaseColor(DEFAULT_PALETTE.baseColor);
  setMode("auto", false);
  generatePalette();
  showStatus("已恢复默认配色参数。", "info");
}

async function copyPaletteText(text, message) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showStatus(message, "success");
  } catch {
    showStatus("复制失败，请手动复制文本框内容。", "error");
  }
}

function showStatus(message, level) {
  dom.colorPalette.status.textContent = message;
  dom.colorPalette.status.className = `status-message status-${level}`;
}
