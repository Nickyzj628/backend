import {
	boolean,
	type InferOutput,
	literal,
	number,
	object,
	optional,
	string,
	union,
	unknown,
} from "valibot";

/**
 * 创建房间请求载荷 Schema
 */
export const CreateRoomPayloadSchema = object({
	userName: string(),
});

/**
 * 创建房间请求载荷类型
 */
export type CreateRoomPayload = InferOutput<typeof CreateRoomPayloadSchema>;

/**
 * 加入房间请求载荷 Schema
 */
export const JoinRoomPayloadSchema = object({
	roomCode: string(),
	userName: string(),
});

/**
 * 加入房间请求载荷类型
 */
export type JoinRoomPayload = InferOutput<typeof JoinRoomPayloadSchema>;

/**
 * 房间消息载荷 Schema
 */
export const RoomMessagePayloadSchema = object({
	userName: string(),
	isHost: boolean(),
	text: string(),
});

/**
 * 房间消息载荷类型
 */
export type RoomMessagePayload = InferOutput<typeof RoomMessagePayloadSchema>;

/**
 * 视频同步响应载荷 Schema
 */
export const VideoSyncResponsePayloadSchema = object({
	targetId: string(),
	currentTime: optional(number()),
	paused: optional(boolean()),
	playbackRate: optional(number()),
	ep: optional(number()),
	url: optional(string()),
});

/**
 * 视频同步响应载荷类型
 */
export type VideoSyncResponsePayload = InferOutput<
	typeof VideoSyncResponsePayloadSchema
>;

/**
 * 创建房间响应 Schema
 */
export const CreateRoomResponseSchema = object({
	event: literal("roomCreated"),
	payload: object({
		roomCode: string(),
		userId: string(),
	}),
});

/**
 * 创建房间响应类型
 */
export type CreateRoomResponse = InferOutput<typeof CreateRoomResponseSchema>;

/**
 * 房间错误码 Schema
 */
export const RoomErrorSchema = union([
	literal("ROOM_CODE_EXISTS"),
	literal("ROOM_NOT_FOUND"),
	literal("USER_ALREADY_IN_ROOM"),
	literal("USER_NOT_FOUND"),
]);

/**
 * 房间错误码类型
 */
export type RoomError = InferOutput<typeof RoomErrorSchema>;

/**
 * 错误响应 Schema
 */
export const ErrorResponseSchema = object({
	event: literal("error"),
	payload: object({
		code: RoomErrorSchema,
		message: string(),
	}),
});

/**
 * 错误响应类型
 */
export type ErrorResponse = InferOutput<typeof ErrorResponseSchema>;

/**
 * WebSocket 消息 Schema
 */
export const WebSocketMessageSchema = union([
	object({
		event: literal("createRoom"),
		payload: CreateRoomPayloadSchema,
	}),
	object({
		event: literal("joinRoom"),
		payload: JoinRoomPayloadSchema,
	}),
	object({
		event: literal("roomMessage"),
		payload: RoomMessagePayloadSchema,
	}),
	object({
		event: literal("play"),
		payload: optional(unknown()),
	}),
	object({
		event: literal("pause"),
		payload: optional(unknown()),
	}),
	object({
		event: literal("seek"),
		payload: number(),
	}),
	object({
		event: literal("rateChange"),
		payload: number(),
	}),
	object({
		event: literal("epChange"),
		payload: number(),
	}),
	object({
		event: literal("syncVideo"),
		payload: optional(unknown()),
	}),
	object({
		event: literal("videoSyncResponse"),
		payload: VideoSyncResponsePayloadSchema,
	}),
]);

/**
 * WebSocket 消息类型
 */
export type WebSocketMessage = InferOutput<typeof WebSocketMessageSchema>;
