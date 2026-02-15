import { fetcher, to, withCache } from "@nickyzj2023/utils";
import { Elysia, t } from "elysia";
import { safeParse } from "valibot";
import {
	ShanbayRawResponseSchema,
	ShanbayResponseSchema,
} from "@/types/shanbay";

const get = withCache(
	fetcher("https://apiv3.shanbay.com/weapps").get,
	28800, // 缓存 8 小时
);

export const shanbay = new Elysia({ prefix: "/shanbay" }).get(
	"/",
	async ({ set }) => {
		const [error, response] = await to(get("/dailyquote/quote"));
		if (error) {
			set.status = 500;
			return `查询扇贝每日一句失败: ${error.message}`;
		}

		const validation = safeParse(ShanbayRawResponseSchema, response);
		if (!validation.success) {
			set.status = 400;
			return `查询扇贝每日一句失败: ${validation.issues[0].message}`;
		}

		const { output } = validation;
		return {
			id: output.id,
			content: output.content,
			translation: output.translation,
			author: output.author,
			image: output.origin_img_urls[0],
		};
	},
	{
		response: {
			200: ShanbayResponseSchema,
			400: t.String(),
			500: t.String(),
		},
	},
);
