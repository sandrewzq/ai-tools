# 工具目录约定

每个新工具都放在独立目录中，例如 `src/tools/my-tool/`。工具目录只保存自身业务，不直接引用其他工具目录。

推荐文件结构：

```text
my-tool
├─ index.js
├─ state.js
├─ render.js
├─ service.js
└─ config.js
```

公共函数放到 `src/shared/`，路由、注册、生命周期这类项目级能力放到 `src/core/`。
