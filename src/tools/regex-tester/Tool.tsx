import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { highlightMatches, testRegex } from "./logic";

export default function Tool() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("contact demo@example.com for details");
  const result = useMemo(() => testRegex(pattern, flags, text), [flags, pattern, text]);
  const highlighted = result.error ? "" : highlightMatches(text, result.matches);

  return (
    <ToolLayout title="正则测试" description="测试正则表达式并高亮匹配结果。">
      <div className="tool-panel tool-stack">
        <div className="two-column">
          <label>表达式<input value={pattern} onChange={(event) => setPattern(event.target.value)} /></label>
          <label>Flags<input value={flags} onChange={(event) => setFlags(event.target.value)} /></label>
        </div>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={8} />
        {result.error ? <p className="tool-status">{result.error}</p> : <p className="tool-status">匹配 {result.count} 处</p>}
        <div className="tool-output" dangerouslySetInnerHTML={{ __html: highlighted || "高亮结果会显示在这里" }} />
      </div>
    </ToolLayout>
  );
}
