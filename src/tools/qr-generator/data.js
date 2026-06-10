// 二维码生成器 - 纯前端 Canvas 实现

const ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

// 版本 → (总码字数, ECC码字数, 分组信息)
// 仅支持版本 1-10, EC level M (约 15% 纠错)
const VERSION_INFO = [
  null,
  { total: 26, ecc: 10, blocks: 1, groups: [{ blocks: 1, data: 16 }] },
  { total: 44, ecc: 16, blocks: 1, groups: [{ blocks: 1, data: 28 }] },
  { total: 70, ecc: 26, blocks: 1, groups: [{ blocks: 1, data: 44 }] },
  { total: 100, ecc: 36, blocks: 1, groups: [{ blocks: 1, data: 64 }] },
  { total: 134, ecc: 48, blocks: 1, groups: [{ blocks: 1, data: 86 }] },
  { total: 172, ecc: 64, blocks: 1, groups: [{ blocks: 1, data: 108 }] },
  { total: 196, ecc: 72, blocks: 1, groups: [{ blocks: 1, data: 124 }] },
  { total: 242, ecc: 88, blocks: 2, groups: [{ blocks: 2, data: 77 }] },
  { total: 292, ecc: 110, blocks: 2, groups: [{ blocks: 2, data: 91 }] },
  { total: 346, ecc: 130, blocks: 3, groups: [{ blocks: 2, data: 72 }, { blocks: 1, data: 73 }] },
];

// 对齐图案位置
const ALIGNMENT_POS = [
  null, [], [6, 18], [6, 22], [6, 26], [6, 30],
  [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];

export function generateQR(text) {
  if (!text.trim()) return { error: "请输入文本或 URL" };

  // 选择版本
  const version = chooseVersion(text);
  if (!version) return { error: "文本过长，请缩短" };

  // 数据编码
  const dataBits = encodeData(text, version);
  if (!dataBits) return { error: "数据编码失败" };

  // 错误纠正
  const eccWords = generateECC(dataBits, VERSION_INFO[version].ecc);

  // 组装最终数据
  const finalData = [...dataBits, ...eccWords];

  // 生成模块矩阵
  const size = version * 4 + 17;
  const matrix = buildMatrix(size, version, finalData);

  // 应用掩码并选择最优
  const bestMask = chooseBestMask(matrix, size);
  const finalMatrix = applyMask(bestMask.matrix, bestMask.mask, size);

  // 添加格式信息
  addFormatInfo(finalMatrix, size, bestMask.mask);

  return { error: null, matrix: finalMatrix, size, version };
}

function chooseVersion(text) {
  // 字节模式：每字节 8 位 + mode(4) + count(8) + terminator(4)
  const bytes = new TextEncoder().encode(text).length;
  const bits = bytes * 8 + 4 + 8 + 4;
  for (let v = 1; v <= 10; v++) {
    if (bits <= VERSION_INFO[v].total * 8) return v;
  }
  return null;
}

function encodeData(text, version) {
  const bytes = new TextEncoder().encode(text);
  const info = VERSION_INFO[version];
  const targetBits = info.total * 8;

  const bits = [];
  // Mode: 0100 (byte)
  pushBits(bits, 4, 4);
  // Count (8 bits for version 1-9)
  pushBits(bits, bytes.length, 8);
  // Data
  for (const b of bytes) pushBits(bits, b, 8);
  // Terminator (up to 4 zeros)
  const termLen = Math.min(4, targetBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);
  // Pad to byte
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad with 0xEC and 0x11
  while (bits.length < targetBits) {
    pushBits(bits, 0xEC, 8);
    if (bits.length < targetBits) pushBits(bits, 0x11, 8);
  }

  // Convert to bytes
  const result = [];
  for (let i = 0; i < bits.length; i += 8) {
    let val = 0;
    for (let j = 0; j < 8; j++) val = (val << 1) | bits[i + j];
    result.push(val);
  }
  return result;
}

function pushBits(arr, value, count) {
  for (let i = count - 1; i >= 0; i--) {
    arr.push((value >> i) & 1);
  }
}

// Reed-Solomon ECC (Galois Field 256)
function generateECC(data, eccCount) {
  const gfExp = new Array(512);
  const gfLog = new Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    gfExp[i] = x;
    gfLog[x] = i;
    x <<= 1;
    if (x & 256) x ^= 285; // primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
  }
  for (let i = 255; i < 512; i++) gfExp[i] = gfExp[i - 255];

  // Generator polynomial
  const gen = [1];
  for (let i = 0; i < eccCount; i++) {
    gen.push(0);
    for (let j = gen.length - 1; j > 0; j--) {
      if (gen[j - 1] !== 0) {
        gen[j] ^= gfExp[(gfLog[gen[j - 1]] + i) % 255];
      } else {
        gen[j] = 0;
      }
    }
  }

  // Message polynomial
  const msg = new Array(data.length + eccCount).fill(0);
  for (let i = 0; i < data.length; i++) msg[i] = data[i];

  // Division
  for (let i = 0; i < data.length; i++) {
    const factor = gfLog[msg[i]];
    if (factor !== undefined) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfExp[(gen[j] + factor) % 255];
      }
    }
  }

  return msg.slice(data.length);
}

function buildMatrix(size, version, data) {
  const matrix = Array.from({ length: size }, () => new Array(size).fill(-1));

  // 定位图案
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, size - 7, 0);
  addFinderPattern(matrix, 0, size - 7);

  // 时序图案
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = matrix[i][6] = (i % 2 === 0 ? 1 : 0);
  }

  // 对齐图案
  const aps = ALIGNMENT_POS[version];
  for (const row of aps) {
    for (const col of aps) {
      if (matrix[row][col] === -1) addAlignmentPattern(matrix, row, col);
    }
  }

  // 格式信息预留（先标记为 -2 避免被数据覆盖）
  for (let i = 0; i < 9; i++) {
    if (matrix[i][8] === -1) matrix[i][8] = -2;
    if (matrix[8][i] === -1) matrix[8][i] = -2;
    if (matrix[size - 1 - i][8] === -1) matrix[size - 1 - i][8] = -2;
  }
  // 暗模块
  matrix[size - 8][8] = 1;

  // 放置数据
  let bitIndex = 0;
  let goingUp = true;
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5; // 跳过时序图案列
    for (let i = 0; i < size; i++) {
      const row = goingUp ? size - 1 - i : i;
      for (let c = col; c >= col - 1 && c >= 0; c--) {
        if (matrix[row][c] === -1 && bitIndex < data.length * 8) {
          const byteIdx = Math.floor(bitIndex / 8);
          const bitPos = 7 - (bitIndex % 8);
          matrix[row][c] = (data[byteIdx] >> bitPos) & 1;
          bitIndex++;
        }
      }
    }
    goingUp = !goingUp;
  }

  return matrix;
}

function addFinderPattern(matrix, row, col) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      if (row + r < 0 || col + c < 0 || row + r >= matrix.length || col + c >= matrix.length) continue;
      if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
        matrix[row + r][col + c] = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) ? 1 : 0;
      } else {
        matrix[row + r][col + c] = 0;
      }
    }
  }
}

function addAlignmentPattern(matrix, row, col) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = row + r;
      const cc = col + c;
      if (rr < 0 || cc < 0 || rr >= matrix.length || cc >= matrix.length) continue;
      matrix[rr][cc] = (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) ? 1 : 0;
    }
  }
}

function chooseBestMask(matrix, size) {
  let bestScore = Infinity;
  let bestResult = null;

  for (let mask = 0; mask < 8; mask++) {
    const m = applyMask(matrix, mask, size);
    const score = evaluateMask(m, size);
    if (score < bestScore) {
      bestScore = score;
      bestResult = { matrix: matrix, mask, score };
    }
  }
  return bestResult;
}

function applyMask(matrix, mask, size) {
  const result = Array.from({ length: size }, (_, r) => [...matrix[r]]);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (result[r][c] < 0) continue;
      let invert = false;
      switch (mask) {
        case 0: invert = (r + c) % 2 === 0; break;
        case 1: invert = r % 2 === 0; break;
        case 2: invert = c % 3 === 0; break;
        case 3: invert = (r + c) % 3 === 0; break;
        case 4: invert = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
        case 5: invert = (r * c) % 2 + (r * c) % 3 === 0; break;
        case 6: invert = ((r * c) % 2 + (r * c) % 3) % 2 === 0; break;
        case 7: invert = ((r + c) % 2 + (r * c) % 3) % 2 === 0; break;
      }
      if (invert) result[r][c] ^= 1;
    }
  }
  return result;
}

function evaluateMask(matrix, size) {
  let score = 0;

  // 连续同色行
  for (let r = 0; r < size; r++) {
    let run = 0;
    let last = -1;
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === last) {
        run++;
        if (run === 5) score += 3;
        else if (run > 5) score++;
      } else {
        run = 1;
        last = matrix[r][c];
      }
    }
  }
  // 列
  for (let c = 0; c < size; c++) {
    let run = 0;
    let last = -1;
    for (let r = 0; r < size; r++) {
      if (matrix[r][c] === last) {
        run++;
        if (run === 5) score += 3;
        else if (run > 5) score++;
      } else {
        run = 1;
        last = matrix[r][c];
      }
    }
  }

  // 2x2 同色块
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      if (matrix[r][c] === matrix[r + 1][c] && matrix[r][c] === matrix[r][c + 1] && matrix[r][c] === matrix[r + 1][c + 1]) {
        score += 3;
      }
    }
  }

  return score;
}

// 格式信息 (EC level M + mask)
function addFormatInfo(matrix, size, mask) {
  // format: EC level M (00) + mask pattern (3 bits)
  const format = (0 << 3) | mask; // EC Level M = 0
  let data = format << 10;
  // BCH(15,5) encoding
  let gen = 0x537; // 10100110111
  let msg = format << 10;
  for (let i = 4; i >= 0; i--) {
    if (msg & (1 << (i + 10))) {
      msg ^= gen << i;
    }
  }
  data = (format << 10) | (msg & 0x3FF);
  data ^= 0x5412; // XOR mask

  // Place format bits
  const positions = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  ];

  for (let i = 0; i < 15; i++) {
    const [r, c] = positions[i];
    const bit = (data >> (14 - i)) & 1;
    if (matrix[r]?.[c] === -2 || matrix[r]?.[c] === -1 || matrix[r]?.[c] === 0 || matrix[r]?.[c] === 1) {
      matrix[r][c] = bit;
    }
  }

  // Mirror positions (bottom-right version info)
  for (let i = 0; i < 8; i++) {
    if (matrix[size - 1 - i]?.[8] === -2) matrix[size - 1 - i][8] = (data >> (14 - i)) & 1;
  }
  for (let i = 0; i < 7; i++) {
    if (matrix[8]?.[size - 7 + i] === -2) matrix[8][size - 7 + i] = (data >> i) & 1;
  }
  // Top-right bit
  if (matrix[size - 8]?.[8] === -2) matrix[size - 8][8] = data & 1;
}

export function drawQR(canvas, matrix, size, moduleSize = 8) {
  const padding = moduleSize * 4;
  const totalSize = size * moduleSize + padding * 2;
  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, totalSize, totalSize);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r]?.[c] === 1) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(padding + c * moduleSize, padding + r * moduleSize, moduleSize, moduleSize);
      }
    }
  }

  return { totalSize, padding };
}
