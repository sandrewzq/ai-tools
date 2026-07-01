import type { ReactNode } from "react";
import type { Preferences } from "../hooks/usePreferences";
import type { ToolDefinition } from "../app/tool-types";

type Props = {
  route: string;
  tools: ToolDefinition[];
  preferences: Preferences;
  onNavigate: (route: string) => void;
  onPreferencesChange: (preferences: Preferences) => void;
  children: ReactNode;
};

export function AppShell({ route, tools, preferences, onNavigate, onPreferencesChange, children }: Props) {
  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <button className="brand-button" type="button" onClick={() => onNavigate("home")}>
          <span>AI</span>
          <strong>工具箱</strong>
        </button>
        <nav className="side-nav" aria-label="工具导航">
          <button className={route === "home" ? "active" : ""} type="button" onClick={() => onNavigate("home")}>
            首页
          </button>
          {tools.map((tool) => (
            <button
              key={tool.meta.id}
              className={route === tool.meta.route ? "active" : ""}
              type="button"
              onClick={() => onNavigate(tool.meta.route)}
            >
              {tool.meta.title}
            </button>
          ))}
        </nav>
        <div className="preferences-panel">
          <label>
            主题
            <select
              value={preferences.theme}
              onChange={(event) => onPreferencesChange({ ...preferences, theme: event.target.value as Preferences["theme"] })}
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </label>
          <label>
            密度
            <select
              value={preferences.density}
              onChange={(event) => onPreferencesChange({ ...preferences, density: event.target.value as Preferences["density"] })}
            >
              <option value="comfortable">舒适</option>
              <option value="compact">紧凑</option>
            </select>
          </label>
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
