import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { chunkText, DEFAULTS, estimateTokens, SPLIT_MODES, type SplitMode } from "./logic";

const SAMPLE = "第一段内容用于测试分块。\n\n第二段内容可以按段落拆分。\n\n# 标题\n标题下的内容。";

export default function Tool() {
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState(DEFAULTS.chunkSize);
  const [overlap, setOverlap] = useState(DEFAULTS.overlap);
  const [mode, setMode] = useState<SplitMode>(DEFAULTS.splitMode);
  const chunks = useMemo(() => chunkText(text, mode, size, overlap), [mode, overlap, size, text]);

  return (
    <ToolLayout title="文本分块" description="按字符、段落或估算 token 将长文本拆成块。">
      <div className="tool-panel tool-stack">
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={10} />
        <div className="tool-inline-controls">
          <label>模式<select value={mode} onChange={(event) => setMode(event.target.value as SplitMode)}>{SPLIT_MODES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
          <label>块大小<input type="number" min={1} value={size} onChange={(event) => setSize(Number(event.target.value))} /></label>
          <label>重叠<input type="number" min={0} value={overlap} onChange={(event) => setOverlap(Number(event.target.value))} /></label>
        </div>
        <div className="tool-button-row">
          <button type="button" onClick={() => copyText(chunks.join("\n\n---\n\n"))}>复制全部</button>
        </div>
        <div className="stat-grid"><span>块数: {chunks.length}</span><span>估算 tokens: {estimateTokens(text)}</span></div>
        <div className="chunk-list">{chunks.map((chunk, index) => <pre className="tool-output" key={`${index}-${chunk.length}`}>#{index + 1} ({chunk.length} 字符){"\n"}{chunk}</pre>)}</div>
      </div>
    </ToolLayout>
  );
}
