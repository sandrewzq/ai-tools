import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { dateToTimestamp, nowTimestamp, timestampToDate, TZ_OPTIONS } from "./logic";

export default function Tool() {
  const [timestamp, setTimestamp] = useState(String(nowTimestamp()));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [timezone, setTimezone] = useState("local");
  const tsResult = useMemo(() => timestampToDate(timestamp, timezone), [timestamp, timezone]);
  const dateResult = useMemo(() => dateToTimestamp(date), [date]);

  return (
    <ToolLayout title="时间戳转换" description="在时间戳、日期和时区之间转换。">
      <div className="tool-panel tool-stack">
        <div className="tool-inline-controls">
          <input value={timestamp} onChange={(event) => setTimestamp(event.target.value)} />
          <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>{TZ_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
          <button type="button" onClick={() => setTimestamp(String(nowTimestamp()))}>当前秒</button>
          <button type="button" onClick={() => setTimestamp(String(nowTimestamp("ms")))}>当前毫秒</button>
        </div>
        {tsResult && !("error" in tsResult) ? <pre className="tool-output">{JSON.stringify(tsResult, null, 2)}</pre> : <p className="tool-status">{tsResult?.error}</p>}
        <input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} />
        {dateResult && !("error" in dateResult) ? <div className="stat-grid"><span>秒: {dateResult.unixSeconds}</span><span>毫秒: {dateResult.unixMs}</span><button type="button" onClick={() => copyText(String(dateResult.unixSeconds))}>复制秒</button></div> : <p className="tool-status">{dateResult?.error}</p>}
      </div>
    </ToolLayout>
  );
}
