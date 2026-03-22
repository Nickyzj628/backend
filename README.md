男生自用个人网站，总体是基于pnpm的monorepo仓库，前端是Preact，后端是Hono。

## 具体技术栈

- **前端**: TypeScript 7、Vite 8、Preact 11、UnoCSS、Nano Stores
- **后端**: Node.js、Hono、SQLite、Valibot
- **包管理器**: pnpm
- **代码质量、格式化工具**: Oxlint、Oxfmt

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

# 同时启动前后端（开发环境）
pnpm dev
# 仅启动前端（开发环境）
pnpm dev:frontend
# 仅启动后端（开发环境）
pnpm dev:backend

# 预览前端（测试环境）
pnpm start:frontend
# 预览后端（测试环境）
pnpm start:backend
# 预览后端（生产环境）
pnpm start:backend:prod

# 构建所有应用（开发环境）
pnpm build
# 仅构建前端
pnpm build:frontend
# 仅构建后端
pnpm build:backend

# 构建所有应用（生产环境）
pnpm build:prod
# 仅构建前端
pnpm build:frontend:prod
# 仅构建后端
pnpm build:backend:prod

# 代码检查
pnpm check
# 自动修复代码
pnpm check:write
```

## 开发规范

详见 `CLAUDE.md`。
