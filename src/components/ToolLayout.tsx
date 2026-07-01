import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function ToolLayout({ title, description, actions, children }: Props) {
  return (
    <section className="tool-layout">
      <header className="tool-layout-header">
        <div>
          <p className="tool-kicker">工具</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actions ? <div className="tool-actions">{actions}</div> : null}
      </header>
      <div className="tool-layout-body">{children}</div>
    </section>
  );
}
