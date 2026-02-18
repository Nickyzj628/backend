import { timeLog } from "@nickyzj2023/utils";
import { Elysia } from "elysia";
import type { WS } from "@/types/rooms";
import {
	CreateRoomPayloadSchema,
	JoinRoomPayloadSchema,
	RoomMessagePayloadSchema,
	VideoSyncResponsePayloadSchema,
	WebSocketMessageSchema,
} from "@/types/rooms";
import {
	CreateRoomResponseSchema,
	ErrorResponseSchema,
	RoomErrorSchema,
	RoomService,
} from "@/utils/rooms";

// 创建房间服务实例
const roomService = new RoomService();

export const rooms = new Elysia({
	name: "rooms",
})
	.decorate("roomService", roomService)
	.model({
		"rooms.message": WebSocketMessageSchema,
		"rooms.createPayload": CreateRoomPayloadSchema,
		"rooms.joinPayload": JoinRoomPayloadSchema,
		"rooms.messagePayload": RoomMessagePayloadSchema,
		"rooms.videoSyncPayload": VideoSyncResponsePayloadSchema,
		"rooms.createResponse": CreateRoomResponseSchema,
		"rooms.error": ErrorResponseSchema,
		"rooms.errorCode": RoomErrorSchema,
	})
	.ws("/rooms", {
		body: "rooms.message",
		open(ws) {
			timeLog(`[rooms] 新用户 ${ws.id} 连接到放映室`);
		},
		message(ws, data) {
			const { event: eventName, payload } = data;
			const wsRaw = ws.raw as WS;
			const service = ws.data.roomService;

			switch (eventName) {
				case "createRoom": {
					const result = service.createRoom(wsRaw, payload);
					if (result.success) {
						ws.send(JSON.stringify(result.data));
					} else {
						ws.send(
							JSON.stringify({
								event: "error",
								payload: result.error,
							}),
						);
					}
					break;
				}
				case "joinRoom": {
					const result = service.joinRoom(wsRaw, payload);
					if (result.success) {
						ws.send(JSON.stringify(result.data));
					} else {
						ws.send(
							JSON.stringify({
								event: "error",
								payload: result.error,
							}),
						);
					}
					break;
				}
				case "roomMessage": {
					const result = service.sendRoomMessage(wsRaw, payload);
					if (!result.success) {
						ws.send(
							JSON.stringify({
								event: "error",
								payload: result.error,
							}),
						);
					}
					break;
				}
				case "play":
					service.playVideo(wsRaw);
					break;
				case "pause":
					service.pauseVideo(wsRaw);
					break;
				case "seek":
					service.seekVideo(wsRaw, payload);
					break;
				case "rateChange":
					service.changeRate(wsRaw, payload);
					break;
				case "epChange":
					service.changeEpisode(wsRaw, payload);
					break;
				case "syncVideo":
					service.requestSync(wsRaw);
					break;
				case "videoSyncResponse":
					service.responseSync(wsRaw, payload);
					break;
				default:
					timeLog(`[rooms] 未知事件: ${eventName}`);
			}
		},
		close(ws) {
			ws.data.roomService.disconnect(ws.raw as WS);
		},
	});

export default rooms;
