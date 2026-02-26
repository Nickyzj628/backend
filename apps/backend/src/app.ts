import { readFileSync } from "node:fs";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { log } from "@nickyzj2023/utils";
import { Elysia } from "elysia";
import { animes } from "@/routes/animes";
import { blogs } from "@/routes/blogs";
import { rooms } from "@/routes/rooms";
import { shanbay } from "@/routes/shanbay";
import { startBrecTimer } from "@/utils/brec";
import { ALLOWED_ORIGINS, PORT } from "@/utils/constants";

// 创建 ElysiaJS 服务器
const app = new Elysia({
	serve: {
		tls: {
			cert: readFileSync(
				"E:/Administrator/Documents/ssl/nickyzj.run_bundle.crt",
			),
			key: readFileSync("E:/Administrator/Documents/ssl/nickyzj.run.key"),
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

// 常规路由
app.get("/", ({ redirect }) => redirect("/openapi"));
app.use(shanbay);
app.use(blogs);
app.use(animes);

// websocket 路由
app.use(rooms);

// 直播状态推送
let stopBrecTimer = () => {};

app
	.onStart(({ server }) => {
		stopBrecTimer = startBrecTimer();
		log(`服务已启动: ${server?.url}`);
	})
	.onStop(() => {
		stopBrecTimer();
	})
	.listen(PORT);
