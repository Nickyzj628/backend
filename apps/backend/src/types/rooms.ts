import type {
	CreateRoomPayload,
	JoinRoomPayload,
	RoomMessagePayload,
	VideoSyncResponsePayload,
} from "@nickyzj/shared-types";
import type { ServerWebSocket } from "bun";
import { t } from "elysia";

export type WS = ServerWebSocket<unknown> & { id: string };

export type Room = {
	name: string;
	size: number;
	clients: Set<WS>;
	host?: string;
};

export type UserData = {
	userName: string;
	roomCode: string;
	isHost: boolean;
};

// 重新导出共享类型
export type {
	CreateRoomPayload,
	JoinRoomPayload,
	RoomMessagePayload,
	VideoSyncResponsePayload,
};

// Elysia Schemas for WebSocket message validation
export const CreateRoomPayloadSchema = t.Object({
	userName: t.String(),
});

export const JoinRoomPayloadSchema = t.Object({
	roomCode: t.String(),
	userName: t.String(),
});

export const RoomMessagePayloadSchema = t.Object({
	userName: t.String(),
	isHost: t.Boolean(),
	text: t.String(),
});

export const VideoSyncResponsePayloadSchema = t.Object({
	targetId: t.String(),
	currentTime: t.Optional(t.Number()),
	paused: t.Optional(t.Boolean()),
	playbackRate: t.Optional(t.Number()),
	ep: t.Optional(t.Number()),
	url: t.Optional(t.String()),
});

export const WebSocketMessageSchema = t.Union([
	t.Object({
		event: t.Literal("createRoom"),
		payload: CreateRoomPayloadSchema,
	}),
	t.Object({
		event: t.Literal("joinRoom"),
		payload: JoinRoomPayloadSchema,
	}),
	t.Object({
		event: t.Literal("roomMessage"),
		payload: RoomMessagePayloadSchema,
	}),
	t.Object({
		event: t.Literal("play"),
		payload: t.Optional(t.Unknown()),
	}),
	t.Object({
		event: t.Literal("pause"),
		payload: t.Optional(t.Unknown()),
	}),
	t.Object({
		event: t.Literal("seek"),
		payload: t.Number(),
	}),
	t.Object({
		event: t.Literal("rateChange"),
		payload: t.Number(),
	}),
	t.Object({
		event: t.Literal("epChange"),
		payload: t.Number(),
	}),
	t.Object({
		event: t.Literal("syncVideo"),
		payload: t.Optional(t.Unknown()),
	}),
	t.Object({
		event: t.Literal("videoSyncResponse"),
		payload: VideoSyncResponsePayloadSchema,
	}),
]);

// Export inferred types from schemas
export type WebSocketMessage = typeof WebSocketMessageSchema.static;
