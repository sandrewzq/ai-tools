const HEX = "0123456789abcdef";

// RFC 9562 UUID v4
function randomHex(size) {
  const buf = new Uint8Array(size);
  crypto.getRandomValues(buf);
  return Array.from(buf, b => b.toString(16).padStart(2, "0")).join("");
}

export function generateV4() {
  const hex = randomHex(16);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    "4" + hex.slice(13, 16),
    (8 + Number.parseInt(hex[16], 16) % 4).toString(16) + hex.slice(17, 20),
    hex.slice(20),
  ].join("-");
}

// UUID v7 — Unix ms timestamp + random
export function generateV7() {
  const ms = Date.now().toString(16).padStart(12, "0");
  const rand = randomHex(10);
  return [
    ms.slice(0, 8),
    ms.slice(8, 12),
    "7" + rand.slice(0, 3),
    (8 + Number.parseInt(rand[3], 16) % 4).toString(16) + rand.slice(4, 7),
    rand.slice(7),
  ].join("-");
}

export function formatUuid(uuid, noHyphens, uppercase) {
  let result = noHyphens ? uuid.replace(/-/g, "") : uuid;
  return uppercase ? result.toUpperCase() : result;
}

export function generateBatch(count, version, noHyphens, uppercase) {
  const gen = version === "v7" ? generateV7 : generateV4;
  const uuids = [];
  for (let i = 0; i < count; i++) {
    uuids.push(formatUuid(gen(), noHyphens, uppercase));
  }
  return uuids;
}
