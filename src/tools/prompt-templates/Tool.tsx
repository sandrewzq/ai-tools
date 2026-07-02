import { useEffect, useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { CATEGORIES, filterTemplates } from "./logic";

const STORAGE_KEY = "prompt-templates-favorites";

export default function Tool() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [favorites, setFavorites] = useState<Set<string>>(() => readFavorites());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState("");
  const templates = useMemo(() => filterTemplates(query, category), [category, query]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch {
      // Ignore storage failures; copying and browsing still work.
    }
  }, [favorites]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyPrompt(prompt: string) {
    try {
      await copyText(prompt);
      setToast("已复制到剪贴板");
    } catch {
      setToast("复制失败，请手动选择文本");
    }
  }

  return (
    <ToolLayout title="提示词模板库" description="按场景分类的精选中英文提示词模板，支持一键复制和收藏。">
      <section className="panel prompt-filter-panel">
        <div className="prompt-filter-row">
          <input
            className="prompt-search-input"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索提示词..."
          />
        </div>
        <div className="category-tabs">
          {CATEGORIES.map((item) => (
            <button
              className={`category-tab${category === item.key ? " active" : ""}`}
              type="button"
              key={item.key}
              onClick={() => setCategory(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel prompt-cards-panel">
        {templates.length ? (
          <div className="prompt-cards-grid">
            {templates.map((template) => {
              const isFavorite = favorites.has(template.id);
              const isExpanded = expanded.has(template.id);
              return (
                <article className="prompt-card" key={template.id} onClick={() => toggleExpanded(template.id)}>
                  <div className="prompt-card-header">
                    <div className="prompt-card-title-row">
                      <strong>{template.title}</strong>
                      <div className="prompt-card-actions">
                        <button
                          className={`fav-btn${isFavorite ? " faved" : ""}`}
                          type="button"
                          aria-label={isFavorite ? "取消收藏" : "收藏"}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(template.id);
                          }}
                        >
                          {isFavorite ? "★" : "☆"}
                        </button>
                        <button
                          className="copy-btn"
                          type="button"
                          aria-label="复制提示词"
                          onClick={(event) => {
                            event.stopPropagation();
                            copyPrompt(template.prompt);
                          }}
                        >
                          复制
                        </button>
                      </div>
                    </div>
                    <p className="prompt-card-desc">{template.description}</p>
                  </div>
                  <div className="prompt-card-tags">
                    {template.tags.map((tag) => (
                      <span className="prompt-card-tag" key={`${template.id}-${tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={`prompt-card-body${isExpanded ? " expanded" : ""}`}>
                    <pre>{template.prompt}</pre>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">没有匹配的模板。</div>
        )}
      </section>

      <div className={`toast prompt-toast${toast ? " toast-visible" : " hidden"}`}>{toast}</div>
    </ToolLayout>
  );
}

function readFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}
