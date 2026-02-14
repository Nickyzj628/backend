import { Elysia, t } from "elysia";
import {
	countStmt,
	getBySlugStmt,
	listStmt,
	watchAnimes,
} from "@/utils/animes";

// 监听文章目录下的改动，同步到数据库
watchAnimes();

export const animes = new Elysia({ prefix: "/animes" })
	.get(
		"/",
		async ({ query: { page = 1, pageSize = 10 } }) => {
			const offset = (page - 1) * pageSize;

			const { total = 0 } = countStmt.get() ?? {};
			const totalPages = Math.ceil(total / pageSize);

			const list = listStmt.all({
				$limit: pageSize,
				$offset: offset,
			});

			return {
				page,
				pageSize,
				total,
				totalPages,
				list,
			};
		},
		{
			query: t.Object({
				page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
				pageSize: t.Optional(
					t.Numeric({ default: 10, minimum: 1, maximum: 100 }),
				),
			}),
		},
	)
	.get(
		"/:slug",
		async ({ params: { slug }, set }) => {
			// 从数据库读取番剧信息
			const anime = getBySlugStmt.get({ $slug: slug });

			if (!anime) {
				set.status = 404;
				return "番剧不存在";
			}

			// 解析 episodes JSON
			anime.episodes = JSON.parse(anime.episodes ?? "[]");

			return anime;
		},
		{
			params: t.Object({
				slug: t.String(),
			}),
		},
	);
