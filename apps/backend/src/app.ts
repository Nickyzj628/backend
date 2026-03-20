import { readFileSync } from "node:fs";
import { createServer } from "node:https";
import { type ServerType, serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { log } from "@nickyzj2023/utils";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { animes } from "@/routes/animes";
import { blogs } from "@/routes/blogs";
import createRoomsRouter from "@/routes/rooms";
import { shanbay } from "@/routes/shanbay";
import { ALLOWED_ORIGINS, PORT } from "@/utils/constants";

// 等待服务器启动的 Promise
const waitForServer = (server: ServerType) => {
  return new Promise((resolve) => {
    server.on("listening", resolve);
  });
};

// 异步启动函数
const boot = async () => {
  // 创建 Hono 应用
  const app = new Hono();

  // CORS 中间件
  app.use(
    cors({
      origin: ALLOWED_ORIGINS,
      allowHeaders: ["Authorization"],
      credentials: true,
    }),
  );

  // 注册常规路由
  app.route("/shanbay", shanbay);
  app.route("/blogs", blogs);
  app.route("/animes", animes);

  // 注册 WebSocket 路由
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });
  const roomsRouter = createRoomsRouter(upgradeWebSocket);
  app.route("/rooms", roomsRouter);

  // 使用 @hono/node-server 创建 HTTPS 服务器 (HTTP/1.1 以支持 WebSocket)
  const server = serve({
    fetch: app.fetch,
    port: PORT,
    createServer: createServer,
    serverOptions: {
      cert: readFileSync("E:/Administrator/Documents/ssl/nickyzj.run_bundle.crt"),
      key: readFileSync("E:/Administrator/Documents/ssl/nickyzj.run.key"),
    },
  });

  // 注入 WebSocket 支持
  injectWebSocket(server);

  // 等待服务器真正启动
  await waitForServer(server);
  log(`服务器已启动: https://localhost:${PORT}`);

  // 优雅关闭
  process.on("SIGINT", () => {
    log("服务器即将关闭");
    server.close(() => {
      process.exit(0);
    });
  });
};

// 启动应用
boot().catch((err) => {
  log(["服务器启动失败", err]);
  process.exit(1);
});
