/**
 * 拼接 className
 * @param classNames 多个 className，只接受字符串，其他值会被过滤
 * @returns 拼接后的className
 * @example
 * // "flex items-center justify-between"
 * clsx("flex items-center", true && "justify-between", false && "flex-1", null)
 */
export const clsx = (...classNames: any[]) => {
  return classNames.filter(Boolean).join(" ");
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
