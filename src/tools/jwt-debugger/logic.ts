export function decodeBase64Url(str: string) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  try {
    return decodeURIComponent(atob(padded).split("").map((char) => `%${("00" + char.charCodeAt(0).toString(16)).slice(-2)}`).join(""));
  } catch {
    return atob(padded);
  }
}

export function parseJwt(token: string) {
  const trimmed = token.trim();
  if (!trimmed) return { error: "请输入 JWT Token" };
  const parts = trimmed.split(".");
  if (parts.length !== 3) return { error: "JWT 格式无效，应为 header.payload.signature 三段" };
  const [headerB64, payloadB64, signature] = parts;
  try {
    const headerRaw = decodeBase64Url(headerB64);
    const payloadRaw = decodeBase64Url(payloadB64);
    const header = JSON.parse(headerRaw);
    const payload = JSON.parse(payloadRaw);
    return { header, payload, headerRaw, payloadRaw, signature, headerB64, payloadB64, alg: header.alg || "HS256" };
  } catch (error) {
    return { error: `解码失败：${error instanceof Error ? error.message : String(error)}` };
  }
}

function base64UrlToBytes(str: string) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export async function verifySignature(headerB64: string, payloadB64: string, signature: string, secret: string, alg = "HS256") {
  if (!secret) return { verified: false, reason: "未提供密钥" };
  const hashMap: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };
  const hash = hashMap[alg];
  if (!hash) return { verified: false, reason: `不支持的算法：${alg}` };
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlToBytes(signature), encoder.encode(`${headerB64}.${payloadB64}`));
    return { verified: valid };
  } catch (error) {
    return { verified: false, reason: `验证失败：${error instanceof Error ? error.message : String(error)}` };
  }
}
