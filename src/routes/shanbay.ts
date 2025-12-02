import { fetcher, to, withCache } from "@nickyzj2023/utils";
import { Router } from "express";
import { array, object, pipe, safeParse, string, transform } from "valibot";

const router = Router();

const Schema = pipe(
	object({
		id: string(),
		content: string(),
		translation: string(),
		author: string(),
		origin_img_urls: array(string()),
	}),
	transform((input) => {
		const { origin_img_urls, ...props } = input;
		return {
			...props,
			image: origin_img_urls[0],
		};
	}),
);

const get = withCache(
	fetcher("https://apiv3.shanbay.com/weapps").get,
	86400 /* 缓存一天 */,
);

router.get("/", async (req, res) => {
	const [error, response] = await to(get("/dailyquote/quote"));
	if (error) {
		res.fail(`查询扇贝每日一句失败: ${error.message}`);
		return;
	}

	const validation = safeParse(Schema, response);
	if (!validation.success) {
		res.fail(`扇贝每日一句数据结构有误: ${validation.issues[0].message}`);
		return;
	}

	res.success(validation.output);
});

export default router;
