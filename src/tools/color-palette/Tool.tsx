import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { buildGeneratedPalette, buildPaletteCss } from "./logic";

export default function Tool() {
  const [base, setBase] = useState("#2563EB");
  const colors = useMemo(() => buildGeneratedPalette(base), [base]);
  const css = buildPaletteCss(colors);

  return (
    <ToolLayout title="配色生成器" description="生成可用于界面的配色方案和 CSS 变量。">
      <div className="tool-panel tool-stack">
        <div className="tool-inline-controls"><input type="color" value={base} onChange={(event) => setBase(event.target.value)} /><input value={base} onChange={(event) => setBase(event.target.value)} /></div>
        <div className="palette-grid">{colors.map((color) => <div className="palette-swatch" style={{ background: color.hex, color: color.text }} key={color.role}><b>{color.label}</b><span>{color.hex}</span></div>)}</div>
        <button type="button" onClick={() => copyText(css)}>复制 CSS</button>
        <pre className="tool-output">{css}</pre>
      </div>
    </ToolLayout>
  );
}
