/**
 * 房间/放映室相关 Valibot Schemas
 * 供后端 Elysia 验证使用
 */

import * as v from "valibot";

/**
 * 创建房间请求载荷 Schema
 */
export const CreateRoomPayloadSchema = v.object({
	userName: v.string(),
});

/**
 * 创建房间请求载荷类型
 */
export type CreateRoomPayload = v.InferOutput<typeof CreateRoomPayloadSchema>;

/**
 * 加入房间请求载荷 Schema
 */
export const JoinRoomPayloadSchema = v.object({
	roomCode: v.string(),
	userName: v.string(),
});

/**
 * 加入房间请求载荷类型
 */
export type JoinRoomPayload = v.InferOutput<typeof JoinRoomPayloadSchema>;

/**
 * 房间消息载荷 Schema
 */
export const RoomMessagePayloadSchema = v.object({
	userName: v.string(),
	isHost: v.boolean(),
	text: v.string(),
});

/**
 * 房间消息载荷类型
 */
export type RoomMessagePayload = v.InferOutput<typeof RoomMessagePayloadSchema>;

/**
 * 视频同步响应载荷 Schema
 */
export const VideoSyncResponsePayloadSchema = v.object({
	targetId: v.string(),
	currentTime: v.optional(v.number()),
	paused: v.optional(v.boolean()),
	playbackRate: v.optional(v.number()),
	ep: v.optional(v.number()),
	url: v.optional(v.string()),
});

/**
 * 视频同步响应载荷类型
 */
export type VideoSyncResponsePayload = v.InferOutput<
	typeof VideoSyncResponsePayloadSchema
>;

/**
 * 创建房间响应 Schema
 */
export const CreateRoomResponseSchema = v.object({
	event: v.literal("roomCreated"),
	payload: v.object({
		roomCode: v.string(),
		userId: v.string(),
	}),
});

/**
 * 创建房间响应类型
 */
export type CreateRoomResponse = v.InferOutput<typeof CreateRoomResponseSchema>;

/**
 * 房间错误码 Schema
 */
export const RoomErrorSchema = v.union([
	v.literal("ROOM_CODE_EXISTS"),
	v.literal("ROOM_NOT_FOUND"),
	v.literal("USER_ALREADY_IN_ROOM"),
	v.literal("USER_NOT_FOUND"),
]);

/**
 * 房间错误码类型
 */
export type RoomError = v.InferOutput<typeof RoomErrorSchema>;

/**
 * 错误响应 Schema
 */
export const ErrorResponseSchema = v.object({
	event: v.literal("error"),
	payload: v.object({
		code: RoomErrorSchema,
		message: v.string(),
	}),
});

/**
 * 错误响应类型
 */
export type ErrorResponse = v.InferOutput<typeof ErrorResponseSchema>;

/**
 * WebSocket 消息 Schema
 */
export const WebSocketMessageSchema = v.union([
	v.object({
		event: v.literal("createRoom"),
		payload: CreateRoomPayloadSchema,
	}),
	v.object({
		event: v.literal("joinRoom"),
		payload: JoinRoomPayloadSchema,
	}),
	v.object({
		event: v.literal("roomMessage"),
		payload: RoomMessagePayloadSchema,
	}),
	v.object({
		event: v.literal("play"),
		payload: v.optional(v.unknown()),
	}),
	v.object({
		event: v.literal("pause"),
		payload: v.optional(v.unknown()),
	}),
	v.object({
		event: v.literal("seek"),
		payload: v.number(),
	}),
	v.object({
		event: v.literal("rateChange"),
		payload: v.number(),
	}),
	v.object({
		event: v.literal("epChange"),
		payload: v.number(),
	}),
	v.object({
		event: v.literal("syncVideo"),
		payload: v.optional(v.unknown()),
	}),
	v.object({
		event: v.literal("videoSyncResponse"),
		payload: VideoSyncResponsePayloadSchema,
	}),
]);

/**
 * WebSocket 消息类型
 */
export type WebSocketMessage = v.InferOutput<typeof WebSocketMessageSchema>;
