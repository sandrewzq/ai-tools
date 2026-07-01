import { useMemo, useState } from "react";
import type { ToolCategory, ToolDefinition } from "../app/tool-types";
import { SearchBox } from "./SearchBox";
import { ToolCard } from "./ToolCard";

const CATEGORY_LABELS: Record<ToolCategory | "all", string> = {
  all: "全部",
  benchmark: "测速",
  text: "文本",
  data: "数据",
  encoding: "编码",
  security: "安全",
  time: "时间",
  design: "设计",
  network: "网络",
};

type Props = {
  tools: ToolDefinition[];
  favoriteIds: string[];
  recentIds: string[];
  isFavorite: (id: string) => boolean;
  onOpen: (route: string) => void;
  onToggleFavorite: (id: string) => void;
};

function byIds(tools: ToolDefinition[], ids: string[]) {
  return ids.map((id) => tools.find((tool) => tool.meta.id === id)).filter((tool): tool is ToolDefinition => Boolean(tool));
}

export function HomeWorkbench({ tools, favoriteIds, recentIds, isFavorite, onOpen, onToggleFavorite }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const categories = useMemo(() => Array.from(new Set(tools.map((tool) => tool.meta.category))), [tools]);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const categoryMatch = category === "all" || tool.meta.category === category;
      const searchText = [tool.meta.title, tool.meta.description, tool.meta.category, tool.meta.kicker, ...tool.meta.tags].join(" ").toLowerCase();
      return categoryMatch && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [category, normalizedQuery, tools]);

  const favoriteTools = byIds(tools, favoriteIds);
  const recentTools = byIds(tools, recentIds);

  return (
    <main className="layout tool-view">
      <section className="panel tools-home-panel">
        <div className="section-head">
          <div>
            <p className="section-tag">Tools</p>
            <h2>工具导航</h2>
          </div>
        </div>
        <div className="home-filter-bar">
          <SearchBox value={query} onChange={setQuery} />
          <div className="category-tabs" aria-label="工具分类">
            <button className={category === "all" ? "active" : ""} type="button" onClick={() => setCategory("all")}>
              {CATEGORY_LABELS.all}
            </button>
            {categories.map((item) => (
              <button className={category === item ? "active" : ""} type="button" key={item} onClick={() => setCategory(item)}>
                {CATEGORY_LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        {favoriteTools.length > 0 ? (
          <ToolSection title="收藏" tools={favoriteTools} isFavorite={isFavorite} onOpen={onOpen} onToggleFavorite={onToggleFavorite} />
        ) : null}

        {recentTools.length > 0 ? (
          <ToolSection title="最近使用" tools={recentTools} isFavorite={isFavorite} onOpen={onOpen} onToggleFavorite={onToggleFavorite} />
        ) : null}

        <ToolSection
          title={favoriteTools.length || recentTools.length ? "全部工具" : ""}
          tools={filteredTools}
          emptyText="没有匹配的工具"
          isFavorite={isFavorite}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
        />
      </section>
    </main>
  );
}

function ToolSection({
  title,
  tools,
  emptyText,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: {
  title: string;
  tools: ToolDefinition[];
  emptyText?: string;
  isFavorite: (id: string) => boolean;
  onOpen: (route: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <section className="tool-section">
      {title ? <h3 className="react-section-title">{title}</h3> : null}
      {tools.length > 0 ? (
        <div className="tool-grid">
          {tools.map((tool) => (
            <ToolCard
              key={tool.meta.id}
              tool={tool}
              favorite={isFavorite(tool.meta.id)}
              onOpen={onOpen}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <p className="empty-state">{emptyText}</p>
      )}
    </section>
  );
}
