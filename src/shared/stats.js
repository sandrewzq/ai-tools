export function average(values) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) {
    return null;
  }
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

export function percentile(values, p) {
  const filtered = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!filtered.length) {
    return null;
  }
  if (filtered.length === 1) {
    return filtered[0];
  }
  const index = (filtered.length - 1) * (p / 100);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return filtered[lower];
  }
  return filtered[lower] + (filtered[upper] - filtered[lower]) * (index - lower);
}

export function numericSort(a, b) {
  const safeA = Number.isFinite(a) ? a : -Infinity;
  const safeB = Number.isFinite(b) ? b : -Infinity;
  return safeA - safeB;
}

export function roughTokenEstimate(text) {
  if (!text) {
    return 0;
  }
  const cjkCount = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const otherCount = text.length - cjkCount;
  return Math.max(1, Math.ceil(cjkCount * 1.1 + otherCount / 4));
}
