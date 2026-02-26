/**
 * 博客/文章相关 Valibot Schemas
 * 供后端 Elysia 验证使用
 */

import * as v from "valibot";

/**
 * 博客列表查询参数 Schema
 */
export const BlogListQuerySchema = v.object({
	page: v.optional(v.string()),
	pageSize: v.optional(v.string()),
});

/**
 * 博客列表查询参数类型
 */
export type BlogListQuery = v.InferOutput<typeof BlogListQuerySchema>;

/**
 * 博客详情查询参数 Schema
 */
export const BlogDetailParamsSchema = v.object({
	slug: v.string(),
});

/**
 * 博客详情查询参数类型
 */
export type BlogDetailParams = v.InferOutput<typeof BlogDetailParamsSchema>;

/**
 * 博客列表响应 Schema
 */
export const BlogListResponseSchema = v.object({
	page: v.number(),
	pageSize: v.number(),
	total: v.number(),
	totalPages: v.number(),
	list: v.array(
		v.object({
			title: v.string(),
			slug: v.string(),
			year: v.number(),
			created_at: v.string(),
			updated_at: v.string(),
		}),
	),
});

/**
 * 博客列表响应类型
 */
export type BlogListResponse = v.InferOutput<typeof BlogListResponseSchema>;

/**
 * 博客详情响应 Schema
 */
export const BlogDetailResponseSchema = v.object({
	title: v.string(),
	slug: v.string(),
	year: v.number(),
	created_at: v.string(),
	updated_at: v.string(),
	html: v.string(),
});

/**
 * 博客详情响应类型
 */
export type BlogDetailResponse = v.InferOutput<typeof BlogDetailResponseSchema>;
