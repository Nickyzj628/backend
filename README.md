# NICKYZJ Monorepo

基于 pnpm 的 monorepo，使用 Hono (Node.js) 后端和 Preact 前端。

## 技术栈

- **后端**: Hono + Node.js + Valibot + SQLite
- **前端**: Preact + Vite + UnoCSS + nanostores/router
- **包管理**: pnpm
- **代码质量**: Biome

## 项目结构

```
.
├── apps/
│   ├── backend/          # Hono API + WebSocket
│   └── frontend/         # Preact SPA
├── biome.json            # 代码质量配置
└── package.json          # 工作区根配置
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 仅启动后端
pnpm dev:backend

# 仅启动前端
pnpm dev:frontend

# 同时启动前后端
pnpm dev

# 构建所有应用
pnpm build

# 代码检查
pnpm check

# 自动修复
pnpm check:write
```

## 后端

位于 `apps/backend/`，使用 Hono 框架。

```bash
cd apps/backend
pnpm dev        # 开发模式 (tsx watch)
pnpm build      # 打包
pnpm start      # 运行构建版本
```

使用 Node.js 原生 `--env-file=.env` 加载环境变量。

## 前端

位于 `apps/frontend/`，使用 Preact + Vite。

```bash
cd apps/frontend
pnpm dev        # 开发服务器
pnpm build      # 生产构建
pnpm preview    # 预览构建结果
```

## 开发规范

详见 `AGENTS.md`。

- **代码风格**: Biome 配置 (Tab 缩进, 双引号, 必须分号)
- **命名规范**: camelCase (变量/函数), PascalCase (类/类型/组件)
- **导入规范**: 使用 `@/` 别名
