/**
 * 番剧相关类型
 * 前后端共用
 */

/**
 * 番剧基础信息
 */
export type Anime = {
	title: string;
	slug: string;
	season: string;
	eps: number;
	episodes?: string[];
	created_at: string;
	updated_at: string;
};
