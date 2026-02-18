# AGENTS.md

本文档为 AI 编码助手提供代码库操作指南。

## 项目概述

Bun/ElysiaJS 后端项目，支持 SQLite 数据库、WebSocket 和文件监控。

### 技术栈

- **运行时**: Bun (ESM)
- **框架**: ElysiaJS (REST API + WebSocket)
- **数据库**: SQLite (`bun:sqlite`)
- **验证**: Elysia 内置 `t.*` schema
- **代码质量**: Biome

### 项目结构

```
src/
├── app.ts           # Elysia 入口、中间件和路由注册
├── routes/          # 路由模块 (animes.ts, blogs.ts, shanbay.ts, rooms.ts)
├── libs/            # 共享配置 (constants.ts, middlewares.ts)
├── types/           # 类型和验证 schema (blogs.ts, animes.ts 等)
└── utils/           # 工具函数 (animes.ts, blogs.ts, markdown.ts 等)

data/sqlite.db      # SQLite 数据库
dist/               # 构建输出
```

---

## 构建、 lint 和测试命令

### 开发

```bash
bun run dev
```

以 watch 模式启动，`INIT_WATCH=false` 跳过动漫目录全量扫描以加快启动。

### 构建和运行

```bash
bun run build    # 构建生产包到 dist/
bun run start    # 运行 dist/app.js
```

### 代码质量 (Biome)

```bash
bunx biome check .           # 运行 lint 和代码分析
bunx biome format .          # 格式化所有文件
bunx biome check --write .    # 自动修复问题

# 检查特定文件
bunx biome check src/routes/blogs.ts
```

### 测试

**目前未配置专用测试框架。** 添加测试：

1. 创建 `*.test.ts` 命名约定的测试文件
2. 放在模块旁边或 `tests/` 目录
3. 运行: `bun test` 或 `bun test <file>`

单个测试文件执行：
```bash
bun test src/utils/blogs.test.ts
```

---

## 代码风格指南

### 通用原则

- 使用 TypeScript (strict 模式)
- 遵循 ESM 规范
- 优先显式而非隐式
- 保持函数小而专注

### 格式化 (Biome)

- **缩进**: Tab (非空格)
- **引号**: 双引号 (`"`)
- **分号**: 必须
- **行尾**: LF

提交前运行 `bunx biome check --write .` 自动修复格式问题。

### 导入

**使用路径别名** (`@/*`):

```typescript
import { BLOGS_DIR } from "@/libs/constants";
import { BlogListResponseSchema } from "@/types/blogs";
```

**导入顺序** (Biome 自动排序):
1. 库导入 (`"elysia"`, `"@elysiajs/cors"`)
2. 外部包 (`"bun"`, `"chokidar"`)
3. 路径别名 (`@/...`)
4. 相对导入 (`"./..."`, `"../..."`)

### 文件命名

- 使用小写字母
- 按功能分组: `routes/blogs.ts`, `types/blogs.ts`, `utils/blogs.ts`

### 命名约定

| 元素 | 约定 | 示例 |
|------|------|------|
| 变量 | camelCase | `blogList`, `pageSize` |
| 常量 | PascalCase | `PORT`, `BLOGS_DIR` |
| 函数 | camelCase | `renderMarkdown()` |
| 类型/接口 | PascalCase | `BlogItem`, `AnimeDetailResponse` |
| 文件 | 小写 | `blogs.ts`, `animes.ts` |

### 类型定义

使用 Elysia 的 `t.*` schemas:

```typescript
import { t } from "elysia";

export const BlogItemSchema = t.Object({
  title: t.String(),
  slug: t.String(),
});

export type BlogItem = typeof BlogItemSchema.static;
```

避免使用 `any`。

### 错误处理

使用 `set.status` 设置 HTTP 状态码:

```typescript
async ({ params: { slug }, set }) => {
  const blog = getBySlugStmt.get({ $slug: slug });
  if (!blog) {
    set.status = 404;
    return "Article not found";
  }
  return blog;
}
```

### 常量

将硬编码值集中在 `src/libs/constants.ts`:

```typescript
export const PORT = 3030;
export const BLOGS_DIR = `${WEBDAV_PATH}/Nickyzj/Blogs`;
```

---

## 数据库

- 使用 `bun:sqlite`
- 使用预处理语句:

```typescript
export const listStmt = db.prepare("SELECT * FROM blogs LIMIT $limit OFFSET $offset");
```

- 使用命名参数 (`$slug`, `$limit`, `$offset`)

---

## WebSocket

- 使用 Bun 原生 WebSocket (非 socket.io)
- 房间状态存储在内存中 (无持久化)
- 见 `src/routes/rooms.ts`

---

## 安全

- **永不提交 secrets**: 密钥、令牌、证书不能进入 git
- **验证所有输入**: 使用 Elysia 的 `t.*` schemas
- **检查 CORS 配置**: 确认 `ALLOWED_ORIGINS`

---

## Git 约定

### 提交信息

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(blogs): add pagination support
fix(animes): handle missing episode data
chore: update dependencies
```

---

## 提交前

1. 运行 `bunx biome check .` 发现问题
2. 运行 `bun run dev` 手动验证
3. 确保无 secrets 或敏感路径被提交
