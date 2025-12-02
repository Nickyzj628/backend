import { fetcher, timeLog, to } from "@nickyzj2023/utils";
import * as v from "valibot";
import { type DufsJSON, DufsJSONSchema } from "@/types/dufs.js";
import { WEBDAV_URL } from "./constants.js";

/** 修正 req.query 里的常见参数 */
export const formatQuery = (query: Record<string, any> = {}) => {
	const result = structuredClone(query);
	const { page } = result;

	// 修正 page 为正整数
	// 0、1、负数、其他字符都算作1
	if (page !== undefined) {
		let formattedPage = parseInt(page);
		if (formattedPage < 1 || !Number.isSafeInteger(formattedPage)) {
			formattedPage = 1;
		}
		result.page = formattedPage;
	}

	return result;
};

/**
 * 获取目录下的文件列表
 * @param relativePath WebDav文件相对地址，以“/”开头
 * @param sorter 排序函数，默认按修改时间降序排列
 */
export const getFiles = async (
	relativePath: string,
	sorter = (paths: DufsJSON["paths"]) =>
		paths.sort((a, b) => b.mtime - a.mtime),
) => {
	const path = `${WEBDAV_URL}${relativePath}?json`;
	const [error, response] = await to(fetcher().get(path));
	if (error) {
		timeLog(`获取目录${relativePath}下的文件列表失败：${error.message}`);
		return [];
	}

	const validation = v.safeParse(DufsJSONSchema, response);
	if (!validation.success) {
		timeLog(`目录${relativePath}数据结构有误：${validation.issues[0].message}`);
		return [];
	}

	return sorter(validation.output.paths);
};
