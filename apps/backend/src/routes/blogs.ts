import type { Blog } from "@nickyzj/shared-types";
import {
	BlogDetailParamsSchema,
	BlogListQuerySchema,
} from "@nickyzj/shared-types/schemas";
import { Elysia } from "elysia";
import { countStmt, getBySlugStmt, listStmt, watchBlogs } from "@/utils/blogs";
import { fixPageQuery } from "@/utils/common";

// 监听文章目录下的变动，同步到数据库
watchBlogs();

export const blogs = new Elysia({ prefix: "/blogs" })
	.get(
		"/",
		async ({ query }) => {
			const { page, pageSize, offset } = fixPageQuery(query);

			const list = listStmt.all({
				$limit: pageSize,
				$offset: offset,
			}) as Blog[];

			const countResult = countStmt.get() as { total: number } | undefined;
			const total = countResult?.total ?? 0;
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
		},
	)
	.get(
		"/:slug",
		async ({ params: { slug }, set }) => {
			// 从数据库读取文章信息（包含已渲染的 html）
			const blog = getBySlugStmt.get({ $slug: slug }) as
				| Required<Blog>
				| undefined;

			if (!blog) {
				set.status = 404;
				return "文章不存在";
			}

			return blog;
		},
		{
			params: BlogDetailParamsSchema,
		},
	);
