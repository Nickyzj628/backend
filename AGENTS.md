# AGENTS.md

本项目是 nickyzj 的个人后端服务，基于 ElysiaJS 框架构建，使用 Bun 运行时。

## 项目概述

- **项目名称**: nickyzj_backend
- **运行时**: Bun (JavaScript/TypeScript)
- **Web 框架**: ElysiaJS
- **数据库**: SQLite (bun:sqlite)
- **主要功能**:
  - 动漫资源管理（通过 WebDAV 访问）
  - 博客文章管理（SQLite + 文件监听）
  - 扇贝每日一句 API 代理
  - WebSocket 放映室（房间系统，支持同步播放）

## 技术栈

- **核心框架**: [ElysiaJS](https://elysiajs.com/) - 高性能 TypeScript Web 框架
- **运行时**: [Bun](https://bun.sh/) - 快速 JavaScript 运行时
- **数据库**: SQLite (通过 `bun:sqlite` 内置模块)
- **验证库**: [Valibot](https://valibot.dev/) - 类型安全的 schema 验证
- **文件监听**: [chokidar](https://github.com/paulmillr/chokidar) - 文件系统监听
- **图像处理**: [sharp](https://sharp.pixelplumbing.com/) - 高性能图像处理
- **CORS**: @elysiajs/cors
- **API 文档**: @elysiajs/openapi + @valibot/to-json-schema
- **工具库**: @nickyzj2023/utils (内部工具包)
- **代码规范**: [Biome](https://biomejs.dev/) - 快速格式化器和 linter

## 项目结构

```
.
├── src/
│   ├── app.ts              # 应用入口，服务器配置和路由注册
│   ├── libs/
│   │   ├── constants.ts    # 全局常量配置（端口、路径、CORS 等）
│   │   ├── middlewares.ts  # 自定义中间件（响应封装）
│   │   └── utils.ts        # 工具函数（WebDAV 操作、查询格式化）
│   ├── routes/
│   │   ├── animes.ts       # 动漫资源路由
│   │   ├── blogs.ts        # 博客文章路由
│   │   ├── rooms.ts        # WebSocket 放映室逻辑
│   │   └── shanbay.ts      # 扇贝每日一句 API 代理
│   └── types/
│       ├── blogs.ts        # 博客相关类型
│       ├── dufs.ts         # DUFS (WebDAV) 类型定义
│       ├── openlist.ts     # OpenList WebDAV 响应类型
│       └── sqlite.ts       # SQLite 查询结果类型
├── data/
│   └── sqlite.db           # SQLite 数据库文件
├── dist/                   # 构建输出目录
├── package.json            # 项目配置和依赖
├── tsconfig.json           # TypeScript 配置
├── biome.json              # Biome 代码规范配置
└── AGENTS.md               # 本文件
```

## 构建和运行命令

```bash
# 开发模式（热重载）
bun run dev

# 构建生产版本
bun run build

# 运行生产版本
bun run start
```

## 代码规范

项目使用 Biome 进行代码格式化和 lint：

- **缩进**: Tab
- **引号**: 双引号
- **严格模式**: 启用
- **特殊规则**:
  - `noUnusedVariables`: 关闭（允许未使用变量）
  - `noExplicitAny`: 关闭（允许显式 any）
  - `noNonNullAssertion`: 关闭（允许非空断言）
  - `useTemplate`: 关闭（不强制使用模板字符串）

### 检查和修复代码

```bash
# 检查代码
bunx biome check .

# 格式化代码
bunx biome format .

# 自动修复问题
bunx biome check --write .
```

## 路由模块说明

### /animes - 动漫资源

- 从 WebDAV 读取动漫目录结构
- 支持按季度分页浏览
- 支持上传封面图片（转换为 webp）

### /blogs - 博客文章

- 使用 SQLite 存储文章元数据
- 通过 chokidar 监听 WebDAV 中的 Markdown 文件变更
- 自动同步文件创建、修改、删除事件到数据库

### /shanbay - 扇贝每日一句

- 代理扇贝 API
- 缓存 8 小时
- 数据格式转换（下划线转驼峰）

### /rooms - WebSocket 放映室（已注释）

- 房间创建/加入
- 房主权限管理
- 视频同步播放控制（播放、暂停、跳转、倍速、换集）
- 房间聊天消息

## 配置常量

位于 `src/libs/constants.ts`：

| 常量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务器端口 | 3031 |
| `ALLOWED_ORIGINS` | 允许的 CORS 源 | localhost:5173, nickyzj.run:2334 |
| `DEFAULT_PAGE_SIZE` | 默认分页大小 | 10 |
| `WEBDAV_URL` | WebDAV 服务器地址 | https://nickyzj.run:2020 |
| `WEBDAV_PATH` | WebDAV 本地路径 | E:/Storage |

## 环境要求

- **Bun**: 最新版本
- **TLS 证书**: 服务器配置使用硬编码路径 `E:/Administrator/Documents/ssl/`
- **WebDAV 服务**: 需要配合 OpenList/DUFS 服务使用

## 注意事项

1. **硬编码路径**: 项目中有多个硬编码的绝对路径（TLS 证书、WebDAV 路径），需要根据实际环境调整
2. **WebSocket 功能**: 当前代码中 WebSocket 路由已注释，如需启用需取消 `app.ts` 中的相关注释
3. **数据库**: SQLite 数据库文件位于 `data/sqlite.db`，首次运行会自动创建表结构
4. **文件监听**: 博客模块依赖 chokidar 监听 WebDAV 目录，确保路径正确配置

## 类型定义

项目使用 Valibot 进行运行时类型验证，主要 schema 定义在 `src/types/` 目录：

- `WebDavFile`: WebDAV 文件/目录结构
- `WebDavListResponseSchema`: 目录列表响应
- `BlogItem`: 博客文章元数据
- `DufsJSONSchema`: DUFS WebDAV 服务响应格式
