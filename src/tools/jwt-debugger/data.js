/**
 * JWT 在线调试器 — 解码、校验
 * 纯前端实现，密钥仅在浏览器中处理
 */

export function decodeBase64Url(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  try {
    return decodeURIComponent(atob(padded).split("").map(c =>
      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(""));
  } catch {
    return atob(padded);
  }
}

export function parseJwt(token) {
  const trimmed = token.trim();
  if (!trimmed) return { error: "请输入 JWT Token" };

  const parts = trimmed.split(".");
  if (parts.length !== 3) return { error: "JWT 格式无效（应为 header.payload.signature 三段）" };

  const [headerB64, payloadB64, signature] = parts;

  try {
    const headerJson = decodeBase64Url(headerB64);
    const payloadJson = decodeBase64Url(payloadB64);
    const header = JSON.parse(headerJson);
    const payload = JSON.parse(payloadJson);

    return {
      header,
      payload,
      headerRaw: headerJson,
      payloadRaw: payloadJson,
      signature,
      headerB64,
      payloadB64,
      alg: header.alg || "HS256",
    };
  } catch (e) {
    return { error: `解码失败：${e.message}` };
  }
}

export async function verifySignature(headerB64, payloadB64, signature, secret, alg = "HS256") {
  if (!secret) return { verified: false, reason: "未提供密钥" };

  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);

  try {
    if (alg === "HS256") {
      const key = await crypto.subtle.importKey(
        "raw", encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false, ["verify"]
      );
      const sigBytes = base64UrlToBytes(signature);
      const valid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
      return { verified: valid };
    }
    if (alg === "HS384") {
      const key = await crypto.subtle.importKey(
        "raw", encoder.encode(secret),
        { name: "HMAC", hash: "SHA-384" },
        false, ["verify"]
      );
      const sigBytes = base64UrlToBytes(signature);
      const valid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
      return { verified: valid };
    }
    if (alg === "HS512") {
      const key = await crypto.subtle.importKey(
        "raw", encoder.encode(secret),
        { name: "HMAC", hash: "SHA-512" },
        false, ["verify"]
      );
      const sigBytes = base64UrlToBytes(signature);
      const valid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
      return { verified: valid };
    }
    return { verified: false, reason: `不支持的算法：${alg}` };
  } catch (e) {
    return { verified: false, reason: `验证失败：${e.message}` };
  }
}

function base64UrlToBytes(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}
