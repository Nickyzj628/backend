import type { Resp, RespWithPage } from "./api.ts";

/** 番剧信息，列表/详情通用 */
export type Anime = {
	title: string;
	slug: string;
	season: string;
	/** 集数 */
	eps: number;
	/** 每集的文件名，仅 GET /animes/{slug} 携带 */
	episodes?: string[];
	created_at: string;
	updated_at: string;
};

/** GET /animes 查询参数 */
export type AnimesParams = {
	page?: number;
};

/** GET /animes 响应结果 */
export type AnimesResp = RespWithPage & {
	list: Anime[];
};

/** GET /animes/{slug} 响应结果 */
export type AnimeResp = Resp & Anime;
