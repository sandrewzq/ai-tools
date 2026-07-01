import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { CATEGORIES, filterTemplates } from "./logic";

export default function Tool() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const templates = useMemo(() => filterTemplates(query, category), [category, query]);

  return (
    <ToolLayout title="提示词模板" description="搜索、复制和收藏常用提示词模板。">
      <div className="tool-panel tool-stack">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索模板" />
        <div className="category-tabs">
          {CATEGORIES.map((item) => <button className={category === item.key ? "active" : ""} type="button" key={item.key} onClick={() => setCategory(item.key)}>{item.label}</button>)}
        </div>
        <div className="tool-grid">
          {templates.map((template) => (
            <article className="template-card" key={template.id}>
              <h3>{template.title}</h3>
              <p>{template.description}</p>
              <pre>{template.prompt}</pre>
              <button type="button" onClick={() => copyText(template.prompt)}>复制</button>
            </article>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
