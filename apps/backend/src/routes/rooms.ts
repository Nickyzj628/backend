import type {
  CreateRoomPayload,
  JoinRoomPayload,
  RoomMessagePayload,
  VideoSyncResponsePayload,
  WebSocketMessage,
} from "@nickyzj/shared-types/schemas";
import { log } from "@nickyzj2023/utils";
import { Hono } from "hono";
import type { UpgradeWebSocket } from "hono/ws";
import { any, object, optional, safeParse, string } from "valibot";
import { RoomService } from "@/utils/rooms";

// WebSocket 消息 schema（用于校验）
const WebSocketMessageSchema = object({
  event: string(),
  payload: optional(any()),
});

// 创建房间服务实例
const roomService = new RoomService();

// 导出路由工厂函数
export default function createRoomsRouter(upgradeWebSocket: UpgradeWebSocket) {
  const app = new Hono();

  app.get(
    "/",
    upgradeWebSocket(() => {
      const wsId = crypto.randomUUID();

      return {
        onOpen: (_, ws) => {
          log(`新用户 ${wsId} 连接到放映室`);
          // 将 wsId 附加到 ws 对象上，方便后续使用
          (ws as any).customId = wsId;
        },
        onMessage: (event, ws) => {
          try {
            const rawData = JSON.parse(
              typeof event.data === "string" ? event.data : event.data.toString(),
            );

            // 校验消息格式
            const validation = safeParse(WebSocketMessageSchema, rawData);
            if (!validation.success) {
              ws.send(
                JSON.stringify({
                  event: "error",
                  payload: { code: "INVALID_MESSAGE", message: "消息格式错误" },
                }),
              );
              return;
            }

            const { event: eventName, payload } = validation.output as WebSocketMessage;

            // 发送错误给客户端的辅助函数
            const sendError = (error: { code: string; message: string }) => {
              ws.send(JSON.stringify({ event: "error", payload: error }));
            };

            // 处理各种事件
            switch (eventName) {
              case "createRoom": {
                const result = roomService.createRoom(ws, wsId, payload as CreateRoomPayload);
                if (result.success) {
                  ws.send(JSON.stringify(result.data));
                } else {
                  sendError(result.error);
                }
                break;
              }
              case "joinRoom": {
                const result = roomService.joinRoom(ws, wsId, payload as JoinRoomPayload);
                if (result.success) {
                  ws.send(JSON.stringify(result.data));
                } else {
                  sendError(result.error);
                }
                break;
              }
              case "roomMessage": {
                const result = roomService.sendRoomMessage(ws, wsId, payload as RoomMessagePayload);
                if (!result.success) {
                  sendError(result.error);
                }
                break;
              }
              case "play":
                roomService.playVideo(ws, wsId);
                break;
              case "pause":
                roomService.pauseVideo(ws, wsId);
                break;
              case "seek":
                roomService.seekVideo(ws, wsId, payload as number);
                break;
              case "rateChange":
                roomService.changeRate(ws, wsId, payload as number);
                break;
              case "epChange":
                roomService.changeEpisode(ws, wsId, payload as number);
                break;
              case "syncVideo":
                roomService.requestSync(ws, wsId);
                break;
              case "videoSyncResponse":
                roomService.responseSync(ws, wsId, payload as VideoSyncResponsePayload);
                break;
              default:
                console.log(`[rooms] 未知事件: ${eventName}`);
            }
          } catch (err) {
            console.error("[rooms] 处理消息出错:", err);
            ws.send(
              JSON.stringify({
                event: "error",
                payload: { code: "INTERNAL_ERROR", message: "服务器内部错误" },
              }),
            );
          }
        },
        onClose: (_, ws) => {
          console.log(`[rooms] 用户 ${wsId} 断开连接`);
          roomService.disconnect(wsId);
        },
      };
    }),
  );

  return app;
}
