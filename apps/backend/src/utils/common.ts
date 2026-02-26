import { dirname } from "node:path";
import { pinyin } from "pinyin-pro";

/**
 * 把文字转换成 URL 友好的形式
 * @example
 * textToSlug("React Compiler 1.0上手体验") // => react-compiler-1.0-shang-shou-ti-yan
 */
export const textToSlug = (text: string) => {
	if (!text) {
		return text;
	}

	return pinyin(text, {
		separator: "-",
		toneType: "none",
		nonZh: "consecutive",
	})
		.replaceAll(" ", "-")
		.replaceAll("--", "-")
		.toLowerCase();
};

/**
 * 从文件路径中提取年份
 * @example
 * extractYearFromPath("Nickyzj/Blogs/2025/React Compiler 1.0上手体验.md") // => 2025
 */
export const extractYearFromPath = (filePath: string) => {
	// 根据目录名从后往前提取年份
	const dir = dirname(filePath);
	const yearStr = dir.split(/[/\\]/).findLast((part) => /^\d{4}$/.test(part));

	// 尝试解析为数字
	const year = yearStr ? parseInt(yearStr, 10) : NaN;

	// 如果解析失败，返回当前年份
	return Number.isNaN(year) ? new Date().getFullYear() : year;
};

/**
 * 获取指定日期所在年月
 * @example
 * getFullSeason(new Date("2026-02-08")) // => 202602
 */
export const getFullYearMonth = (date = new Date()) => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	return `${year}${month.toString().padStart(2, "0")}`;
};

/**
 * 从文件路径中提取季度
 * @example
 * extractSeasonFromPath("Nickyzj/Animes/202601/超时空辉夜姬！") // => 202601
 */
export const extractSeasonFromPath = (filePath: string) => {
	// 根据目录名从后往前提取季度
	const dir = dirname(filePath);
	const season = dir.split(/[/\\]/).findLast((part) => /^\d{6}$/.test(part));

	// 如果解析失败，返回当前季度
	return season || getFullYearMonth();
};

/**
 * 修正分页相关参数
 * @example
 * new Elysia().get("/", ({ query }) => {
 *  const { page, pageSize } = fixPageQuery(query);
 * });
 */
export const fixPageQuery = (params: { page?: string; pageSize?: string }) => {
	let page = Number(params.page) || 1;
	let pageSize = Number(params.pageSize) || 10;

	// 确保最小值
	if (page < 1) page = 1;
	if (pageSize < 1) pageSize = 10;

	// 限制最大值
	if (pageSize > 100) pageSize = 100;

	// 顺带计算查表时可能用到的 offset 值
	const offset = (page - 1) * pageSize;

	return { page, pageSize, offset };
};
