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

export function AppShell({ route, tools, children }: Props) {
  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AI Toolkit</p>
          <h1>AI 工具箱</h1>
          <p className="hero-text">
            一个可直接发布到 GitHub Pages 的静态工具集合，包含大模型测速、配色生成、提示词模板、文本分块、文本比对、Token
            计算、JSON 格式化、正则测试、编码转换、时间戳、cURL 转代码、二维码、UUID、哈希、JWT 调试、Cron 解析、颜色转换、YAML、XML、URL、CSV
            等 21 个实用工具。
          </p>
        </div>
        <div className="hero-note">
          <p>静态工具集合</p>
          <ul>
            <li>主页统一导航</li>
            <li>子工具独立展示</li>
            <li>适合 GitHub Pages 发布</li>
          </ul>
        </div>
      </header>

      <nav className="tool-tabs" aria-label="工具导航">
        <a className={`tool-tab tool-tab-home ${route === "home" ? "active" : ""}`} href="#home">
          工具首页
        </a>
        {tools.map((tool) => (
          <a key={tool.meta.id} className={`tool-tab ${route === tool.meta.route ? "active" : ""}`} href={`#${tool.meta.route}`}>
            {tool.meta.title}
          </a>
        ))}
      </nav>

      {children}
    </div>
  );
}
