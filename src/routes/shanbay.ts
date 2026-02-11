import {
	fetcher,
	mapKeys,
	type SnakeToCamel,
	snakeToCamel,
	to,
	withCache,
} from "@nickyzj2023/utils";
import { Elysia } from "elysia";
import { array, object, pipe, safeParse, string, transform } from "valibot";

const Schema = pipe(
	// 定义后端返回类型
	object({
		id: string(),
		content: string(),
		translation: string(),
		author: string(),
		origin_img_urls: array(string()),
	}),
	// 转换字段名为驼峰式
	transform(
		(input) =>
			mapKeys(input, snakeToCamel) as {
				[K in keyof typeof input as SnakeToCamel<K>]: (typeof input)[K];
			},
	),
	// 处理 originImgUrls，只保留其中一张图片
	transform((input) => {
		const { originImgUrls, ...props } = input;
		return {
			...props,
			image: originImgUrls[0],
		};
	}),
);

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

		const validation = safeParse(Schema, response);
		if (!validation.success) {
			set.status = 400;
			return `查询扇贝每日一句失败: ${validation.issues[0].message}`;
		}

		return validation.output;
	},
);
