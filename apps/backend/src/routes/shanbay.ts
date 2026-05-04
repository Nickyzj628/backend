import type { Shanbay } from "@nickyzj2023/shared-types";
import { fetcher, to, withCache } from "@nickyzj2023/utils";
import { Hono } from "hono";
import { safeParse } from "valibot";
import { ShanbayRawResponseSchema } from "@/types/shanbay";

const get = withCache(
	fetcher("https://apiv3.shanbay.com/weapps").get,
	28800, // 缓存 8 小时
);

const app = new Hono();

app.get("/", async (c) => {
	const [error, response] = await to(get("/dailyquote/quote"));
	if (error) {
		return c.text(`查询扇贝每日一句失败: ${error.message}`, 500);
	}

	const validation = safeParse(ShanbayRawResponseSchema, response);
	if (!validation.success) {
		return c.text(`查询扇贝每日一句失败: ${validation.issues[0].message}`, 400);
	}

	const { output } = validation;
	return c.json({
		content: output.content,
		translation: output.translation,
		author: output.author,
		image: output.origin_img_urls[0],
	} satisfies Shanbay);
});

export { app as shanbay };
