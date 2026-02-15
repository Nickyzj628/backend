import { t } from "elysia";

export const BlogItemSchema = t.Object({
	title: t.String(),
	slug: t.String(),
	year: t.Number(),
	created_at: t.String(),
	updated_at: t.String(),
});

export type BlogItem = typeof BlogItemSchema.static;

export const BlogListQuerySchema = t.Object({
	page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
	pageSize: t.Optional(t.Numeric({ default: 10, minimum: 1, maximum: 100 })),
});

export const BlogListResponseSchema = t.Object({
	page: t.Number(),
	pageSize: t.Number(),
	total: t.Number(),
	totalPages: t.Number(),
	list: t.Array(BlogItemSchema),
});

export const BlogDetailQuerySchema = t.Object({
	slug: t.String(),
});

export const BlogDetailResponseSchema = t.Object({
	...BlogItemSchema.properties,
	html: t.String(),
});
