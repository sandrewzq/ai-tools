import { useEffect, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { generateBatch } from "./logic";

export default function Tool() {
  const [version, setVersion] = useState<"v4" | "v7">("v4");
  const [count, setCount] = useState(5);
  const [noHyphens, setNoHyphens] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState<string[]>(() => generateBatch(5, "v4", false, false));

  useEffect(() => {
    generate();
  }, [version, count, noHyphens, uppercase]);

  function normalizedCount(value = count) {
    const max = version === "v7" ? 50 : 100;
    return Math.max(1, Math.min(max, Number(value) || 1));
  }

  function generate() {
    setUuids(generateBatch(normalizedCount(), version, noHyphens, uppercase));
  }

  function updateVersion(next: "v4" | "v7") {
    setVersion(next);
    setCount((current) => Math.min(current, next === "v7" ? 50 : 100));
  }

  return (
    <ToolLayout title="UUID 生成器" description="在线生成 UUID v4 和 v7，支持批量生成、去连字符、大小写切换。">
      <section className="panel tool-panel tool-stack">
        <div className="tool-inline-controls">
          <label>
            版本
            <select value={version} onChange={(event) => updateVersion(event.target.value as "v4" | "v7")}>
              <option value="v4">v4</option>
              <option value="v7">v7</option>
            </select>
          </label>
          <label>
            数量
            <input
              type="number"
              min={1}
              max={version === "v7" ? 50 : 100}
              value={count}
              onChange={(event) => setCount(normalizedCount(Number(event.target.value)))}
            />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={noHyphens} onChange={(event) => setNoHyphens(event.target.checked)} /> 去掉连字符
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={uppercase} onChange={(event) => setUppercase(event.target.checked)} /> 大写
          </label>
        </div>
        <div className="tool-button-row">
          <button type="button" onClick={generate}>
            生成
          </button>
          <button type="button" onClick={() => copyText(uuids.join("\n"))}>
            复制全部
          </button>
        </div>
        <div className="uuid-list tool-output">
          {uuids.map((uuid, index) => (
            <div className="uuid-row" key={`${uuid}-${index}`}>
              <code>{uuid}</code>
              <button className="ghost-btn uuid-copy-btn" type="button" data-uuid={uuid} data-index={index} title="复制" onClick={() => copyText(uuid)}>
                复制
              </button>
            </div>
          ))}
        </div>
      </section>
    </ToolLayout>
  );
}
