/**
 * 生成随机整数
 * @param min 最小值
 * @param max 最大值
 * @example
 * random(1, 100); // 1 ~ 100 之间的随机整数
 */
export const random = (min: number, max: number) => {
    const range = Math.abs(max - min) + 1;
    return min + Math.floor(Math.random() * range);
};

/**
 * 从字符串中提取出所有连续的数字
 * @example
 * extractNumbers("abc123def456ghi789"); // [123, 456, 789]
 */
export const extractNumbers = (string: string) => {
    return string.match(/\d+/g)?.map(Number) || [];
};
