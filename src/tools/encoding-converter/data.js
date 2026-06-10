// 编码转换核心逻辑

export function base64Encode(text) {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (e) {
    throw new Error("Base64 编码失败: " + e.message);
  }
}

export function base64Decode(text) {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch (e) {
    throw new Error("Base64 解码失败: 输入可能不是合法的 Base64 字符串");
  }
}

export function urlEncode(text) {
  try {
    return encodeURIComponent(text);
  } catch (e) {
    throw new Error("URL 编码失败: " + e.message);
  }
}

export function urlDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    throw new Error("URL 解码失败: " + e.message);
  }
}

export function htmlEncode(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function htmlDecode(text) {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

export function unicodeEscape(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 127) {
      result += "\\u" + code.toString(16).padStart(4, "0");
    } else {
      result += text[i];
    }
  }
  return result;
}

export function unicodeUnescape(text) {
  return text.replace(/\\u[0-9a-fA-F]{4}/g, (match) =>
    String.fromCharCode(parseInt(match.slice(2), 16)),
  );
}
