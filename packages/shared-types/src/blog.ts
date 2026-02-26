/** 博客文章信息，列表/详情通用 */
export type Blog = {
	title: string;
	slug: string;
	year: number;
	created_at: string;
	updated_at: string;
	html?: string;
};
