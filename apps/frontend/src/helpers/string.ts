/**
 * 拼接 className
 * @param classNames 多个 className，只接受字符串，其他值会被过滤
 * @returns 拼接后的className
 * @example
 * // "flex items-center justify-between"
 * clsx("flex items-center", true && "justify-between", false && "flex-1", null)
 */
export const clsx = (...classNames: any[]) => {
	return classNames
		.filter(
			(className) => typeof className === "string" && className.length > 0,
		)
		.join(" ");
};

/**
 * 仅针对 URL 查询字符串的解析和序列化
 * @example
 * qs.parse("?a=1&b=2") // { a: 1, b: 2 }
 * qs.stringify({ a: 1, b: 2 }, { addQueryPrefix: true }) // "?a=1&b=2"
 */
export const qs = {
	parse: (queryString: string) => {
		const searchParams = new URLSearchParams(queryString);
		const result: Recordable = {};

		for (const [key, value] of searchParams) {
			// 特殊处理数字字符串为数字
			if (!isNaN(Number(value))) {
				result[key] = Number(value);
			} else {
				result[key] = value;
			}
		}

		return result;
	},
	stringify: (params: Recordable, options?: { addQueryPrefix: boolean }) => {
		const { addQueryPrefix } = options ?? {};
		const searchParams = new URLSearchParams(params);
		const queryString = searchParams.toString();
		return addQueryPrefix ? `?${queryString}` : queryString;
	},
};

/**
 * 去除字符串中的所有空格
 * @param string 任意字符串
 * @returns 去除全部空格后的字符串
 * @example
 * removeSpaces("a b c") // "abc"
 */
export const removeSpaces = (string: string) => {
	return string.replaceAll(" ", "");
};

/**
 * 首字母大写
 * @param string 任意字符串
 * @returns 首字母大写后的字符串
 * @example
 * capitalize("hello world") // "Hello world"
 */
export const capitalize = (string: string) => {
	if (string.length === 0) {
		return "";
	}
	return string[0].toUpperCase() + string.slice(1);
};
