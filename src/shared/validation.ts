export function parsePositiveInt(value: string, fieldName: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} 必须是大于 0 的整数。`);
  }
  return parsed;
}

export function parseNonNegativeInt(value: string, fieldName: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} 必须是大于等于 0 的整数。`);
  }
  return parsed;
}

export function parseFloatOrThrow(value: string, fieldName: string) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} 必须是数字。`);
  }
  return parsed;
}

export function normalizeErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "请求已停止";
  }
  if (error instanceof TypeError) {
    return "请求失败，可能是跨域限制、网络异常，或接口地址不可达。";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export async function safeReadText(response: Response) {
  try {
    const text = await response.text();
    return text.slice(0, 300);
  } catch {
    return "";
  }
}
