function randomHex(size: number) {
  const buf = new Uint8Array(size);
  crypto.getRandomValues(buf);
  return Array.from(buf, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateV4() {
  const hex = randomHex(16);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${(8 + (Number.parseInt(hex[16], 16) % 4)).toString(16)}${hex.slice(17, 20)}`,
    hex.slice(20),
  ].join("-");
}

export function generateV7() {
  const ms = Date.now().toString(16).padStart(12, "0");
  const rand = randomHex(10);
  return [
    ms.slice(0, 8),
    ms.slice(8, 12),
    `7${rand.slice(0, 3)}`,
    `${(8 + (Number.parseInt(rand[3], 16) % 4)).toString(16)}${rand.slice(4, 7)}`,
    rand.slice(7),
  ].join("-");
}

export function formatUuid(uuid: string, noHyphens: boolean, uppercase: boolean) {
  const result = noHyphens ? uuid.replace(/-/g, "") : uuid;
  return uppercase ? result.toUpperCase() : result;
}

export function generateBatch(count: number, version: "v4" | "v7", noHyphens: boolean, uppercase: boolean) {
  const generate = version === "v7" ? generateV7 : generateV4;
  return Array.from({ length: Math.max(1, Math.min(count, 100)) }, () => formatUuid(generate(), noHyphens, uppercase));
}
