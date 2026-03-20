# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 提供指导，确保 AI 始终处于简体中文语境下工作。

本仓库为 pnpm monorepo，包含 Hono (Node.js) 后端和 Preact 前端。

## 技术栈

- **后端**: Hono + Node.js + Valibot + SQLite (`node:sqlite`)
- **前端**: Preact + Vite + UnoCSS v4 + nanostores/router
- **代码质量**: Oxc (根目录 `oxlintrc.json` + `oxfmtrc.json` 配置)
- **运行时**: Node.js v25+ + pnpm

## 项目结构

```
apps/
├── backend/                    # Hono API 服务器
│   ├── src/
│   │   ├── app.ts              # Hono 入口
│   │   ├── routes/             # HTTP & WebSocket 路由
│   │   ├── types/             # 类型定义
│   │   └── utils/             # 工具函数
│   └── package.json
└── frontend/                   # Preact SPA
    ├── src/
    │   ├── components/         # 组件
    │   ├── pages/              # 页面
    │   ├── hooks/              # 自定义 Hooks
    │   ├── layouts/            # 布局
    │   ├── stores/             # nanostores 状态
    │   └── main.tsx
    └── vite.config.ts
```

## 常用命令

```bash
# 开发
pnpm dev                        # 同时启动前后端
pnpm dev:backend                # 仅启动后端 (端口 3000)
pnpm dev:frontend               # 仅启动前端 (端口 5173)

# 构建
pnpm build                      # 构建所有应用（开发环境）
pnpm build:prod                 # 构建所有应用（生产环境）
pnpm build:backend              # 仅构建后端
pnpm build:frontend             # 仅构建前端

# 代码质量
pnpm check                      # Oxc 检查格式和 lint
pnpm check:write                # 自动修复问题
```

## 代码风格

### Oxc 配置

- 缩进: Tab
- 引号: 双引号
- 分号: 必须
- 使用 `pnpm check:write` 自动修复

### 命名规范

| 元素          | 规范        | 示例                           |
| ------------- | ----------- | ------------------------------ |
| 变量/函数     | camelCase   | `userName`, `renderMarkdown()` |
| 常量          | UPPER_SNAKE | `PORT`, `BLOGS_DIR`            |
| 类/类型/接口  | PascalCase  | `RoomService`, `BlogItem`      |
| 文件 (TS/TSX) | lowercase   | `blogs.ts`, `button.tsx`       |
| 组件          | PascalCase  | `Button.tsx`                   |

### 导入规范

使用 `@/` 别名导入（已配置在 tsconfig.json）

## 后端开发规范

### 路由与校验 (Hono + Valibot)

```typescript
import { Hono } from "hono";
import * as v from "valibot";

const QuerySchema = v.object({
  page: v.optional(v.string(), "1"),
  pageSize: v.optional(v.string(), "10"),
});

app.get("/blogs", async (c) => {
  const query = c.req.query();
  const parsed = v.safeParse(QuerySchema, query);
  if (!parsed.success) {
    return c.json({ error: "参数错误" }, 400);
  }
  return c.json({ data });
});
```

### 服务类错误处理

```typescript
export type OperationResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

### 数据库 (node:sqlite)

```typescript
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("data/sqlite.db");
const rows = db.prepare("SELECT * FROM blogs").all() as Blog[];
```

## 前端开发规范

### 组件结构

```typescript
import type { JSX } from "preact";

type Props = {
  children?: JSX.Element;
  className?: string;
};

const Button = ({ children, className }: Props) => {
  return <button className={className}>{children}</button>;
};

export default Button;
export type { Props as ButtonProps };
```

### 路由 (nanostores/router)

```typescript
import { useRouterStore, useNavigate } from "@/stores/router";

const { route } = useRouterStore();
const navigate = useNavigate();
```

### 图标 (Iconify + UnoCSS)

```tsx
<i class="icon-[mingcute--arrow-left-line]" />
```

## 提交规范

遵循 Conventional Commits: `feat(backend): 添加分页`, `fix(frontend): 修复加载状态`

## 安全规范

- 禁止提交 `.env` 文件或密钥
- 所有输入必须校验 (后端用 Valibot)
- WebSocket 使用 `crypto.randomUUID()` 生成用户 ID
- 用户生成内容渲染前需清理
