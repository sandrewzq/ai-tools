export function base64Encode(text: string) {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (error) {
    throw new Error(`Base64 编码失败：${error instanceof Error ? error.message : String(error)}`);
  }
}

export function base64Decode(text: string) {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch {
    throw new Error("Base64 解码失败：输入可能不是合法的 Base64 字符串");
  }
}

export function urlEncode(text: string) {
  return encodeURIComponent(text);
}

export function urlDecode(text: string) {
  return decodeURIComponent(text);
}

export function htmlEncode(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function htmlDecode(text: string) {
  const element = document.createElement("textarea");
  element.innerHTML = text;
  return element.value;
}

export function unicodeEscape(text: string) {
  let result = "";
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    result += code > 127 ? `\\u${code.toString(16).padStart(4, "0")}` : text[i];
  }
  return result;
}

export function unicodeUnescape(text: string) {
  return text.replace(/\\u[0-9a-fA-F]{4}/g, (match) => String.fromCharCode(Number.parseInt(match.slice(2), 16)));
}
