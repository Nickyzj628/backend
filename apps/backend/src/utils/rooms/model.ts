import type { RoomErrorCode } from "@nickyzj/shared-types";
import { t } from "elysia";

/**
 * 房间模块错误类型
 */
export const RoomErrorSchema = t.Union([
	t.Literal("ROOM_CODE_EXISTS"),
	t.Literal("ROOM_NOT_FOUND"),
	t.Literal("USER_ALREADY_IN_ROOM"),
	t.Literal("USER_NOT_FOUND"),
]);

export type RoomError = RoomErrorCode;

/**
 * 创建房间响应
 */
export const CreateRoomResponseSchema = t.Object({
	event: t.Literal("roomCreated"),
	payload: t.Object({
		roomCode: t.String(),
		userId: t.String(),
	}),
});

export type CreateRoomResponse = typeof CreateRoomResponseSchema.static;

/**
 * 错误响应
 */
export const ErrorResponseSchema = t.Object({
	event: t.Literal("error"),
	payload: t.Object({
		code: RoomErrorSchema,
		message: t.String(),
	}),
});

export type ErrorResponse = typeof ErrorResponseSchema.static;

/**
 * WebSocket 原始消息类型
 */
export interface WSMessage {
	event: string;
	payload?: unknown;
}
