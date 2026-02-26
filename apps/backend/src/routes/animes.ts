import type { Anime } from "@nickyzj/shared-types";
import {
	AnimeDetailParamsSchema,
	AnimeListQuerySchema,
} from "@nickyzj/shared-types/schemas";
import { Elysia } from "elysia";
import {
	countStmt,
	getBySlugStmt,
	listStmt,
	watchAnimes,
} from "@/utils/animes";

// 监听番剧目录下的改动，同步到数据库
watchAnimes();

// 辅助函数：规范化分页参数
const normalizePageParams = (
	page: string | undefined,
	pageSize: string | undefined,
) => {
	let normalizedPage = Number(page) || 1;
	let normalizedPageSize = Number(pageSize) || 10;

	// 确保最小值
	if (normalizedPage < 1) normalizedPage = 1;
	if (normalizedPageSize < 1) normalizedPageSize = 10;

	// 限制最大值
	if (normalizedPageSize > 100) normalizedPageSize = 100;

	return { page: normalizedPage, pageSize: normalizedPageSize };
};

export const animes = new Elysia({ prefix: "/animes" })
	.get(
		"/",
		async ({ query }) => {
			const { page, pageSize } = normalizePageParams(
				query.page,
				query.pageSize,
			);
			const offset = (page - 1) * pageSize;

			const countResult = countStmt.get() as { total: number } | undefined;
			const total = countResult?.total ?? 0;
			const totalPages = Math.ceil(total / pageSize);

			const list = listStmt.all({
				$limit: pageSize,
				$offset: offset,
			}) as unknown as Anime[];

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
		},
	)
	.get(
		"/:slug",
		async ({ params: { slug }, set }) => {
			// 从数据库读取番剧信息
			const anime = getBySlugStmt.get({ $slug: slug }) as
				| (Anime & { episodes: string })
				| undefined;

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
		},
	);
