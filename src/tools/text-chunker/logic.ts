export const SPLIT_MODES = [
  { key: "char", label: "按字符" },
  { key: "paragraph", label: "按段落" },
  { key: "heading", label: "按 Markdown 标题" },
] as const;

export type SplitMode = (typeof SPLIT_MODES)[number]["key"];

export const DEFAULTS = {
  chunkSize: 1000,
  overlap: 200,
  splitMode: "char" as SplitMode,
};

export function estimateTokens(text: string) {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) || []).length;
  const others = text.length - chineseChars - englishWords;
  return Math.max(1, Math.round(chineseChars * 1.5 + englishWords * 1.3 + others * 0.5));
}

export function chunkText(text: string, mode: SplitMode, size: number, overlap: number) {
  let segments: string[] = [];
  if (mode === "paragraph") segments = splitByParagraph(text);
  if (mode === "heading") segments = splitByHeading(text);
  if (segments.length > 0) return mergeSegments(segments, size, overlap);
  return chunkByChar(text, size, overlap);
}

function splitByParagraph(text: string) {
  return text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function splitByHeading(text: string) {
  const sections: string[] = [];
  const lines = text.split("\n");
  let currentSection = "";
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) {
      if (currentSection.trim()) sections.push(currentSection.trim());
      currentSection = line;
    } else {
      currentSection += `${currentSection ? "\n" : ""}${line}`;
    }
  }
  if (currentSection.trim()) sections.push(currentSection.trim());
  return sections;
}

function chunkByChar(text: string, size: number, overlap: number) {
  const step = Math.max(1, size - overlap);
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    start += step;
    if (end >= text.length) break;
  }
  return chunks;
}

function mergeSegments(segments: string[], size: number, overlap: number) {
  const chunks: string[] = [];
  let current = "";
  for (const segment of segments) {
    const combined = current ? `${current}\n\n${segment}` : segment;
    if (combined.length > size && current.length > 0) {
      chunks.push(current);
      const overlapText = current.length > overlap ? current.slice(-overlap) : current;
      current = `${overlapText}\n\n${segment}`;
    } else {
      current = combined;
    }
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}
