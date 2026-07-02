import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { highlightMatches, testRegex } from "./logic";

export default function Tool() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("contact demo@example.com for details");
  const hasInput = pattern.trim().length > 0 || text.trim().length > 0;
  const result = useMemo(() => testRegex(pattern, flags, text), [flags, pattern, text]);
  const highlighted = result.error ? "" : highlightMatches(text, result.matches);

  return (
    <ToolLayout title="正则测试器" description="测试正则表达式并高亮匹配结果，展示捕获组和命名分组。">
      <section className="panel tool-panel tool-stack">
        <div className="two-column">
          <label>
            表达式
            <input value={pattern} onChange={(event) => setPattern(event.target.value)} placeholder="例如 (?<name>\\w+)=(\\d+)" />
          </label>
          <label>
            Flags
            <input value={flags} onChange={(event) => setFlags(event.target.value)} placeholder="gim" />
          </label>
        </div>

        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={8} placeholder="输入测试文本" />

        {result.error ? (
          <div className="regex-error">{result.error}</div>
        ) : (
          <div className="regex-stats">
            <span>
              匹配: <strong>{result.count}</strong>
            </span>
            <span>
              捕获组: <strong>{result.groupNames.length}</strong>
            </span>
          </div>
        )}

        <div className="tool-output" dangerouslySetInnerHTML={{ __html: highlighted }} />

        <div className="regex-match-list">
          {result.error ? null : result.matches.length > 0 ? (
            result.matches.map((match, index) => (
              <div className="regex-match-item" key={`${match.index}-${index}`}>
                <span className="regex-match-num">#{index + 1}</span>
                <code className="regex-match-text">{match.full}</code>
                <span className="regex-match-pos">
                  {match.index}-{match.end}
                </span>
                {match.groups.length > 0 ? (
                  <div className="regex-groups">
                    {match.groups.map((group, groupIndex) => {
                      const name = match.groupNames[groupIndex] || `$${groupIndex + 1}`;
                      return (
                        <span className="regex-group" key={`${name}-${groupIndex}`}>
                          <var>{name}</var>: <em>{group !== undefined ? group : "(未匹配)"}</em>
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="empty-state">{hasInput ? "无匹配结果" : "在左侧输入正则和测试文本"}</div>
          )}
        </div>
      </section>
    </ToolLayout>
  );
}
