import { Resp, RespWithPage } from "./api.ts";

/** 博客文章信息，列表/详情通用 */
export type Blog = {
	title: string;
	slug: string;
	year: number;
	created_at: string;
	updated_at: string;
	/** 文章的 HTML，仅 GET /blogs/{slugs} 携带 */
	html?: string;
};

/** GET /blogs 查询参数 */
export type BlogsParams = {
	page?: number;
};

/** GET /blogs 响应结果 */
export type BlogsResp = RespWithPage & {
	list: Blog[];
};

/** GET /blogs/{slug} 响应结果 */
export type BlogResp = Resp & Blog;
