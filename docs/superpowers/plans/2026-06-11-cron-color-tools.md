# Cron Parser and Color Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two production-ready tools — Cron 解析器 and 颜色格式转换 — into the existing AI 工具箱 with full navigation, rendering, conversion logic, and responsive UI.

**Architecture:** Follow the existing per-tool modular pattern: each tool gets `data.js` for pure logic, `render.js` for DOM HTML generation, and `index.js` for lifecycle/event binding. Integrate both tools through the existing static HTML view structure, lazy DOM cache, dynamic router imports, and shared styling system.

**Tech Stack:** Vanilla JavaScript (ES modules), static HTML, shared CSS, existing helper modules in `src/shared/`.

---

## File Structure

### New files
- `src/tools/cron-parser/data.js` — Parse 5-field cron expressions, validate tokens, and generate structured interpretation payloads.
- `src/tools/cron-parser/render.js` — Render cron field cards, human-readable explanation, examples, and errors.
- `src/tools/cron-parser/index.js` — Bind input/events, example fill, parse trigger, and lifecycle.
- `src/tools/color-converter/data.js` — Parse HEX/RGB/HSL input, convert to HEX/RGB/HSL/OKLCH-like display payloads, and prepare preview data.
- `src/tools/color-converter/render.js` — Render formatted output cards, preview swatch, and copyable result rows.
- `src/tools/color-converter/index.js` — Bind input/events, auto-convert, copy actions, and lifecycle.

### Modified files
- `index.html` — Add nav tabs, home cards, and two new tool view containers.
- `styles.css` — Add layout, cards, preview, responsive rules for both tools.
- `src/core/router.js` — Register dynamic imports and view mappings.
- `src/core/registry.js` — Register tool metadata in the home tool registry.
- `src/shared/dom-cache.js` — Add lazy DOM bindings for both tools.
- `src/shared/color.js` — Add any missing shared color conversion helpers only if required by the new tool.

---

### Task 1: Add Cron parser logic module

**Files:**
- Create: `src/tools/cron-parser/data.js`

- [ ] **Step 1: Write the parsing and validation helpers**

```js
const FIELD_DEFS = [
  { key: "minute", label: "分钟", min: 0, max: 59 },
  { key: "hour", label: "小时", min: 0, max: 23 },
  { key: "day", label: "日期", min: 1, max: 31 },
  { key: "month", label: "月份", min: 1, max: 12 },
  { key: "weekday", label: "星期", min: 0, max: 6 },
];

function isWildcard(token) {
  return token === "*";
}

function isNumberToken(token) {
  return /^\d+$/.test(token);
}

function isRangeToken(token) {
  return /^\d+-\d+$/.test(token);
}

function isStepToken(token) {
  return /^(\*|\d+-\d+|\d+)\/\d+$/.test(token);
}

function isListToken(token) {
  return token.includes(",");
}
```

- [ ] **Step 2: Implement single-field validation and normalization**

```js
function validateSingleToken(token, field) {
  const parts = token.split(",");
  for (const part of parts) {
    if (isWildcard(part)) continue;
    if (isNumberToken(part)) {
      const value = Number(part);
      if (value < field.min || value > field.max) {
        return `${field.label}超出范围 ${field.min}-${field.max}`;
      }
      continue;
    }
    if (isRangeToken(part)) {
      const [start, end] = part.split("-").map(Number);
      if (start > end || start < field.min || end > field.max) {
        return `${field.label}范围无效：${part}`;
      }
      continue;
    }
    if (isStepToken(part)) {
      const [base, stepRaw] = part.split("/");
      const step = Number(stepRaw);
      if (step < 1) return `${field.label}步进无效：${part}`;
      if (base !== "*" && isRangeToken(base)) {
        const [start, end] = base.split("-").map(Number);
        if (start > end || start < field.min || end > field.max) {
          return `${field.label}步进范围无效：${part}`;
        }
      }
      if (base !== "*" && isNumberToken(base)) {
        const value = Number(base);
        if (value < field.min || value > field.max) {
          return `${field.label}步进起点无效：${part}`;
        }
      }
      continue;
    }
    return `${field.label}格式无效：${part}`;
  }
  return null;
}
```

- [ ] **Step 3: Implement human-readable formatter**

```js
function describeField(token, field) {
  if (token === "*") return `每${field.label}`;
  if (/^\d+$/.test(token)) return `${field.label}${token}`;
  if (/^\d+-\d+$/.test(token)) {
    const [start, end] = token.split("-");
    return `${field.label}${start}到${end}`;
  }
  if (/^(\*|\d+-\d+|\d+)\/\d+$/.test(token)) {
    const [base, step] = token.split("/");
    if (base === "*") return `每隔${step}${field.label}`;
    return `${describeField(base, field)}，每隔${step}${field.label}`;
  }
  if (token.includes(",")) {
    return `${field.label}${token.split(",").join("、")}`;
  }
  return token;
}
```

- [ ] **Step 4: Export the public parse function**

```js
export function parseCron(expression) {
  const raw = expression.trim();
  if (!raw) {
    return { error: "请输入 Cron 表达式" };
  }

  const parts = raw.split(/\s+/);
  if (parts.length !== 5) {
    return { error: "当前版本仅支持 5 段 Cron 表达式" };
  }

  const fields = FIELD_DEFS.map((field, index) => {
    const token = parts[index];
    return {
      ...field,
      token,
      description: describeField(token, field),
    };
  });

  for (const field of fields) {
    const error = validateSingleToken(field.token, field);
    if (error) return { error };
  }

  return {
    expression: raw,
    fields,
    summary: buildSummary(fields),
  };
}
```

- [ ] **Step 5: Add summary builder and examples export**

```js
function buildSummary(fields) {
  const minute = fields[0].token;
  const hour = fields[1].token;
  const day = fields[2].token;
  const month = fields[3].token;
  const weekday = fields[4].token;

  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && day === "*" && month === "*" && weekday === "*") {
    return `每天 ${hour.padStart(2, "0")}:${minute.padStart(2, "0")} 执行一次`;
  }
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && day === "*" && month === "*" && weekday === "1-5") {
    return `每周一到周五 ${hour.padStart(2, "0")}:${minute.padStart(2, "0")} 执行一次`;
  }
  return fields.map((field) => field.description).join("，") + " 执行";
}

export const CRON_EXAMPLES = [
  { label: "工作日上午九点", value: "0 9 * * 1-5" },
  { label: "每小时整点", value: "0 * * * *" },
  { label: "每 15 分钟", value: "*/15 * * * *" },
];
```

### Task 2: Add Cron parser render layer

**Files:**
- Create: `src/tools/cron-parser/render.js`

- [ ] **Step 1: Render example buttons**

```js
export function renderExamples(examples, container) {
  container.innerHTML = examples
    .map(
      (item) => `
        <button class="ghost-btn cron-example-btn" type="button" data-cron-example="${item.value}">
          ${item.label}
        </button>
      `,
    )
    .join("");
}
```

- [ ] **Step 2: Render success state**

```js
export function renderCronResult(result, summaryEl, fieldsEl, errorEl) {
  errorEl.classList.add("hidden");
  errorEl.textContent = "";
  summaryEl.innerHTML = `<div class="cron-summary-card">${result.summary}</div>`;
  fieldsEl.innerHTML = result.fields
    .map(
      (field) => `
        <div class="cron-field-card">
          <span class="cron-field-name">${field.label}</span>
          <code class="cron-field-token">${field.token}</code>
          <p class="cron-field-desc">${field.description}</p>
        </div>
      `,
    )
    .join("");
}
```

- [ ] **Step 3: Render error and empty states**

```js
export function renderCronError(message, summaryEl, fieldsEl, errorEl) {
  summaryEl.innerHTML = "";
  fieldsEl.innerHTML = "";
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

export function renderCronEmpty(summaryEl, fieldsEl, errorEl) {
  summaryEl.innerHTML = `<p class="cron-empty">输入 Cron 表达式后，这里会显示中文解释。</p>`;
  fieldsEl.innerHTML = "";
  errorEl.classList.add("hidden");
  errorEl.textContent = "";
}
```

### Task 3: Add Cron parser controller

**Files:**
- Create: `src/tools/cron-parser/index.js`

- [ ] **Step 1: Create tool metadata and init/destroy**

```js
import * as dom from "../../shared/dom-cache.js";
import { debounce } from "../../shared/format.js";
import { parseCron, CRON_EXAMPLES } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "cron-parser",
  route: "#cron-parser",
  title: "Cron 解析器",
  kicker: "Cron Parser",
  description: "解析 5 段 Cron 表达式，输出字段拆解和中文自然语言说明。",
};

let debouncedParse;

export function init() {
  debouncedParse = debounce(runParse, 250);
  bindEvents();
  render.renderExamples(CRON_EXAMPLES, dom.cronParser.examples);
  render.renderCronEmpty(dom.cronParser.summary, dom.cronParser.fields, dom.cronParser.error);
}

export function destroy() {}
```

- [ ] **Step 2: Bind events and example delegation**

```js
function bindEvents() {
  dom.cronParser.input.addEventListener("input", () => debouncedParse());
  dom.cronParser.parseBtn.addEventListener("click", runParse);

  dom.cronParser.examples.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-cron-example]");
    if (!btn) return;
    dom.cronParser.input.value = btn.dataset.cronExample;
    runParse();
  });
}
```

- [ ] **Step 3: Implement parse orchestration**

```js
function runParse() {
  const result = parseCron(dom.cronParser.input.value);
  if (result.error) {
    render.renderCronError(result.error, dom.cronParser.summary, dom.cronParser.fields, dom.cronParser.error);
    return;
  }
  render.renderCronResult(result, dom.cronParser.summary, dom.cronParser.fields, dom.cronParser.error);
}
```

### Task 4: Add color converter logic module

**Files:**
- Create: `src/tools/color-converter/data.js`
- Modify: `src/shared/color.js`

- [ ] **Step 1: Add shared helper only if needed for color conversion**

```js
// src/shared/color.js
export function rgbToHsl(r, g, b) {
  return hexToHsl(rgbToHex(r, g, b));
}
```

- [ ] **Step 2: Create input parsers**

```js
import { hexToRgb, hexToHsl, rgbToHex, rgbToHsl, clamp } from "../../shared/color.js";

function parseHex(input) {
  const normalized = input.trim().toUpperCase();
  if (!/^#?[0-9A-F]{6}$/.test(normalized)) return null;
  return normalized.startsWith("#") ? normalized : `#${normalized}`;
}

function parseRgb(input) {
  const match = input.trim().match(/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i);
  if (!match) return null;
  const [, r, g, b] = match.map(Number);
  if ([r, g, b].some((value) => value < 0 || value > 255)) return null;
  return rgbToHex(r, g, b);
}

function parseHsl(input) {
  const match = input.trim().match(/^hsl\(([-\d.]+),\s*([-\d.]+)%?,\s*([-\d.]+)%?\)$/i);
  if (!match) return null;
  const h = Number(match[1]);
  const s = clamp(Number(match[2]), 0, 100);
  const l = clamp(Number(match[3]), 0, 100);
  return hslToHex(h, s, l);
}
```

- [ ] **Step 3: Implement output formatter**

```js
function formatRgb({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function formatHsl({ h, s, l }) {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function formatOklchFallback({ h, s, l }) {
  const lightness = (l / 100).toFixed(2);
  const chroma = (s / 100 * 0.18).toFixed(2);
  const hue = Math.round(h);
  return `oklch(${lightness} ${chroma} ${hue})`;
}
```

- [ ] **Step 4: Export main conversion function**

```js
export function convertColor(input) {
  const hex = parseHex(input) || parseRgb(input) || parseHsl(input);
  if (!hex) {
    return { error: "仅支持 HEX、rgb(...)、hsl(...) 三种输入格式" };
  }

  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);

  return {
    hex,
    rgb: formatRgb(rgb),
    hsl: formatHsl(hsl),
    oklch: formatOklchFallback(hsl),
    preview: hex,
  };
}
```

### Task 5: Add color converter render layer

**Files:**
- Create: `src/tools/color-converter/render.js`

- [ ] **Step 1: Render successful conversion state**

```js
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
          <span>${label}</span>
          <code>${value}</code>
          <button class="ghost-btn color-copy-btn" data-copy-value="${value}">复制</button>
        </div>
      `,
    )
    .join("");
}
```

- [ ] **Step 2: Render empty and error states**

```js
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
```

### Task 6: Add color converter controller

**Files:**
- Create: `src/tools/color-converter/index.js`

- [ ] **Step 1: Create metadata and lifecycle**

```js
import * as dom from "../../shared/dom-cache.js";
import { debounce } from "../../shared/format.js";
import { convertColor } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "color-converter",
  route: "#color-converter",
  title: "颜色格式转换",
  kicker: "Color Converter",
  description: "将 HEX、RGB、HSL 颜色互转，并展示实时预览与复制结果。",
};

let debouncedConvert;

export function init() {
  debouncedConvert = debounce(runConvert, 200);
  bindEvents();
  render.renderColorEmpty(dom.colorConverter.preview, dom.colorConverter.formats, dom.colorConverter.error);
}

export function destroy() {}
```

- [ ] **Step 2: Bind convert and copy events**

```js
function bindEvents() {
  dom.colorConverter.input.addEventListener("input", () => debouncedConvert());
  dom.colorConverter.convertBtn.addEventListener("click", runConvert);

  dom.colorConverter.formats.addEventListener("click", async (event) => {
    const btn = event.target.closest("[data-copy-value]");
    if (!btn) return;
    await navigator.clipboard.writeText(btn.dataset.copyValue).catch(() => {});
  });
}
```

- [ ] **Step 3: Implement conversion flow**

```js
function runConvert() {
  const result = convertColor(dom.colorConverter.input.value);
  if (result.error) {
    render.renderColorError(result.error, dom.colorConverter.preview, dom.colorConverter.formats, dom.colorConverter.error);
    return;
  }
  render.renderColorResult(result, dom.colorConverter.preview, dom.colorConverter.formats, dom.colorConverter.error);
}
```

### Task 7: Integrate both tools into HTML, DOM cache, router, registry

**Files:**
- Modify: `index.html`
- Modify: `src/shared/dom-cache.js`
- Modify: `src/core/router.js`
- Modify: `src/core/registry.js`

- [ ] **Step 1: Add nav tabs and home cards in `index.html`**

```html
<a class="tool-tab" href="#cron-parser" data-view-link="cron-parser">Cron 解析</a>
<a class="tool-tab" href="#color-converter" data-view-link="color-converter">颜色转换</a>
```

```html
<a class="tool-card" href="#cron-parser" data-view-link="cron-parser">
  <span class="tool-card-kicker">Cron Parser</span>
  <strong>Cron 解析器</strong>
  <p>解析 5 段 Cron 表达式，输出字段拆解和中文自然语言说明。</p>
</a>
<a class="tool-card" href="#color-converter" data-view-link="color-converter">
  <span class="tool-card-kicker">Color Converter</span>
  <strong>颜色格式转换</strong>
  <p>HEX / RGB / HSL 互转，实时预览颜色并复制任意格式结果。</p>
</a>
```

- [ ] **Step 2: Add both tool views in `index.html`**

```html
<main id="cronParserView" class="layout tool-view hidden">
  <!-- Cron parser sections -->
</main>

<main id="colorConverterView" class="layout tool-view hidden">
  <!-- Color converter sections -->
</main>
```

- [ ] **Step 3: Add lazy DOM cache namespaces**

```js
export const cronParser = lazyNS(() => ({
  view: document.querySelector("#cronParserView"),
  input: document.querySelector("#cronInput"),
  parseBtn: document.querySelector("#cronParseBtn"),
  examples: document.querySelector("#cronExamples"),
  summary: document.querySelector("#cronSummary"),
  fields: document.querySelector("#cronFields"),
  error: document.querySelector("#cronError"),
}));

export const colorConverter = lazyNS(() => ({
  view: document.querySelector("#colorConverterView"),
  input: document.querySelector("#colorConverterInput"),
  convertBtn: document.querySelector("#colorConvertBtn"),
  preview: document.querySelector("#colorConverterPreview"),
  formats: document.querySelector("#colorConverterFormats"),
  error: document.querySelector("#colorConverterError"),
}));
```

- [ ] **Step 4: Register router importers and view map**

```js
"cron-parser": () => import("../tools/cron-parser/index.js"),
"color-converter": () => import("../tools/color-converter/index.js"),
```

```js
"cron-parser": "cronParserView",
"color-converter": "colorConverterView",
```

- [ ] **Step 5: Register tool metadata in registry**

```js
import { meta as cronParser } from "../tools/cron-parser/index.js";
import { meta as colorConverter } from "../tools/color-converter/index.js";

export const tools = [
  speedTest,
  colorPalette,
  promptTemplates,
  textChunker,
  textDiffer,
  tokenCalculator,
  jsonFormatter,
  regexTester,
  encodingConverter,
  timestampConverter,
  cronParser,
  colorConverter,
];
```

### Task 8: Add responsive styles for both tools

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add Cron parser layout styles**

```css
.cron-toolbar,
.color-converter-toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.cron-summary-card {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(14, 124, 102, 0.08);
  color: var(--primary-strong);
  font-weight: 600;
}

.cron-fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.cron-field-card {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: rgba(255,255,255,.76);
  padding: 12px 14px;
}
```

- [ ] **Step 2: Add color converter preview and result styles**

```css
.color-converter-layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 16px;
}

.color-converter-swatch {
  height: 140px;
  border-radius: 16px;
  background: var(--swatch);
  border: 1px solid rgba(22,32,43,.08);
}

.color-format-card {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  background: rgba(255,255,255,.8);
}
```

- [ ] **Step 3: Add mobile responsive rules**

```css
@media (max-width: 900px) {
  .cron-fields-grid,
  .color-converter-layout {
    grid-template-columns: 1fr;
  }

  .color-format-card {
    grid-template-columns: 1fr;
  }
}
```

### Task 9: Manual verification

**Files:**
- Verify in browser: `index.html`

- [ ] **Step 1: Start local preview**

Run: `node server.js`
Expected: local preview URL is printed and homepage opens successfully.

- [ ] **Step 2: Verify Cron parser flows**

Manual checks:
- Open `#cron-parser`
- Enter `0 9 * * 1-5`
- Expect readable summary like “每周一到周五 09:00 执行一次”
- Expect 5 field cards rendered
- Enter invalid input like `70 9 * * *`
- Expect visible error box with range message

- [ ] **Step 3: Verify color converter flows**

Manual checks:
- Open `#color-converter`
- Enter `#0E7C66`
- Expect preview swatch and 4 formatted outputs
- Enter `rgb(14, 124, 102)`
- Expect identical HEX/HSL values
- Enter invalid text
- Expect visible error box and no stale format rows

- [ ] **Step 4: Verify homepage integration**

Manual checks:
- Home grid includes both new cards
- Top nav includes both new tabs
- Route switching works repeatedly without duplicate listeners or broken layout
