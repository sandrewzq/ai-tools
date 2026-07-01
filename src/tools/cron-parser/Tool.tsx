import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { CRON_EXAMPLES, parseCron } from "./logic";

export default function Tool() {
  const [input, setInput] = useState("*/15 * * * *");
  const result = useMemo(() => parseCron(input), [input]);

  return (
    <ToolLayout title="Cron 解析" description="解析 Cron 表达式字段和含义。">
      <div className="tool-panel tool-stack">
        <input value={input} onChange={(event) => setInput(event.target.value)} />
        <div className="tool-button-row">{CRON_EXAMPLES.map((item) => <button type="button" key={item.value} onClick={() => setInput(item.value)}>{item.label}</button>)}</div>
        {result.error || !("fields" in result) || !result.fields ? <p className="tool-status">{result.error}</p> : <>
          <p className="tool-status">{result.summary}</p>
          <div className="stat-grid">{result.fields.map((field) => <span key={field.key}>{field.label}: {field.description}</span>)}</div>
        </>}
      </div>
    </ToolLayout>
  );
}
