type Props = {
  title: string;
};

export function ToolStub({ title }: Props) {
  return (
    <section className="tool-stub tool-layout">
      <h1>{title}</h1>
      <p>该工具正在迁移到 React 版本。</p>
    </section>
  );
}
