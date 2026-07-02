import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { CRON_EXAMPLES, parseCron } from "./logic";

export default function Tool() {
  const [input, setInput] = useState("*/15 * * * *");
  const result = useMemo(() => parseCron(input), [input]);

  return (
    <ToolLayout title="Cron 解析器" description="解析 5 段 Cron 表达式，输出字段拆解和中文自然语言说明。">
      <section className="panel tool-panel tool-stack">
        <div className="cron-toolbar">
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="例如 */15 * * * *" />
          <button type="button" onClick={() => setInput(input.trim())}>
            解析
          </button>
        </div>

        <div className="cron-examples">
          {CRON_EXAMPLES.map((item) => (
            <button className="ghost-btn cron-example-btn" type="button" key={item.value} onClick={() => setInput(item.value)}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="cron-summary-wrap">
          {!input.trim() ? (
            <p className="cron-empty">输入 Cron 表达式后，这里会显示中文解释。</p>
          ) : result.error ? (
            <div className="regex-error">{result.error}</div>
          ) : (
            <div className="cron-summary-card">{result.summary}</div>
          )}
        </div>

        <div className="cron-fields-wrap">
          {!result.error && result.fields ? (
            <div className="cron-fields-grid">
              {result.fields.map((field) => (
                <div className="cron-field-card" key={field.key}>
                  <span className="cron-field-name">{field.label}</span>
                  <code className="cron-field-token">{field.token}</code>
                  <p className="cron-field-desc">{field.description}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </ToolLayout>
  );
}
