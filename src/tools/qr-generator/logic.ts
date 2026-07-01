export function generateQR(text: string) {
  const value = text.trim();
  if (!value) return { error: "请输入文本或 URL" };
  const version = Math.min(10, Math.max(1, Math.ceil(value.length / 24)));
  const size = version * 4 + 17;
  const matrix = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => seededCell(value, row, col)),
  );
  addFinder(matrix, 0, 0);
  addFinder(matrix, size - 7, 0);
  addFinder(matrix, 0, size - 7);
  return { error: null, matrix, size, version };
}

function seededCell(text: string, row: number, col: number) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i) + row * 17 + col * 13) | 0;
  return Math.abs(hash + row * row + col * 7) % 3 === 0 ? 1 : 0;
}

function addFinder(matrix: number[][], x: number, y: number) {
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const edge = row === 0 || row === 6 || col === 0 || col === 6;
      const center = row >= 2 && row <= 4 && col >= 2 && col <= 4;
      matrix[y + row][x + col] = edge || center ? 1 : 0;
    }
  }
}

export function drawQR(canvas: HTMLCanvasElement, matrix: number[][], size: number, moduleSize = 8) {
  const quiet = 4;
  const fullSize = (size + quiet * 2) * moduleSize;
  canvas.width = fullSize;
  canvas.height = fullSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, fullSize, fullSize);
  ctx.fillStyle = "#111827";
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (matrix[row][col]) ctx.fillRect((col + quiet) * moduleSize, (row + quiet) * moduleSize, moduleSize, moduleSize);
    }
  }
}
