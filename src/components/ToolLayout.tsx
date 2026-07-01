import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function ToolLayout({ title, description, actions, children }: Props) {
  return (
    <main className="layout tool-view">
      <section className="panel tool-title-panel">
        <div className="section-head compact">
          <div>
            <p className="section-tag">Tool</p>
            <h2>{title}</h2>
          </div>
          <a className="ghost-link" href="#home">
            返回工具首页
          </a>
        </div>
        <p className="tip">{description}</p>
        {actions ? <div className="action-bar react-tool-actions">{actions}</div> : null}
      </section>
      {children}
    </main>
  );
}
