import { useEffect, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { chunkText, DEFAULTS, estimateTokens, SPLIT_MODES, type SplitMode } from "./logic";

const STORAGE_KEY = "text-chunker-config";

type ChunkItem = {
  text: string;
  chars: number;
  tokens: number;
};

type Config = {
  chunkSize: number;
  overlap: number;
  splitMode: SplitMode;
};

export default function Tool() {
  const [text, setText] = useState("");
  const [config, setConfig] = useState<Config>(() => loadConfig());
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateConfig(next: Partial<Config>) {
    const merged = { ...config, ...next };
    setConfig(merged);
    saveConfig(merged);
  }

  function doChunk() {
    const normalized: Config = {
      chunkSize: Math.max(50, Math.min(10000, Number(config.chunkSize) || DEFAULTS.chunkSize)),
      overlap: Math.max(0, Math.min(5000, Number(config.overlap) || 0)),
      splitMode: config.splitMode,
    };
    setConfig(normalized);
    saveConfig(normalized);

    const raw = text.trim();
    if (!raw) {
      setChunks([]);
      return;
    }

    const rawChunks = chunkText(raw, normalized.splitMode, normalized.chunkSize, normalized.overlap);
    setChunks(rawChunks.map((chunk) => ({ text: chunk, chars: chunk.length, tokens: estimateTokens(chunk) })));
  }

  function resetAll() {
    setConfig(DEFAULTS);
    saveConfig(DEFAULTS);
    setText("");
    setChunks([]);
  }

  async function copyChunk(chunk: ChunkItem, index: number) {
    const result = await copyText(chunk.text);
    setToast(result.ok ? `分块 #${index + 1} 已复制` : result.message);
  }

  async function copyAllChunks() {
    if (chunks.length === 0) return;
    const output = chunks
      .map((chunk, index) => `--- 分块 ${index + 1} (${chunk.chars} 字, ~${chunk.tokens} tokens) ---\n${chunk.text}`)
      .join("\n\n");
    const result = await copyText(output);
    setToast(result.ok ? `已复制全部 ${chunks.length} 个分块` : result.message);
  }

  const totalChars = chunks.reduce((sum, chunk) => sum + chunk.chars, 0);
  const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokens, 0);

  return (
    <ToolLayout title="文本分块器" description="为 RAG 场景提供文本分块能力，支持按字符/段落/Markdown 标题分割，可调大小和重叠。">
      <section className="panel tool-panel tool-stack">
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={10} placeholder="粘贴需要分块的长文本" />

        <div className="chunker-config-row">
          <label className="compact-field">
            <span>分块大小</span>
            <input
              type="number"
              min={50}
              max={10000}
              value={config.chunkSize}
              onChange={(event) => updateConfig({ chunkSize: Number(event.target.value) })}
            />
          </label>
          <label className="compact-field">
            <span>重叠字符</span>
            <input
              type="number"
              min={0}
              max={5000}
              value={config.overlap}
              onChange={(event) => updateConfig({ overlap: Number(event.target.value) })}
            />
          </label>
          <label className="compact-field">
            <span>分割模式</span>
            <select value={config.splitMode} onChange={(event) => updateConfig({ splitMode: event.target.value as SplitMode })}>
              {SPLIT_MODES.map((mode) => (
                <option key={mode.key} value={mode.key}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="tool-button-row">
          <button type="button" onClick={doChunk}>
            开始分块
          </button>
          <button type="button" disabled={chunks.length === 0} onClick={copyAllChunks}>
            复制全部
          </button>
          <button className="ghost-btn" type="button" onClick={resetAll}>
            重置
          </button>
        </div>

        {chunks.length > 0 ? (
          <div className="chunk-stats">
            <div className="chunk-stat">
              <strong>{chunks.length}</strong>
              <span>分块数</span>
            </div>
            <div className="chunk-stat">
              <strong>{totalChars}</strong>
              <span>总字符数</span>
            </div>
            <div className="chunk-stat">
              <strong>~{totalTokens}</strong>
              <span>预估 Tokens</span>
            </div>
            <div className="chunk-stat">
              <strong>{Math.round(totalChars / chunks.length)}</strong>
              <span>平均每块</span>
            </div>
          </div>
        ) : null}

        <div className="chunk-list">
          {chunks.length > 0 ? (
            chunks.map((chunk, index) => (
              <article className="chunk-card" key={`${index}-${chunk.chars}`}>
                <div className="chunk-card-header">
                  <div className="chunk-card-meta">
                    <span className="chunk-badge">#{index + 1}</span>
                    <span className="chunk-meta-text">{chunk.chars} 字</span>
                    <span className="chunk-meta-text">~{chunk.tokens} tokens</span>
                  </div>
                  <button className="copy-btn chunk-copy-btn" type="button" onClick={() => copyChunk(chunk, index)} aria-label="复制此分块">
                    复制
                  </button>
                </div>
                <pre className="chunk-card-text">{chunk.text}</pre>
              </article>
            ))
          ) : (
            <div className="empty-state">请输入文本并点击「开始分块」。</div>
          )}
        </div>
      </section>
      <div className={`toast chunker-toast${toast ? " toast-visible" : " hidden"}`}>{toast}</div>
    </ToolLayout>
  );
}

function loadConfig(): Config {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
  return DEFAULTS;
}

function saveConfig(config: Config) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
}
