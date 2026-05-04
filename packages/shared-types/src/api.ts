/** 基础响应体 */
export type Resp = {
	statusCode: number;
	message: string;
};

/** 分页响应体 */
export type RespWithPage = Resp & {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

/** 用户信息 */
export type User = {
	id: number;
	name: string;
};
