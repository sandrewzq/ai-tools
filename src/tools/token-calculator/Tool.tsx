import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { estimateTokens, getTextStats, MODELS } from "./logic";

export default function Tool() {
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState(MODELS[0].id);
  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[0];
  const hasText = text.trim().length > 0;
  const tokens = useMemo(() => (hasText ? estimateTokens(text) : 0), [hasText, text]);
  const stats = useMemo(() => getTextStats(text), [text]);
  const inputPrice = ((tokens / 1000) * model.priceInput).toFixed(4);
  const outputPrice = ((tokens / 1000) * model.priceOutput).toFixed(4);

  function clearAll() {
    setText("");
  }

  return (
    <ToolLayout title="Token 计算器" description="估算文本在不同大模型下的 token 消耗，支持 GPT / Claude 系列，实时统计中英文字数和预估费用。">
      <section className="panel tool-panel tool-stack">
        <div className="tool-inline-controls">
          <select value={modelId} onChange={(event) => setModelId(event.target.value)}>
            {MODELS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button className="ghost-btn" type="button" onClick={clearAll}>
            清空
          </button>
        </div>

        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={10} placeholder="输入文本后将自动显示 token 估算结果。" />

        {hasText ? (
          <>
            <div className="token-stats-grid">
              <div className="token-stat-card">
                <div className="token-stat-value">{tokens.toLocaleString()}</div>
                <div className="token-stat-label">预估 Tokens</div>
              </div>
              <div className="token-stat-card">
                <div className="token-stat-value">{stats.chars.toLocaleString()}</div>
                <div className="token-stat-label">字符数</div>
              </div>
              <div className="token-stat-card">
                <div className="token-stat-value">{stats.chineseChars.toLocaleString()}</div>
                <div className="token-stat-label">中文字数</div>
              </div>
              <div className="token-stat-card">
                <div className="token-stat-value">{stats.englishWords.toLocaleString()}</div>
                <div className="token-stat-label">英文词数</div>
              </div>
            </div>

            <div className="tool-output">
              <div className="token-detail-row">
                <span>模型编码器</span>
                <span className="token-detail-value">{model.encoder}</span>
              </div>
              <div className="token-detail-row">
                <span>预估价格（Input）</span>
                <span className="token-detail-value">${inputPrice}</span>
              </div>
              <div className="token-detail-row">
                <span>预估价格（Output）</span>
                <span className="token-detail-value">${outputPrice}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">输入文本后将自动显示 token 估算结果。</div>
        )}
      </section>
    </ToolLayout>
  );
}
