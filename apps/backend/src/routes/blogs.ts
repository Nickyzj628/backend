import { Elysia, t } from "elysia";
import {
	BlogDetailQuerySchema,
	BlogDetailResponseSchema,
	BlogListQuerySchema,
	BlogListResponseSchema,
} from "@/types/blogs";
import { countStmt, getBySlugStmt, listStmt, watchBlogs } from "@/utils/blogs";

// 监听文章目录下的变动，同步到数据库
watchBlogs();

export const blogs = new Elysia({ prefix: "/blogs" })
	.get(
		"/",
		async ({ query: { page = 1, pageSize = 10 } }) => {
			const offset = (page - 1) * pageSize;

			const list = listStmt.all({
				$limit: pageSize,
				$offset: offset,
			});

			const { total = 0 } = countStmt.get() ?? {};
			const totalPages = Math.ceil(total / pageSize);

			return {
				page,
				pageSize,
				total,
				totalPages,
				list,
			};
		},
		{
			query: BlogListQuerySchema,
			response: {
				200: BlogListResponseSchema,
			},
		},
	)
	.get(
		"/:slug",
		async ({ params: { slug }, set }) => {
			// 从数据库读取文章信息（包含已渲染的 html）
			const blog = getBySlugStmt.get({ $slug: slug });

			if (!blog) {
				set.status = 404;
				return "文章不存在";
			}

			return blog;
		},
		{
			params: BlogDetailQuerySchema,
			response: {
				200: BlogDetailResponseSchema,
				404: t.String(),
			},
		},
	);
