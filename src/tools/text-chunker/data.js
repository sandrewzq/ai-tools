export const SPLIT_MODES = [
  { key: "char", label: "按字符" },
  { key: "paragraph", label: "按段落" },
  { key: "heading", label: "按 Markdown 标题" },
];

export const DEFAULTS = {
  chunkSize: 1000,
  overlap: 200,
  splitMode: "char",
};

// 粗略 token 估算：中文约 1 字 ≈ 1.5 tokens，英文约 1 词 ≈ 1.3 tokens
export function estimateTokens(text) {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const others = text.length - chineseChars - englishWords;
  return Math.max(1, Math.round(chineseChars * 1.5 + englishWords * 1.3 + others * 0.5));
}

// 按段落分割（空行作为段落分隔）
function splitByParagraph(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// 按 Markdown 标题分割
function splitByHeading(text) {
  const sections = [];
  const lines = text.split("\n");
  let currentSection = "";

  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) {
      if (currentSection.trim()) {
        sections.push(currentSection.trim());
      }
      currentSection = line;
    } else {
      currentSection += "\n" + line;
    }
  }
  if (currentSection.trim()) {
    sections.push(currentSection.trim());
  }
  return sections;
}

export function chunkText(text, mode, size, overlap) {
  // 预处理
  let segments = [];
  if (mode === "paragraph") {
    segments = splitByParagraph(text);
  } else if (mode === "heading") {
    segments = splitByHeading(text);
  }

  if (segments.length > 0) {
    // 段落/标题模式下，合并过短的段落
    return mergeSegments(segments, size, overlap);
  }

  // 字符模式
  return chunkByChar(text, size, overlap);
}

function chunkByChar(text, size, overlap) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    start += size - overlap;
    if (end >= text.length) break;
  }
  return chunks;
}

function mergeSegments(segments, size, overlap) {
  const chunks = [];
  let current = "";

  for (let i = 0; i < segments.length; i++) {
    const combined = current ? current + "\n\n" + segments[i] : segments[i];

    if (combined.length > size && current.length > 0) {
      chunks.push(current);
      // 重叠：保留上一块的尾部
      const overlapText = current.length > overlap ? current.slice(-overlap) : current;
      current = overlapText + "\n\n" + segments[i];
    } else {
      current = combined;
    }
  }

  if (current.trim()) {
    chunks.push(current);
  }

  return chunks;
}
