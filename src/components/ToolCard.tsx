import type { ToolDefinition } from "../app/tool-types";

type Props = {
  tool: ToolDefinition;
  favorite: boolean;
  onOpen: (route: string) => void;
  onToggleFavorite: (id: string) => void;
};

export function ToolCard({ tool, favorite, onOpen, onToggleFavorite }: Props) {
  return (
    <article className="tool-card">
      <button className="tool-card-main" type="button" onClick={() => onOpen(tool.meta.route)}>
        <span className="tool-card-category">{tool.meta.category}</span>
        <h3>{tool.meta.title}</h3>
        <p>{tool.meta.description}</p>
      </button>
      <button
        className="icon-btn"
        type="button"
        aria-label={favorite ? "取消收藏" : "收藏"}
        title={favorite ? "取消收藏" : "收藏"}
        onClick={() => onToggleFavorite(tool.meta.id)}
      >
        {favorite ? "★" : "☆"}
      </button>
    </article>
  );
}
