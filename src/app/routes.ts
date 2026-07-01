import { tools } from "./tool-registry";

export const HOME_ROUTE = "home";

export function normalizeRoute(route: string | null | undefined) {
  const value = (route || HOME_ROUTE).replace(/^#/, "");
  return tools.some((tool) => tool.meta.route === value) ? value : HOME_ROUTE;
}

export function getToolByRoute(route: string) {
  return tools.find((tool) => tool.meta.route === route) ?? null;
}

export function getToolById(id: string) {
  return tools.find((tool) => tool.meta.id === id) ?? null;
}
