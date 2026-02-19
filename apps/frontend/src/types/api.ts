import type { Anime, Blog, Resp, RespWithPage } from "@nickyzj/shared-types";

/**
 * 博客列表请求参数
 */
export type BlogsParams = {
	page?: number;
};

/**
 * 博客列表响应
 */
export type BlogsResp = RespWithPage & {
	list: Blog[];
};

/**
 * 博客详情响应
 */
export type BlogResp = Resp & Blog;

/**
 * 番剧列表请求参数
 */
export type AnimesParams = {
	page?: number;
};

/**
 * 番剧列表响应
 */
export type AnimesResp = RespWithPage & {
	list: Anime[];
};

/**
 * 番剧详情响应
 */
export type AnimeResp = Resp & Anime;
