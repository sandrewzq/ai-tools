import type { ToolDefinition } from "../app/tool-types";

type Props = {
  tool: ToolDefinition;
  favorite: boolean;
  onOpen: (route: string) => void;
  onToggleFavorite: (id: string) => void;
};

export function ToolCard({ tool, favorite, onOpen, onToggleFavorite }: Props) {
  return (
    <article className="tool-card react-tool-card">
      <a
        className="tool-card-link"
        href={`#${tool.meta.route}`}
        onClick={(event) => {
          event.preventDefault();
          onOpen(tool.meta.route);
        }}
      >
        <span className="tool-card-kicker">{tool.meta.kicker || tool.meta.category}</span>
        <strong>{tool.meta.title}</strong>
        <p>{tool.meta.description}</p>
      </a>
      <button
        className="favorite-btn"
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
