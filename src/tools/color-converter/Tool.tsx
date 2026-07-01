import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { convertColor } from "./logic";

export default function Tool() {
  const [input, setInput] = useState("#2563EB");
  const result = useMemo(() => convertColor(input), [input]);

  return (
    <ToolLayout title="颜色转换" description="在 HEX、RGB、HSL 格式间转换颜色。">
      <div className="tool-panel tool-stack">
        <input value={input} onChange={(event) => setInput(event.target.value)} />
        {"error" in result ? <p className="tool-status">{result.error}</p> : (
          <>
            <div className="color-preview" style={{ background: result.preview }} />
            <div className="stat-grid">{["hex", "rgb", "hsl", "oklch"].map((key) => <span key={key}><b>{key}</b>{result[key as keyof typeof result]}</span>)}</div>
            <button type="button" onClick={() => copyText(result.hex)}>复制 HEX</button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
