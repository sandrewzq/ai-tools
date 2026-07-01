import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { hexToHsl } from "../../shared/color";
import {
  buildGeneratedPalette,
  buildPaletteCss,
  buildPaletteGuide,
  buildPresetPalette,
  normalizeHexColor,
  palettePresetConfig,
  paletteStyleConfig,
  type PaletteColor,
} from "./logic";

type Mode = "auto" | "preset";

const DEFAULT_BASE = "#2563EB";
const DEFAULT_STYLE = "tech";
const DEFAULT_PRESET = "sakura";

const STYLE_OPTIONS = [
  ["tech", "科技冷静"],
  ["warm", "温暖友好"],
  ["fresh", "清爽自然"],
  ["luxury", "高级克制"],
  ["cyber", "赛博活力"],
];

export default function Tool() {
  const [mode, setMode] = useState<Mode>("auto");
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const [presetId, setPresetId] = useState(DEFAULT_PRESET);
  const [baseColor, setBaseColor] = useState(DEFAULT_BASE);
  const [status, setStatus] = useState("");

  const presets = useMemo(() => palettePresetConfig(), []);
  const palette = useMemo(() => {
    const preset = mode === "preset" ? palettePresetConfig(presetId) : null;
    const colors = preset ? buildPresetPalette(preset) : buildGeneratedPalette(hexToHsl(baseColor), paletteStyleConfig(style));
    const styleName = preset?.name || paletteStyleConfig(style).name;
    const css = buildPaletteCss(colors);
    const guide = buildPaletteGuide(styleName, colors, Boolean(preset));
    return { preset, colors, styleName, css, guide };
  }, [baseColor, mode, presetId, style]);

  const previewStyle = previewVariables(palette.colors);
  const payload = {
    style: palette.styleName,
    mode: palette.preset ? "preset" : "generated",
    colors: palette.colors,
    cssVariables: Object.fromEntries(palette.colors.map((color) => [`--color-${color.role}`, color.hex])),
  };

  function setModeAndDefaults(nextMode: Mode) {
    setMode(nextMode);
    if (nextMode === "preset" && !presetId) setPresetId(DEFAULT_PRESET);
  }

  function syncBaseColor(value: string) {
    const normalized = normalizeHexColor(value);
    if (!normalized) return;
    setBaseColor(normalized);
  }

  async function copyPaletteText(text: string, message: string) {
    if (!text) return;
    try {
      await copyText(text);
      setStatus(message);
    } catch {
      setStatus("复制失败，请手动复制文本框内容。");
    }
  }

  function resetPalette() {
    setStyle(DEFAULT_STYLE);
    setPresetId(DEFAULT_PRESET);
    setBaseColor(DEFAULT_BASE);
    setMode("auto");
    setStatus("已恢复默认配色参数。");
  }

  return (
    <ToolLayout title="配色生成器" description="输入产品场景和风格，生成可用于网页设计的色板、CSS 变量和 UI 预览。">
      <section className="panel palette-panel">
        <div className="palette-layout">
          <div className="palette-controls">
            <div className="section-head compact">
              <div>
                <p className="section-tag">Input</p>
                <h2>配色需求</h2>
              </div>
            </div>

            <div className="palette-mode-tabs" role="tablist" aria-label="配色模式">
              <button className={`palette-mode-tab ${mode === "auto" ? "active" : ""}`} type="button" onClick={() => setModeAndDefaults("auto")}>
                自动生成
              </button>
              <button className={`palette-mode-tab ${mode === "preset" ? "active" : ""}`} type="button" onClick={() => setModeAndDefaults("preset")}>
                精选预设
              </button>
            </div>

            <div className="form-grid palette-form">
              {mode === "auto" ? (
                <>
                  <label className="field palette-auto-field">
                    <span>风格</span>
                    <select value={style} onChange={(event) => setStyle(event.target.value)}>
                      {STYLE_OPTIONS.map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field palette-auto-field">
                    <span>主色</span>
                    <div className="color-picker-field">
                      <input className="color-picker-native" type="color" value={baseColor} onChange={(event) => syncBaseColor(event.target.value)} aria-label="选择主色" />
                      <span className="color-picker-preview" style={{ "--selected-color": baseColor } as CSSProperties}></span>
                      <input className="color-picker-text" type="text" value={baseColor} maxLength={7} onChange={(event) => syncBaseColor(event.target.value)} aria-label="主色 HEX" />
                    </div>
                  </label>
                </>
              ) : (
                <label className="field field-span-2">
                  <span>精选预设</span>
                  <select value={presetId} onChange={(event) => setPresetId(event.target.value)}>
                    {Object.entries(presets).map(([id, preset]) => (
                      <option value={id} key={id}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {mode === "preset" ? (
              <div className="palette-preset-tabs" aria-label="精选配色方案">
                {Object.entries(presets).map(([id, preset]) => (
                  <button
                    className={`palette-preset-tab ${id === presetId ? "active" : ""}`}
                    type="button"
                    key={id}
                    onClick={() => setPresetId(id)}
                  >
                    <span className="preset-color-row">
                      {preset.colors.slice(0, 5).map((color) => (
                        <i style={{ "--preset-color": color.hex } as CSSProperties} key={`${id}-${color.role}`}></i>
                      ))}
                    </span>
                    <strong>{preset.name}</strong>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="action-bar palette-actions">
              <button className="primary-btn" type="button" onClick={() => setStatus("已生成配色。")}>
                生成配色
              </button>
              <button className="ghost-btn" type="button" onClick={resetPalette}>
                重置
              </button>
              <button className="ghost-btn" type="button" onClick={() => copyPaletteText(palette.css, "CSS 变量已复制。")}>
                复制 CSS 变量
              </button>
              <button className="ghost-btn" type="button" onClick={() => copyPaletteText(JSON.stringify(payload, null, 2), "JSON 已复制。")}>
                复制 JSON
              </button>
            </div>
            {status ? <div className="status-message status-info">{status}</div> : null}
          </div>

          <div className="palette-output">
            <div className="section-head compact">
              <div>
                <p className="section-tag">Palette</p>
                <h2>推荐色板</h2>
              </div>
            </div>
            <div className="palette-swatches">
              {palette.colors.map((color) => (
                <article className="palette-swatch" style={{ "--swatch-color": color.hex } as CSSProperties} key={color.role}>
                  <span className="swatch-chip"></span>
                  <strong>{color.label}</strong>
                  <div className="swatch-copy-row">
                    <button className="swatch-copy-btn" type="button" onClick={() => copyPaletteText(color.hex, `HEX 已复制：${color.hex}`)}>
                      HEX {color.hex}
                    </button>
                    <button className="swatch-copy-btn" type="button" onClick={() => copyPaletteText(color.rgb, `RGB 已复制：${color.rgb}`)}>
                      RGB {color.rgb}
                    </button>
                  </div>
                  <small>{color.usage}</small>
                </article>
              ))}
            </div>
            <div className="palette-copy-grid">
              <label className="field">
                <span>CSS 变量</span>
                <textarea rows={8} readOnly value={palette.css} />
              </label>
              <label className="field">
                <span>设计建议</span>
                <textarea rows={8} readOnly value={palette.guide} />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="panel palette-preview-panel">
        <div className="section-head compact">
          <div>
            <p className="section-tag">Preview</p>
            <h2>界面预览</h2>
          </div>
        </div>
        <div className="palette-preview" style={previewStyle}>
          <div className="preview-sidebar">
            <strong>AI Console</strong>
            <span>Dashboard</span>
            <span>Models</span>
            <span>Settings</span>
          </div>
          <div className="preview-main">
            <div className="preview-hero-card">
              <small>智能推荐</small>
              <h3>让产品界面保持一致的视觉语言</h3>
              <p>通过主色、辅助色、背景色和文字色，快速预览一套完整网页配色。</p>
              <button type="button">主要行动</button>
            </div>
            <div className="preview-metrics">
              <article><span>Primary</span><strong>86%</strong></article>
              <article><span>Accent</span><strong>42k</strong></article>
              <article><span>Contrast</span><strong>AA</strong></article>
            </div>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}

function previewVariables(colors: PaletteColor[]) {
  const byRole = Object.fromEntries(colors.map((color) => [color.role, color.hex]));
  return {
    "--preview-primary": byRole.primary || "#2563EB",
    "--preview-secondary": byRole.secondary || "#14B8A6",
    "--preview-accent": byRole.accent || "#F97316",
    "--preview-background": byRole.background || "#F8FAFC",
    "--preview-surface": byRole.surface || "#FFFFFF",
    "--preview-text": byRole.text || "#10202B",
    "--preview-muted": byRole.muted || "#64748B",
  } as CSSProperties;
}
