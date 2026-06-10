// 模型配置与 token 估算算法（价格单位：$/1K tokens）
export const MODELS = [
  // OpenAI
  {
    id: "gpt-54",
    name: "GPT-5.4",
    encoder: "o200k_base",
    priceInput: 0.0025,
    priceOutput: 0.015,
  },
  {
    id: "gpt-54-mini",
    name: "GPT-5.4 mini",
    encoder: "o200k_base",
    priceInput: 0.00075,
    priceOutput: 0.0045,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    encoder: "o200k_base",
    priceInput: 0.0025,
    priceOutput: 0.01,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o-mini",
    encoder: "o200k_base",
    priceInput: 0.00015,
    priceOutput: 0.0006,
  },
  {
    id: "o3",
    name: "o3",
    encoder: "o200k_base",
    priceInput: 0.002,
    priceOutput: 0.008,
  },
  // Anthropic
  {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    encoder: "—",
    priceInput: 0.01,
    priceOutput: 0.05,
  },
  {
    id: "claude-opus-46",
    name: "Claude Opus 4.6",
    encoder: "—",
    priceInput: 0.005,
    priceOutput: 0.025,
  },
  {
    id: "claude-sonnet-46",
    name: "Claude Sonnet 4.6",
    encoder: "—",
    priceInput: 0.003,
    priceOutput: 0.015,
  },
];

// 启发式 token 估算（纯前端，零依赖）
export function estimateTokens(text) {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) || []).length;
  const matchLen = (text.match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) || []).reduce((sum, w) => sum + w.length, 0);
  const others = text.length - chineseChars - matchLen;
  return Math.max(1, Math.round(chineseChars * 1.5 + englishWords * 1.3 + others * 0.5));
}

// 文本统计
export function getTextStats(text) {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) || []).length;
  return {
    chars: text.length,
    chineseChars,
    englishWords,
  };
}
