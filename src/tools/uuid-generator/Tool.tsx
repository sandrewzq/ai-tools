import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { generateBatch } from "./logic";

export default function Tool() {
  const [version, setVersion] = useState<"v4" | "v7">("v4");
  const [count, setCount] = useState(5);
  const [noHyphens, setNoHyphens] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState<string[]>(() => generateBatch(5, "v4", false, false));

  function generate() {
    setUuids(generateBatch(count, version, noHyphens, uppercase));
  }

  return (
    <ToolLayout title="UUID 生成" description="批量生成 UUID v4 或 v7。">
      <div className="tool-panel tool-stack">
        <div className="tool-inline-controls">
          <label>版本<select value={version} onChange={(event) => setVersion(event.target.value as "v4" | "v7")}><option value="v4">v4</option><option value="v7">v7</option></select></label>
          <label>数量<input type="number" min={1} max={100} value={count} onChange={(event) => setCount(Number(event.target.value))} /></label>
          <label className="checkbox-label"><input type="checkbox" checked={noHyphens} onChange={(event) => setNoHyphens(event.target.checked)} /> 去掉连字符</label>
          <label className="checkbox-label"><input type="checkbox" checked={uppercase} onChange={(event) => setUppercase(event.target.checked)} /> 大写</label>
        </div>
        <div className="tool-button-row"><button type="button" onClick={generate}>生成</button><button type="button" onClick={() => copyText(uuids.join("\n"))}>复制全部</button></div>
        <pre className="tool-output">{uuids.join("\n")}</pre>
      </div>
    </ToolLayout>
  );
}
