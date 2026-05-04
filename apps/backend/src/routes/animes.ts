import type { Anime } from "@nickyzj2023/shared-types";
import { Hono } from "hono";
import {
	countStmt,
	getBySlugStmt,
	listStmt,
	watchAnimes,
} from "@/utils/animes";
import { fixPageQuery } from "@/utils/common";

// 监听番剧目录下的改动，同步到数据库
watchAnimes();

const app = new Hono();

// 获取番剧列表
app.get("/", async (c) => {
	const { page, pageSize, offset } = fixPageQuery(c.req.query());

	const countResult = countStmt.get() as { total: number } | undefined;
	const total = countResult?.total ?? 0;
	const totalPages = Math.ceil(total / pageSize);

	const list = listStmt.all({
		$limit: pageSize,
		$offset: offset,
	}) as unknown as Anime[];

	return c.json({
		page,
		pageSize,
		total,
		totalPages,
		list,
	});
});

// 获取单个番剧
app.get("/:slug", async (c) => {
	const slug = c.req.param("slug");

	// 从数据库读取番剧信息
	const anime = getBySlugStmt.get({ $slug: slug }) as
		| Required<Anime>
		| undefined;

	if (!anime) {
		return c.text("番剧不存在", 404);
	}

	// 解析 episodes JSON，转换成 string[]
	const episodesRaw = JSON.parse(String(anime.episodes) ?? "[]");
	const episodes = Array.isArray(episodesRaw) ? episodesRaw.map(String) : [];

	return c.json({
		...anime,
		episodes,
	});
});

export { app as animes };
