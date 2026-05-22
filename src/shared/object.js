export function deepMerge(baseValue, overrideValue) {
  if (!isPlainObject(baseValue) || !isPlainObject(overrideValue)) {
    return overrideValue ?? baseValue;
  }

  const merged = { ...baseValue };
  for (const [key, value] of Object.entries(overrideValue)) {
    merged[key] =
      isPlainObject(value) && isPlainObject(baseValue[key])
        ? deepMerge(baseValue[key], value)
        : value;
  }
  return merged;
}

export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseJsonObject(text, fieldName) {
  if (!text) {
    return {};
  }
  try {
    const parsed = JSON.parse(text);
    if (!isPlainObject(parsed)) {
      throw new Error("必须是 JSON 对象");
    }
    return parsed;
  } catch (error) {
    throw new Error(`${fieldName} JSON 解析失败：${error.message}`);
  }
}
