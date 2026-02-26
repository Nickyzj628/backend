/**
 * 通用 API 相关 Valibot Schemas
 * 供后端 Elysia 验证使用
 */

import * as v from "valibot";

/**
 * 基础响应 Schema
 */
export const RespSchema = v.object({
	statusCode: v.number(),
	message: v.string(),
});

/**
 * 基础响应类型
 */
export type Resp = v.InferOutput<typeof RespSchema>;

/**
 * 分页响应 Schema
 */
export const RespWithPageSchema = v.object({
	statusCode: v.number(),
	message: v.string(),
	page: v.number(),
	pageSize: v.number(),
	total: v.number(),
	totalPages: v.number(),
});

/**
 * 分页响应类型
 */
export type RespWithPage = v.InferOutput<typeof RespWithPageSchema>;

/**
 * 404 错误响应 Schema
 */
export const NotFoundResponseSchema = v.string();
