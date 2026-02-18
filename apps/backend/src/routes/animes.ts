import { Elysia, t } from "elysia";
import {
	AnimeDetailParamsSchema,
	AnimeDetailResponseSchema,
	AnimeListQuerySchema,
	AnimeListResponseSchema,
} from "@/types/animes";
import {
	countStmt,
	getBySlugStmt,
	listStmt,
	watchAnimes,
} from "@/utils/animes";

// 监听番剧目录下的改动，同步到数据库
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
			query: AnimeListQuerySchema,
			response: {
				200: AnimeListResponseSchema,
			},
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

			// 解析 episodes JSON，转换成 string[]
			const episodesData = JSON.parse(anime.episodes ?? "[]");
			const episodes = Array.isArray(episodesData)
				? episodesData.map((item) => String(item))
				: [];

			return {
				...anime,
				episodes,
			};
		},
		{
			params: AnimeDetailParamsSchema,
			response: {
				200: AnimeDetailResponseSchema,
				404: t.String(),
			},
		},
	);
