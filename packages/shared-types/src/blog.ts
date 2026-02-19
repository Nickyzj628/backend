/**
 * 博客/文章相关类型
 * 前后端共用
 */

/**
 * 博客文章基础信息
 */
export type Blog = {
	title: string;
	slug: string;
	year: number;
	created_at: string;
	updated_at: string;
	html?: string;
};
