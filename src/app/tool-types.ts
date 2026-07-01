import type { ComponentType, LazyExoticComponent } from "react";

export type ToolCategory =
  | "benchmark"
  | "text"
  | "data"
  | "encoding"
  | "security"
  | "time"
  | "design"
  | "network";

export type ToolMeta = {
  id: string;
  route: string;
  title: string;
  kicker?: string;
  category: ToolCategory;
  description: string;
  tags: string[];
};

export type ToolDefinition = {
  meta: ToolMeta;
  Component: LazyExoticComponent<ComponentType>;
};
