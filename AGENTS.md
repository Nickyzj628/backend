# Repository Guidelines

## 项目结构与模块组织
- 核心源码位于 `src/`。
- `src/app.ts` 是 Elysia 应用入口，负责中间件与路由注册。
- 路由模块在 `src/routes/`（如 `animes.ts`、`blogs.ts`、`shanbay.ts`、`rooms.ts`）。
- 公共配置与中间件在 `src/libs/`（如 `constants.ts`、`middlewares.ts`）。
- 类型与校验模型在 `src/types/`，通用工具在 `src/utils/`。
- 运行数据在 `data/`（`data/sqlite.db`），构建产物输出到 `dist/`。

## 构建、测试与开发命令
- `bun run dev`：开发模式启动，监听 `src/app.ts` 变更。
- `bun run build`：构建生产包到 `dist/`。
- `bun run start`：运行构建后的 `dist/app.js`。
- `bunx biome check .`：执行代码检查与风格校验。
- `bunx biome format .`：格式化全部文件。
- `bunx biome check --write .`：自动修复可修复问题。

## 代码风格与命名规范
- 使用 TypeScript（ESM）+ Bun 运行时。
- 格式化工具为 Biome；默认使用制表符缩进与双引号。
- 文件名使用小写，并按功能分组，例如 `routes/blogs.ts`、`types/blogs.ts`。
- 路由文件专注于 HTTP/WebSocket 行为，公共常量集中维护在 `src/libs/constants.ts`。
- 避免在业务代码中新增分散的硬编码路径。

## 测试指南
- 当前仓库未配置专用自动化测试框架。
- 提交前至少执行 `bunx biome check .`，并通过 `bun run dev` 手动验证变更接口。
- 若新增测试，建议采用 `*.test.ts` 命名，放在模块旁或未来的 `tests/` 目录，并在 `package.json` 中补充运行脚本。

## 提交与 Pull Request 规范
- 提交信息遵循 Conventional Commits：`feat(scope): ...`、`fix(scope): ...`、`chore: ...`、`refactor: ...`。
- 每次提交只做一类逻辑变更，保持可回溯。
- PR 应包含：变更目的、影响范围（如 `src/routes/blogs.ts`）、本地验证步骤与结果、接口变更示例（请求/响应）。

## 安全与配置建议
- 部署前检查 TLS/WebDAV 等环境相关硬编码路径。
- 禁止提交密钥、证书或其他敏感信息。
- 按环境复核 `src/libs/constants.ts` 中 CORS 与 WebDAV 配置。
