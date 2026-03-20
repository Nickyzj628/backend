/**
 * 房间/放映室相关类型
 * 保留本地类型定义供内部使用
 * Schemas 已从 @nickyzj/shared-types/schemas 导入
 */

import type { WSContext } from "hono/ws";

// 使用 hono/ws 的 WSContext 类型
export type WS = WSContext;

export type Room = {
  name: string;
  size: number;
  clients: Set<string>; // 存储 userId
  host?: string; // userId
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
