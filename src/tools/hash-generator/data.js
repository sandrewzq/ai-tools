/**
 * 纯 JS MD5 实现（Web Crypto 不支持 MD5）
 * 基于 https://github.com/blueimp/JavaScript-MD5 (MIT)
 */
function md5(str) {
  function r(n, c) { return (n << c) | (n >>> (32 - c)); }
  function q(n, c) { return (n & c) ^ (~n & c); }
  function p(n, c) { return (n & c) ^ (n & ~c); }
  function s(n, c) { return (n & c) ^ ((~n | 0) & c); }
  function g(n, c) { return n ^ c; }

  const x = [];
  let i, j, k, l;
  const len = str.length;
  x[len >> 2] = x[len >> 2] | (0x80 << ((len % 4 << 3)));
  x[((len + 8 >> 6) << 4) + 14] = len * 8;

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  for (i = 0; i < x.length; i += 16) {
    const aa = a, bb = b, cc = c, dd = d;
    for (j = 0; j < 64; j++) {
      if (j < 16) { k = (b & c) | (~b & d); l = j; }
      else if (j < 32) { k = (d & b) | (~d & c); l = (5 * j + 1) % 16; }
      else if (j < 48) { k = b ^ c ^ d; l = (3 * j + 5) % 16; }
      else { k = c ^ (b | ~d); l = (7 * j) % 16; }
      const t = (a + k + (x[i + l] || 0) + [0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x2441453,0xd8a1e681,0xe7d3fbc8,0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,0x289b7ec6,0xeaa127fa,0xd4ef3085,0x4881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391][j]) | 0;
      k = r(t, [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21][j]);
      a = d; d = c; c = b; b = (b + k) | 0;
    }
    a = (a + aa) | 0; b = (b + bb) | 0; c = (c + cc) | 0; d = (d + dd) | 0;
  }
  return [a,b,c,d].map(v => ((v>>>0).toString(16).padStart(8,"0"))).join("");
}

async function sha(hash, input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const buf = await crypto.subtle.digest(hash, data);
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, "0")).join("");
}

export function hashSync(input, algo) {
  if (algo === "MD5") return md5(input);
  throw new Error("非 MD5 算法请使用 hashAsync");
}

export async function hashAsync(input, algo) {
  const map = { "SHA-1": "SHA-1", "SHA-256": "SHA-256", "SHA-512": "SHA-512" };
  if (algo === "MD5") return md5(input);
  return sha(map[algo] || "SHA-256", input);
}
