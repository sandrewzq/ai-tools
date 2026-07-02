import { useMemo } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { convertColor } from "./logic";
import { useState } from "react";

export default function Tool() {
  const [input, setInput] = useState("#2563EB");
  const result = useMemo(() => convertColor(input), [input]);

  async function copyValue(value: string) {
    await copyText(value);
  }

  return (
    <ToolLayout title="颜色格式转换" description="将 HEX、RGB、HSL 颜色互转，并展示实时预览与复制结果。">
      <section className="panel tool-panel tool-stack">
        <div className="color-converter-toolbar">
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="#2563EB / rgb(37, 99, 235) / hsl(217, 91%, 53%)" />
          <button type="button" onClick={() => setInput(input.trim())}>
            转换
          </button>
        </div>

        {"error" in result ? (
          <>
            <div className="regex-error">{result.error}</div>
            <div className="color-converter-empty">无法生成颜色预览</div>
          </>
        ) : (
          <>
            <div className="color-converter-preview">
              <div className="color-converter-swatch" style={{ "--swatch": result.preview } as React.CSSProperties} />
              <div className="color-converter-preview-meta">
                <code>{result.hex}</code>
              </div>
            </div>
            <div className="color-format-grid">
              {[
                ["HEX", result.hex],
                ["RGB", result.rgb],
                ["HSL", result.hsl],
                ["OKLCH", result.oklch],
              ].map(([label, value]) => (
                <div className="color-format-card" key={label}>
                  <span className="color-format-label">{label}</span>
                  <code className="color-format-value">{value}</code>
                  <button className="ghost-btn color-copy-btn" type="button" data-copy-value={value} onClick={() => copyValue(value)}>
                    复制
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </ToolLayout>
  );
}
