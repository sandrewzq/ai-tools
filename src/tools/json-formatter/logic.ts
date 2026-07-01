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
