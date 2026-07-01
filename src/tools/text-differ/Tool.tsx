import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { diffLines, getDiffStats } from "./logic";

export default function Tool() {
  const [left, setLeft] = useState("alpha\nbeta\ngamma");
  const [right, setRight] = useState("alpha\nbeta changed\ngamma\nnew line");
  const diff = useMemo(() => diffLines(left, right), [left, right]);
  const stats = getDiffStats(diff);

  function swap() {
    setLeft(right);
    setRight(left);
  }

  return (
    <ToolLayout title="文本比对" description="比较两段文本并标记新增、删除和未变化内容。">
      <div className="tool-panel tool-stack">
        <div className="two-column">
          <textarea value={left} onChange={(event) => setLeft(event.target.value)} rows={10} />
          <textarea value={right} onChange={(event) => setRight(event.target.value)} rows={10} />
        </div>
        <div className="tool-button-row">
          <button type="button" onClick={swap}>交换</button>
          <button type="button" onClick={() => { setLeft(""); setRight(""); }}>清空</button>
        </div>
        <div className="stat-grid"><span>新增: {stats.added}</span><span>删除: {stats.removed}</span><span>相同: {stats.equal}</span></div>
        <div className="diff-output">{diff.map((item, index) => <div className={`diff-line ${item.type}`} key={index}><span>{item.type}</span><code>{item.text || " "}</code></div>)}</div>
      </div>
    </ToolLayout>
  );
}
