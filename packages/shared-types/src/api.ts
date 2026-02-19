/**
 * 通用 API 响应类型
 * 前后端共用
 */

/**
 * 基础响应结构
 */
export type Resp = {
	statusCode: number;
	message: string;
};

/**
 * 分页响应结构
 */
export type RespWithPage = Resp & {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

/**
 * 用户基础信息
 */
export type User = {
	id: number;
	name: string;
};
