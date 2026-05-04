import type { Blog } from "@nickyzj2023/shared-types";
import { Hono } from "hono";
import { countStmt, getBySlugStmt, listStmt, watchBlogs } from "@/utils/blogs";
import { fixPageQuery } from "@/utils/common";

// 监听文章目录下的变动，同步到数据库
watchBlogs();

const app = new Hono();

// 获取博客列表
app.get("/", async (c) => {
	const { page, pageSize, offset } = fixPageQuery(c.req.query());

	const list = listStmt.all({
		$limit: pageSize,
		$offset: offset,
	}) as Blog[];

	const countResult = countStmt.get() as { total: number } | undefined;
	const total = countResult?.total ?? 0;
	const totalPages = Math.ceil(total / pageSize);

	return c.json({
		page,
		pageSize,
		total,
		totalPages,
		list,
	});
});

// 获取单篇博客
app.get("/:slug", async (c) => {
	const slug = c.req.param("slug");

	// 从数据库读取文章信息（包含已渲染的 html）
	const blog = getBySlugStmt.get({
		$slug: slug,
	}) as Required<Blog> | undefined;

	if (!blog) {
		return c.text("文章不存在", 404);
	}

	return c.json(blog);
});

export { app as blogs };
