import { Elysia } from "elysia";
import {
	maxValue,
	minValue,
	number,
	object,
	optional,
	pipe,
	string,
} from "valibot";
import { BLOGS_DIR } from "@/libs/constants";
import { countStmt, getBySlugStmt, listStmt, watchBlogs } from "@/utils/blogs";
import { renderMarkdown } from "@/utils/markdown";

// 监听文章目录下的改动，同步到数据库
watchBlogs();

export const blogs = new Elysia({ prefix: "/blogs" })
	.get(
		"/",
		async ({ query: { page, pageSize } }) => {
			const offset = (page - 1) * pageSize;

			const totalResult = countStmt.get();
			const total = totalResult?.total ?? 0;
			const totalPages = Math.ceil(total / pageSize);

			const list = listStmt.all({
				$limit: pageSize,
				$offset: offset,
			});

			return {
				page,
				pageSize,
				total,
				totalPages,
				list,
			};
		},
		{
			query: object({
				page: optional(pipe(number(), minValue(1)), 1),
				pageSize: optional(pipe(number(), minValue(1), maxValue(100)), 10),
			}),
		},
	)
	.get(
		"/:slug",
		async ({ params: { slug }, set }) => {
			// 从数据库读取文章信息
			const blog = getBySlugStmt.get({ $slug: slug });

			if (!blog) {
				set.status = 404;
				return "文章不存在";
			}

			// 读取 markdown 文件内容，渲染为 html
			const path = `${BLOGS_DIR}/${blog.year}/${blog.title}.md`;
			const text = await Bun.file(path).text();
			const html = await renderMarkdown(text);

			return { ...blog, html };
		},
		{
			params: object({
				slug: string(),
			}),
		},
	);
