/**
 * 番剧相关 Valibot Schemas
 * 供后端 Elysia 验证使用
 */

import * as v from "valibot";

/**
 * 番剧列表查询参数 Schema
 */
export const AnimeListQuerySchema = v.object({
	page: v.optional(v.string()),
	pageSize: v.optional(v.string()),
});

/**
 * 番剧列表查询参数类型
 */
export type AnimeListQuery = v.InferOutput<typeof AnimeListQuerySchema>;

/**
 * 番剧详情路径参数 Schema
 */
export const AnimeDetailParamsSchema = v.object({
	slug: v.string(),
});

/**
 * 番剧详情路径参数类型
 */
export type AnimeDetailParams = v.InferOutput<typeof AnimeDetailParamsSchema>;

/**
 * 番剧列表响应 Schema
 */
export const AnimeListResponseSchema = v.object({
	page: v.number(),
	pageSize: v.number(),
	total: v.number(),
	totalPages: v.number(),
	list: v.array(
		v.object({
			title: v.string(),
			slug: v.string(),
			season: v.string(),
			eps: v.number(),
			episodes: v.optional(v.string()),
			created_at: v.string(),
			updated_at: v.string(),
		}),
	),
});

/**
 * 番剧列表响应类型
 */
export type AnimeListResponse = v.InferOutput<typeof AnimeListResponseSchema>;

/**
 * 番剧详情响应 Schema
 */
export const AnimeDetailResponseSchema = v.object({
	title: v.string(),
	slug: v.string(),
	season: v.string(),
	eps: v.number(),
	episodes: v.array(v.string()),
	created_at: v.string(),
	updated_at: v.string(),
});

/**
 * 番剧详情响应类型
 */
export type AnimeDetailResponse = v.InferOutput<typeof AnimeDetailResponseSchema>;
