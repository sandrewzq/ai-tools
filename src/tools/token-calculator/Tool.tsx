import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { estimateTokens, getTextStats, MODELS } from "./logic";

export default function Tool() {
  const [text, setText] = useState("这是一段用于估算 token 的文本。");
  const [modelId, setModelId] = useState(MODELS[0].id);
  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[0];
  const tokens = useMemo(() => estimateTokens(text), [text]);
  const stats = getTextStats(text);
  const inputCost = (tokens / 1000) * model.priceInput;
  const outputCost = (tokens / 1000) * model.priceOutput;

  return (
    <ToolLayout title="Token 计算" description="估算文本 token、字符、词数和成本。">
      <div className="tool-panel tool-stack">
        <select value={modelId} onChange={(event) => setModelId(event.target.value)}>{MODELS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={10} />
        <div className="stat-grid">
          <span>Tokens: {tokens}</span>
          <span>字符: {stats.chars}</span>
          <span>中文字符: {stats.chineseChars}</span>
          <span>英文词: {stats.englishWords}</span>
          <span>输入成本: ${inputCost.toFixed(6)}</span>
          <span>输出成本: ${outputCost.toFixed(6)}</span>
        </div>
      </div>
    </ToolLayout>
  );
}
