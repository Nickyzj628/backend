/** 把类型中的指定字段变为必选项 */
export type MakeRequired<T, K extends keyof T> = Omit<T, K> &
	Required<Pick<T, K>>;
