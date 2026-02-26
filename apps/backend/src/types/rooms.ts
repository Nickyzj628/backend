/**
 * 房间/放映室相关类型
 * 保留本地类型定义供内部使用
 * Schemas 已从 @nickyzj/shared-types/schemas 导入
 */

// 使用 any 替代 bun 的 WebSocket 类型
// 运行时由 Elysia 处理 WebSocket
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WS = any;

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

// 从 shared-types 重新导出纯类型（不包含 schemas 中的重复类型）
export type { VideoInfo } from "@nickyzj/shared-types";

// 从 shared-types/schemas 重新导出类型和 schemas
export type {
	CreateRoomPayload,
	CreateRoomResponse,
	ErrorResponse,
	JoinRoomPayload,
	RoomError,
	RoomMessagePayload,
	VideoSyncResponsePayload,
	WebSocketMessage,
} from "@nickyzj/shared-types/schemas";
