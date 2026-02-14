import { Elysia, t } from "elysia";
import { BLOGS_DIR } from "@/libs/constants";
import { countStmt, getBySlugStmt, listStmt, watchBlogs } from "@/utils/blogs";
import { renderMarkdown } from "@/utils/markdown";

// 监听文章目录下的改动，同步到数据库
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
			query: t.Object({
				page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
				pageSize: t.Optional(
					t.Numeric({ default: 10, minimum: 1, maximum: 100 }),
				),
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
			params: t.Object({
				slug: t.String(),
			}),
		},
	);
