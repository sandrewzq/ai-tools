export function deepMerge<T>(baseValue: T, overrideValue: unknown): T {
  if (!isPlainObject(baseValue) || !isPlainObject(overrideValue)) {
    return (overrideValue ?? baseValue) as T;
  }

  const merged: Record<string, unknown> = { ...baseValue };
  for (const [key, value] of Object.entries(overrideValue)) {
    merged[key] =
      isPlainObject(value) && isPlainObject(merged[key])
        ? deepMerge(merged[key], value)
        : value;
  }
  return merged as T;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseJsonObject(text: string, fieldName: string) {
  if (!text.trim()) return {};
  try {
    const parsed = JSON.parse(text);
    if (!isPlainObject(parsed)) {
      throw new Error("必须是 JSON 对象");
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${fieldName} JSON 解析失败：${message}`);
  }
}
