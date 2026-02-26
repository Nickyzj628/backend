/** 番剧信息，列表/详情通用 */
export type Anime = {
	title: string;
	slug: string;
	season: string;
	eps: number;
	episodes?: string[];
	created_at: string;
	updated_at: string;
};
