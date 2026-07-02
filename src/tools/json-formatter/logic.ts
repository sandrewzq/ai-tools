export function formatJson(input: string, indent = 2) {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, indent);
}

export function compressJson(input: string) {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

export function validateJson(input: string) {
  try {
    const parsed = JSON.parse(input);
    return { valid: true, parsed, error: null };
  } catch (error) {
    return { valid: false, parsed: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export function analyzeJson(parsed: unknown) {
  const stats = {
    type: Array.isArray(parsed) ? "array" : parsed !== null && typeof parsed === "object" ? "object" : "value",
    depth: 0,
    keys: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
  };

  function walk(node: unknown, depth: number) {
    stats.depth = Math.max(stats.depth, depth);
    if (Array.isArray(node)) {
      stats.arrays += 1;
      for (const item of node) walk(item, depth + 1);
    } else if (node !== null && typeof node === "object") {
      const record = node as Record<string, unknown>;
      stats.keys += Object.keys(record).length;
      for (const value of Object.values(record)) walk(value, depth + 1);
    } else if (typeof node === "string") {
      stats.strings += 1;
    } else if (typeof node === "number") {
      stats.numbers += 1;
    } else if (typeof node === "boolean") {
      stats.booleans += 1;
    } else if (node === null) {
      stats.nulls += 1;
    }
  }

  walk(parsed, 0);
  return stats;
}

export function renderJsonTree(parsed: unknown, indent = 2) {
  const lines: string[] = [];
  const stack: Array<{ id: string; depth: number }> = [];
  const parts = JSON.stringify(parsed, null, indent).split("\n");

  for (const line of parts) {
    const trimmed = line.trim();
    const depth = (line.length - line.trimStart().length) / indent;
    const keyMatch = trimmed.match(/^"([^"]+)"\s*:/);
    let html = "";

    if (keyMatch) {
      const key = keyMatch[0];
      const rest = trimmed.slice(key.length);
      html += `<span class="json-key">${escapeHtml(key.slice(0, -1))}</span>:`;
      html += renderValue(rest);
    } else {
      html += renderValue(trimmed);
    }

    const collapsible = /[{\[]\s*$/.test(trimmed);
    const indentHtml = '<span class="json-indent"></span>'.repeat(depth);

    if (collapsible) {
      const id = `jf-${lines.length}`;
      lines.push(
        `<div class="json-line json-collapsible" data-depth="${depth}">${indentHtml}<span class="json-toggle" data-target="${id}">▼</span>${html}`,
      );
      stack.push({ id, depth });
    } else if (/[}\]]\s*,?\s*$/.test(trimmed)) {
      lines.push(`<div class="json-line json-close" data-depth="${depth}">${indentHtml}${html}</div>`);
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        if (stack[index].depth === depth) {
          stack.splice(index, 1);
          lines.push("</div>");
          break;
        }
      }
    } else {
      lines.push(`<div class="json-line" data-depth="${depth}">${indentHtml}${html}</div>`);
    }
  }

  for (let index = stack.length - 1; index >= 0; index -= 1) {
    lines.push("</div>");
  }

  return lines.join("\n");
}

function renderValue(text: string) {
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

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
