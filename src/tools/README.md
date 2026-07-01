# 工具目录约定

每个工具放在独立目录中，例如 `src/tools/json-formatter/`。

推荐结构：

```text
my-tool/
  Tool.tsx
  logic.ts
```

约定：

- `Tool.tsx` 默认导出 React 组件。
- `logic.ts` 保存可测试的纯逻辑。
- 工具元信息集中在 `src/app/tool-registry.ts`。
- 公共函数放到 `src/shared/`。
- 公共 UI 放到 `src/components/`。
- 工具目录之间不要直接互相引用。
