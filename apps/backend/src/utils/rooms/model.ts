/**
 * 房间模块类型定义
 * Schemas 已从 @nickyzj2023/shared-types/schemas 导入
 */

import type { RoomErrorCode } from "@nickyzj2023/shared-types";

export type RoomError = RoomErrorCode;

/**
 * WebSocket 原始消息类型
 */
export interface WSMessage {
	event: string;
	payload?: unknown;
}

// 从 shared-types/schemas 重新导出 Schemas
export {
	CreateRoomResponseSchema,
	ErrorResponseSchema,
	RoomErrorSchema,
} from "@nickyzj2023/shared-types/schemas";
