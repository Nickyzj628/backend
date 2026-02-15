import { t } from "elysia";
import { array, object, string } from "valibot";

export const ShanbayRawResponseSchema = object({
	id: string(),
	content: string(),
	translation: string(),
	author: string(),
	origin_img_urls: array(string()),
});

export const ShanbayResponseSchema = t.Object({
	id: t.String(),
	content: t.String(),
	translation: t.String(),
	author: t.String(),
	image: t.Optional(t.String()),
});
