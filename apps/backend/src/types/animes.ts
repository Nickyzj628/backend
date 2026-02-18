import { t } from "elysia";

export const AnimeItemSchema = t.Object({
	title: t.String(),
	slug: t.String(),
	season: t.String(),
	eps: t.Number(),
	episodes: t.Optional(t.String()),
	created_at: t.String(),
	updated_at: t.String(),
});

export type AnimeItem = typeof AnimeItemSchema.static;

export const AnimeListQuerySchema = t.Object({
	page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
	pageSize: t.Optional(t.Numeric({ default: 10, minimum: 1, maximum: 100 })),
});

export const AnimeListResponseSchema = t.Object({
	page: t.Number(),
	pageSize: t.Number(),
	total: t.Number(),
	totalPages: t.Number(),
	list: t.Array(AnimeItemSchema),
});

export const AnimeDetailParamsSchema = t.Object({
	slug: t.String(),
});

export const AnimeDetailResponseSchema = t.Object({
	...AnimeItemSchema.properties,
	episodes: t.Array(t.String()),
});
