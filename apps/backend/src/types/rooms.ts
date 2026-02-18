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

export type RoomMessagePayload = {
	userName: string;
	isHost: boolean;
	text: string;
};

export type VideoInfo = {
	currentTime?: number;
	paused?: boolean;
	playbackRate?: number;
	ep?: number;
	url?: string;
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
export type CreateRoomPayload = typeof CreateRoomPayloadSchema.static;
export type JoinRoomPayload = typeof JoinRoomPayloadSchema.static;
export type VideoSyncResponsePayload =
	typeof VideoSyncResponsePayloadSchema.static;
export type WebSocketMessage = typeof WebSocketMessageSchema.static;
