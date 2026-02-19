import dayjs, { type ConfigType } from "dayjs";
import { removeSpaces } from "./string";

/**
 * 获取当前时间段
 * @example
 * getPeriod(); // "晚上"
 */
export const getPeriod = () => {
	const hour = new Date().getHours();
	if (hour < 6) return "凌晨";
	if (hour >= 6 && hour <= 8) return "早上";
	if (hour >= 9 && hour <= 11) return "上午";
	if (hour === 12) return "中午";
	if (hour >= 13 && hour <= 17) return "下午";
	if (hour >= 18 && hour <= 19) return "傍晚";
	return "晚上";
};

/**
 * 计算给定时间距离现在有多久（语义化）
 * @param date dayjs 支持的时间格式
 * @example
 * fromNow("2023-01-01"); // "1天前"
 */
export const fromNow = (date: ConfigType) => {
	return removeSpaces(dayjs(date).fromNow());
};
