import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { timeLog } from "@nickyzj2023/utils";
import { file } from "bun";
import { Elysia } from "elysia";
import { ALLOWED_ORIGINS, PORT } from "@/libs/constants";
import { animes } from "@/routes/animes";
import { blogs } from "@/routes/blogs";
import { shanbay } from "@/routes/shanbay";

// 创建 ElysiaJS 服务器
const app = new Elysia({
	serve: {
		tls: {
			cert: file("E:/Administrator/Documents/ssl/nickyzj.run_bundle.crt"),
			key: file("E:/Administrator/Documents/ssl/nickyzj.run.key"),
		},
	},
});

// 中间件
app.use(openapi());
app.use(
	cors({
		origin: ALLOWED_ORIGINS,
	}),
);

// 路由
app.get("/", ({ redirect }) => redirect("/openapi"));
app.use(shanbay);
app.use(blogs);
app.use(animes);

// Websocket 放映室
// app.ws("/rooms", {
// 	open: (ws) => {
// 		console.log("WebSocket connection opened to /rooms");
// 		console.log(ws);
// 		// 初始化房间 WebSocket 处理
// 		// setupRoomsWebSocket(ws);
// 	},
// 	message: (ws, message) => {
// 		console.log("Received message:", message);
// 		// 消息处理将在 setupRoomsWebSocket 中定义
// 	},
// 	close: (ws) => {
// 		console.log("WebSocket connection closed");
// 	},
// });

app
	.onStart(({ server }) => {
		timeLog(`服务器已启动：${server?.url}`);
	})
	.listen(PORT);
