/**
 * 共享类型定义 - 放映室模块
 * 前后端共用
 */

// ============ 基础消息类型 ============

/**
 * 房间消息发送者类型
 */
export type RoomMessageType = "user" | "host" | "system";

/**
 * 房间消息载荷
 */
export type RoomMessagePayload = {
	userName: string;
	isHost: boolean;
	text: string;
};

/**
 * 房间消息（包含类型标记，用于前端展示）
 */
export type RoomMessage = {
	type?: RoomMessageType;
	userName: string;
	text: string;
};

// ============ 房间操作类型 ============

/**
 * 创建房间请求载荷
 */
export type CreateRoomPayload = {
	userName: string;
};

/**
 * 创建房间响应
 */
export type CreateRoomResponse = {
	roomCode: string;
	userId: string;
};

/**
 * 加入房间请求载荷
 */
export type JoinRoomPayload = {
	roomCode: string;
	userName: string;
};

// ============ 视频同步类型 ============

/**
 * 视频信息
 */
export type VideoInfo = {
	currentTime?: number;
	paused?: boolean;
	playbackRate?: number;
	ep?: number;
	url?: string;
};

/**
 * 视频同步请求载荷
 */
export type VideoSyncRequestPayload = {
	requesterId: string;
};

/**
 * 视频同步响应载荷
 */
export type VideoSyncResponsePayload = VideoInfo & {
	targetId: string;
};

// ============ WebSocket 消息类型 ============

/**
 * WebSocket 消息事件名
 */
export type WebSocketEvent =
	| "createRoom"
	| "joinRoom"
	| "roomMessage"
	| "play"
	| "pause"
	| "seek"
	| "rateChange"
	| "epChange"
	| "syncVideo"
	| "videoSyncResponse"
	| "roomCreated"
	| "roomJoined"
	| "hostChanged"
	| "played"
	| "paused"
	| "seeked"
	| "rateChanged"
	| "epChanged"
	| "videoInfo"
	| "videoSyncRequest"
	| "error";

/**
 * WebSocket 消息结构
 */
export type WebSocketMessage<T = unknown> = {
	event: WebSocketEvent;
	payload?: T;
};

// ============ 错误类型 ============

/**
 * 房间错误码
 */
export type RoomErrorCode =
	| "USER_ALREADY_IN_ROOM"
	| "ROOM_CODE_EXISTS"
	| "USER_NOT_FOUND"
	| "ROOM_NOT_FOUND";

/**
 * 错误响应
 */
export type RoomError = {
	code: RoomErrorCode;
	message: string;
};
