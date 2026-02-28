# AGENTS.md

本仓库 AI 编程助手指南。

## 技术栈

- **运行时**: Node.js v25+ + pnpm
- **后端**: Hono + Valibot 校验 + SQLite (`bun:sqlite`)
- **前端**: Preact + Vite + UnoCSS v4 + wouter-preact
- **代码质量**: Biome (根目录配置)
- **测试**: 未配置

## 项目结构

```
.
├── apps/
│   ├── backend/                    # Hono API 服务器
│   │   ├── src/
│   │   │   ├── app.ts               # Hono 入口
│   │   │   ├── routes/              # HTTP & WebSocket 路由
│   │   │   ├── types/               # 类型定义
│   │   │   └── utils/               # 工具函数
│   │   └── package.json
│   └── frontend/                    # Preact SPA
│       ├── src/
│       │   ├── components/          # 组件
│       │   ├── pages/               # 页面
│       │   ├── hooks/               # 自定义 Hooks
│       │   ├── layouts/             # 布局
│       │   └── main.tsx
│       └── vite.config.ts
├── biome.json                       # 根目录 Biome 配置
└── package.json                     # 工作区根配置
```

## 命令

```bash
# 根工作区
pnpm install                         # 安装所有依赖
pnpm dev                             # 同时启动前后端
pnpm dev:backend                     # 仅启动后端 (端口 3000)
pnpm dev:frontend                    # 仅启动前端 (端口 5173)
pnpm build                           # 构建所有应用
pnpm check                           # 检查代码格式和 lint
pnpm check:write                     # 自动修复问题

# 后端专用
cd apps/backend
pnpm dev                             # 开发模式 (tsx watch)
pnpm build                           # 使用 esbuild 打包
pnpm start                           # 运行构建后的版本

# Biome 检查
pnpm dlx @biomejs/biome check apps/backend/src
pnpm dlx @biomejs/biome check apps/frontend/src
```

## 代码风格

### Biome 配置 (双端通用)

- **缩进**: Tab
- **引号**: 双引号
- **分号**: 必须
- **换行**: LF
- 运行 `pnpm dlx @biomejs/biome check --write` 自动修复

### 命名规范

| 元素           | 规范        | 示例                     |
| -------------- | ----------- | ------------------------ |
| 变量           | camelCase   | `userName`, `pageSize`   |
| 常量           | UPPER_SNAKE | `PORT`, `BLOGS_DIR`      |
| 函数           | camelCase   | `renderMarkdown()`       |
| 类             | PascalCase  | `RoomService`            |
| 类型/接口      | PascalCase  | `BlogItem`, `ButtonProps`|
| 文件 (TS/TSX)  | lowercase   | `blogs.ts`, `button.tsx` |
| 组件           | PascalCase  | `Button.tsx`, `Header.tsx` |

### 导入规范

**后端:**
```typescript
import { Hono } from "hono";
import * as v from "valibot";
import { PORT } from "@/utils/constants";
import { blogs } from "./blogs";
```

**前端:**
```typescript
import { clsx } from "@/utils/string";
import useUser from "@/hooks/use-user";
import RecentAnimes from "./recent-animes";
```

## 后端开发规范

### 路由与校验 (Hono + Valibot)

```typescript
import { Hono } from "hono";
import * as v from "valibot";

const app = new Hono();

// GET 参数校验
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
  const { page, pageSize } = parsed.output;
  // 业务逻辑...
  return c.json({ data });
});
```

### 服务类错误处理

```typescript
export type OperationResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export class RoomService {
  createRoom(payload: CreateRoomPayload): OperationResult<CreateRoomResponse> {
    if (this.userMap.has(userId)) {
      return {
        success: false,
        error: { code: "USER_ALREADY_IN_ROOM", message: "用户已在房间中" }
      };
    }
    return { success: true, data: { roomId: generateId() } };
  }
}
```

### 数据库 (bun:sqlite)

```typescript
import { Database } from "bun:sqlite";

const db = new Database("data/sqlite.db");
const listStmt = db.prepare("SELECT * FROM blogs LIMIT $limit OFFSET $offset");
const rows = listStmt.all({ $limit: 10, $offset: 0 }) as Blog[];
```

## 前端开发规范

### 组件结构

```typescript
import type { JSX } from "preact";
import { clsx } from "@/utils/string";

type Props = {
  children?: JSX.Element;
  className?: string;
  onClick?: () => void;
};

const Button = ({ children, className, onClick }: Props) => {
  return (
    <button 
      className={clsx("base-classes", className)} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
export type { Props as ButtonProps };
```

### 路由 (wouter-preact)

```typescript
import { Route, Switch } from "wouter-preact";
import HomePage from "@/pages/home";
import BlogPage from "@/pages/blog";

export default function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/blog/:slug" component={BlogPage} />
    </Switch>
  );
}
```

### 图标 (Iconify + UnoCSS)

```tsx
<i class="icon-[mingcute--arrow-left-line]" />
```

## 错误处理

- **后端**: 使用 `c.json({ error }, status)` 返回错误，服务返回 `OperationResult` 而非抛异常
- **前端**: 使用 `react-hot-toast` 显示通知，API 错误优雅处理
- **校验**: 后端使用 Valibot `safeParse`，失败时使用默认值或返回 400

## 提交前检查清单

1. 运行 `pnpm check` 检查代码
2. 运行 `pnpm build` 验证构建
3. 确保无敏感信息提交
4. 遵循 Conventional Commits: `feat(backend): 添加分页`, `fix(frontend): 修复加载状态`

## 安全规范

- 禁止提交 `.env` 文件或密钥
- 所有输入必须校验 (后端用 Valibot)
- WebSocket 使用 `crypto.randomUUID()` 生成用户 ID
- 用户生成内容渲染前需清理

## 通用规范

- 使用 `@/` 别名导入 (已配置在 tsconfig.json)
- 前端优先使用函数组件和 Hooks
- 保持组件小而聚焦
- 使用 TypeScript 严格模式
