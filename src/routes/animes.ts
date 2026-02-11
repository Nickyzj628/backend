import { Elysia } from "elysia";
import {
	maxValue,
	minValue,
	number,
	object,
	optional,
	pipe,
	string,
} from "valibot";
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
		async ({ query: { page, pageSize } }) => {
			const offset = (page - 1) * pageSize;

			const totalResult = countStmt.get();
			const total = totalResult?.total ?? 0;
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
			query: object({
				page: optional(pipe(number(), minValue(1)), 1),
				pageSize: optional(pipe(number(), minValue(1), maxValue(100)), 10),
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
			params: object({
				slug: string(),
			}),
		},
	);
