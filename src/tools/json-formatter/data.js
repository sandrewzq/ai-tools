// JSON 格式化/压缩/校验/分析

export function formatJson(input, indent = 2) {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, indent);
}

export function compressJson(input) {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

export function validateJson(input) {
  try {
    const parsed = JSON.parse(input);
    return { valid: true, parsed, error: null };
  } catch (e) {
    return { valid: false, parsed: null, error: e.message };
  }
}

// 分析 JSON 结构
export function analyzeJson(parsed) {
  const stats = {
    type: Array.isArray(parsed) ? "array" : typeof parsed === "object" ? "object" : "value",
    depth: 0,
    keys: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
  };

  function walk(node, depth) {
    stats.depth = Math.max(stats.depth, depth);
    if (Array.isArray(node)) {
      stats.arrays++;
      for (const item of node) walk(item, depth + 1);
    } else if (node !== null && typeof node === "object") {
      stats.keys += Object.keys(node).length;
      for (const val of Object.values(node)) walk(val, depth + 1);
    } else if (typeof node === "string") {
      stats.strings++;
    } else if (typeof node === "number") {
      stats.numbers++;
    } else if (typeof node === "boolean") {
      stats.booleans++;
    } else if (node === null) {
      stats.nulls++;
    }
  }

  walk(parsed, 0);
  return stats;
}

// 生成语法高亮的 HTML（树形可折叠）
export function renderJsonTree(parsed, indent = 2) {
  const lines = [];
  const stack = [];

  const parts = JSON.stringify(parsed, null, indent).split("\n");

  for (const line of parts) {
    const trimmed = line.trim();
    const depth = (line.length - line.trimStart().length) / indent;

    // 检测键名
    let html = "";
    const keyMatch = trimmed.match(/^"([^"]+)"\s*:/);
    if (keyMatch) {
      const key = keyMatch[0];
      const rest = trimmed.slice(key.length);
      html += `<span class="json-key">${escapeHtml(key.slice(0, -1))}</span>:`;
      html += renderValue(rest);
    } else {
      html += renderValue(trimmed);
    }

    // 检测折叠标记：行尾是 { 或 [ 表示可折叠
    const collapsible = /[{\[]\s*$/.test(trimmed);
    const indentHtml = "<span class=\"json-indent\"></span>".repeat(depth);

    if (collapsible) {
      const id = "jf-" + lines.length;
      lines.push(
        `<div class="json-line json-collapsible" data-depth="${depth}">` +
        `${indentHtml}<span class="json-toggle" data-target="${id}">▼</span>${html}`,
      );
      stack.push({ id, depth });
    } else if (/[}\]]\s*,?\s*$/.test(trimmed)) {
      // 闭合行
      lines.push(
        `<div class="json-line json-close" data-depth="${depth}">${indentHtml}${html}</div>`,
      );
      // 结束最近的折叠块
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].depth === depth) {
          stack.splice(i, 1);
          lines.push("</div>");
          break;
        }
      }
    } else {
      lines.push(
        `<div class="json-line" data-depth="${depth}">${indentHtml}${html}</div>`,
      );
    }
  }

  // 关闭所有未关闭的块
  for (let i = stack.length - 1; i >= 0; i--) {
    lines.push("</div>");
  }

  return lines.join("\n");
}

function renderValue(text) {
  const trimmed = text.trim();
  if (/^"/.test(trimmed)) {
    return `<span class="json-string">${escapeHtml(text)}</span>`;
  }
  if (/^-?\d+\.?\d*(?:[eE][+-]?\d+)?/.test(trimmed)) {
    return `<span class="json-number">${escapeHtml(text)}</span>`;
  }
  if (/^(true|false)/.test(trimmed)) {
    return `<span class="json-boolean">${escapeHtml(text)}</span>`;
  }
  if (/^null/.test(trimmed)) {
    return `<span class="json-null">${escapeHtml(text)}</span>`;
  }
  return escapeHtml(text);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
