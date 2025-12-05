import { fetcher, timeLog, to } from "@nickyzj2023/utils";
import { safeParse } from "valibot";
import {
	type WebDavFile,
	WebDavFileResponseSchema,
	WebDavListResponseSchema,
} from "@/types/openlist.js";
import { WEBDAV_URL } from "./constants.js";

const webdav = fetcher(`${WEBDAV_URL}/api`);

/** 修正 req.query 里的常见参数 */
export const formatQuery = (query: Record<string, any> = {}) => {
	const result = { ...query };

	// 修正 page 为正整数
	// 0、1、负数、其他字符都算作1
	if ("page" in query) {
		let formattedPage = parseInt(query.page, 10);
		if (formattedPage < 1 || !Number.isInteger(formattedPage)) {
			formattedPage = 1;
		}
		result.page = formattedPage;
	}

	return result;
};

/**
 * 获取目录下的文件列表
 * @param path WebDav 目录相对地址，以“/”开头
 * @param sorter 排序函数，用于对列出的文件排序，默认按修改时间降序
 */
export const getFiles = async (
	path: string,
	sorter?: (a: WebDavFile, b: WebDavFile) => number,
) => {
	const [error, response] = await to(webdav.post("/fs/list", { path }));
	if (error) {
		timeLog(`获取目录${path}下的文件列表失败：${error.message}`);
		return [];
	}

	const validation = safeParse(WebDavListResponseSchema, response);
	if (!validation.success) {
		timeLog(`目录${path}数据结构有误：${validation.issues[0].message}`);
		return [];
	}

	const { output } = validation;
	if (output.code !== 200) {
		timeLog(`获取目录${path}下的文件列表失败：${output.message}`);
		return [];
	}

	if (sorter) {
		return output.data.content.sort(sorter);
	}
	return output.data.content;
};

/**
 * 获取文件信息
 * @param path WebDav 文件相对地址，以“/”开头
 */
export const getFile = async (path: string) => {
	const response = await webdav.post("/fs/get", { path });

	const validation = safeParse(WebDavFileResponseSchema, response);
	if (!validation.success) {
		throw Error(validation.issues[0].message);
	}

	const { output } = validation;
	if (output.code !== 200) {
		throw Error(output.message);
	}

	return output.data;
};
