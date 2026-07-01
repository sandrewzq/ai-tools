type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBox({ value, onChange }: Props) {
  return (
    <label className="search-box">
      <span>搜索工具</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="输入名称、分类或标签" />
    </label>
  );
}
