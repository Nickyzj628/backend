import type {
	CreateRoomPayload,
	CreateRoomResponse,
	JoinRoomPayload,
	Room,
	RoomMessagePayload,
	UserData,
	VideoInfo,
	WS,
} from "@/types/rooms";
import type { WSMessage } from "./model";

/**
 * 操作结果类型
 */
export type OperationResult<T = WSMessage> =
	| { success: true; data: T }
	| { success: false; error: { code: string; message: string } };

/**
 * 房间服务类
 * 处理所有房间相关的业务逻辑
 */
export class RoomService {
	private roomsMap = new Map<string, Room>();
	private userMap = new Map<WS, UserData>();
	private readonly SYSTEM_USER_NAME = "NeiKos496";

	/**
	 * 生成随机房间号
	 */
	private generateRoomCode(length = 4): string {
		const chars = "0123456789";
		let code = "";
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * chars.length);
			code += chars[randomIndex];
		}
		return code;
	}

	/**
	 * 获取所有房间列表
	 */
	getAllRooms(): { name: string; size: number }[] {
		const rooms: { name: string; size: number }[] = [];
		for (const [roomName, room] of this.roomsMap) {
			rooms.push({
				name: roomName,
				size: room.clients.size,
			});
		}
		return rooms;
	}

	/**
	 * 向房间内广播消息（排除发送者）
	 */
	broadcastToRoom(roomCode: string, message: WSMessage, senderWs?: WS): void {
		const room = this.roomsMap.get(roomCode);
		if (!room) return;

		for (const client of room.clients) {
			if (client !== senderWs) {
				try {
					client.send(JSON.stringify(message));
				} catch (err) {
					console.error("发送消息失败:", err);
				}
			}
		}
	}

	/**
	 * 向房间内所有客户端广播消息（包括发送者）
	 */
	broadcastToRoomWithSender(roomCode: string, message: WSMessage): void {
		const room = this.roomsMap.get(roomCode);
		if (!room) return;

		for (const client of room.clients) {
			try {
				client.send(JSON.stringify(message));
			} catch (err) {
				console.error("发送消息失败:", err);
			}
		}
	}

	/**
	 * 获取用户的房间信息
	 */
	getUserData(ws: WS): UserData | undefined {
		return this.userMap.get(ws);
	}

	/**
	 * 创建房间
	 * 流程：生成房间号 -> 创建用户数据 -> 创建房间 -> 返回房间号
	 *
	 * 关于用户识别：每个 WebSocket 连接都有唯一的 ws.id，
	 * 即使同一 IP 多开浏览器，每个标签页也是不同的 ws 实例，
	 * 因此会被正确识别为不同用户
	 */
	createRoom(
		ws: WS,
		payload: CreateRoomPayload,
	): OperationResult<CreateRoomResponse> {
		// 检查用户是否已在某个房间中
		if (this.userMap.has(ws)) {
			return {
				success: false,
				error: {
					code: "USER_ALREADY_IN_ROOM",
					message: "用户已在房间中，请先离开当前房间",
				},
			};
		}

		// 生成唯一房间号
		let roomCode: string;
		let attempts = 0;
		const maxAttempts = 10;

		do {
			roomCode = this.generateRoomCode();
			attempts++;
			if (attempts >= maxAttempts) {
				return {
					success: false,
					error: {
						code: "ROOM_CODE_EXISTS",
						message: "无法生成唯一房间号，请重试",
					},
				};
			}
		} while (this.roomsMap.has(roomCode));

		// 创建用户数据
		const userData: UserData = {
			userName: payload.userName,
			roomCode,
			isHost: true,
		};

		// 创建房间
		const room: Room = {
			name: roomCode,
			size: 1,
			clients: new Set([ws]),
			host: ws.id, // 使用 ws.id 而非 remoteAddress 以支持同一 IP 多开
		};

		// 保存数据
		this.userMap.set(ws, userData);
		this.roomsMap.set(roomCode, room);

		// 返回成功响应
		return {
			success: true,
			data: {
				event: "roomCreated",
				payload: {
					roomCode,
					userId: ws.id,
				},
			},
		};
	}

	/**
	 * 加入房间
	 */
	joinRoom(ws: WS, payload: JoinRoomPayload): OperationResult<WSMessage> {
		const { roomCode, userName } = payload;

		// 检查用户是否已在房间中
		if (this.userMap.has(ws)) {
			return {
				success: false,
				error: {
					code: "USER_ALREADY_IN_ROOM",
					message: "用户已在房间中",
				},
			};
		}

		const existingRoom = this.roomsMap.get(roomCode);
		const isRoomExist = !!existingRoom;

		// 创建用户数据
		const userData: UserData = {
			userName,
			roomCode,
			isHost: !isRoomExist, // 如果房间不存在，创建者成为房主
		};

		if (!isRoomExist) {
			// 创建新房间
			const newRoom: Room = {
				name: roomCode,
				size: 1,
				clients: new Set([ws]),
				host: ws.id,
			};
			this.roomsMap.set(roomCode, newRoom);
		} else {
			// 加入现有房间
			existingRoom.clients.add(ws);
			existingRoom.size = existingRoom.clients.size;

			// 通知其他用户
			this.broadcastToRoom(
				roomCode,
				{
					event: "roomMessage",
					payload: {
						type: "system",
						userName: this.SYSTEM_USER_NAME,
						text: `${userName}来了`,
					},
				},
				ws,
			);
		}

		this.userMap.set(ws, userData);

		return {
			success: true,
			data: {
				event: isRoomExist ? "roomJoined" : "roomCreated",
				payload: isRoomExist ? undefined : { roomCode, userId: ws.id },
			},
		};
	}

	/**
	 * 发送房间消息
	 */
	sendRoomMessage(ws: WS, payload: RoomMessagePayload): OperationResult {
		const userData = this.userMap.get(ws);
		if (!userData) {
			return {
				success: false,
				error: {
					code: "USER_NOT_FOUND",
					message: "用户不在任何房间中",
				},
			};
		}

		const { roomCode } = userData;
		const { userName, isHost, text } = payload;
		const type = isHost ? "host" : "user";

		this.broadcastToRoomWithSender(roomCode, {
			event: "roomMessage",
			payload: { type, userName, text },
		});

		return { success: true, data: { event: "roomMessageSent" } };
	}

	/**
	 * 播放视频
	 */
	playVideo(ws: WS): void {
		const userData = this.userMap.get(ws);
		if (!userData) return;

		this.broadcastToRoom(userData.roomCode, { event: "played" }, ws);
	}

	/**
	 * 暂停视频
	 */
	pauseVideo(ws: WS): void {
		const userData = this.userMap.get(ws);
		if (!userData) return;

		this.broadcastToRoom(userData.roomCode, { event: "paused" }, ws);
	}

	/**
	 * 视频跳转
	 */
	seekVideo(ws: WS, time: number): void {
		const userData = this.userMap.get(ws);
		if (!userData) return;

		this.broadcastToRoom(
			userData.roomCode,
			{ event: "seeked", payload: time },
			ws,
		);
	}

	/**
	 * 改变播放速率
	 */
	changeRate(ws: WS, rate: number): void {
		const userData = this.userMap.get(ws);
		if (!userData) return;

		this.broadcastToRoom(
			userData.roomCode,
			{ event: "rateChanged", payload: rate },
			ws,
		);
	}

	/**
	 * 切换剧集
	 */
	changeEpisode(ws: WS, ep: number): void {
		const userData = this.userMap.get(ws);
		if (!userData) return;

		this.broadcastToRoom(
			userData.roomCode,
			{ event: "epChanged", payload: ep },
			ws,
		);
	}

	/**
	 * 请求同步视频状态
	 */
	requestSync(ws: WS): void {
		const userData = this.userMap.get(ws);
		if (!userData) return;

		const room = this.roomsMap.get(userData.roomCode);
		if (!room) return;

		// 向房主发送同步请求
		for (const client of room.clients) {
			const clientData = this.userMap.get(client);
			if (clientData?.isHost) {
				client.send(
					JSON.stringify({
						event: "videoSyncRequest",
						payload: { requesterId: ws.id },
					}),
				);
				break;
			}
		}
	}

	/**
	 * 响应同步请求，发送视频状态
	 */
	responseSync(ws: WS, payload: VideoInfo & { targetId: string }): void {
		const userData = this.userMap.get(ws);
		if (!userData) return;

		const { targetId, currentTime, paused, playbackRate, ep, url } = payload;
		const room = this.roomsMap.get(userData.roomCode);
		if (!room) return;

		// 查找目标客户端
		const targetWs = Array.from(room.clients).find(
			(client) => client.id === targetId,
		);

		if (!targetWs) {
			console.error(`未找到目标客户端: ${targetId}`);
			return;
		}

		try {
			targetWs.send(
				JSON.stringify({
					event: "videoInfo",
					payload: {
						currentTime,
						paused,
						playbackRate,
						ep,
						url,
					},
				}),
			);
		} catch (err) {
			console.error("发送视频信息失败:", err);
		}
	}

	/**
	 * 用户断开连接
	 */
	disconnect(ws: WS): void {
		const userData = this.userMap.get(ws);
		if (!userData) return;

		const { userName, roomCode, isHost } = userData;

		const room = this.roomsMap.get(roomCode);
		if (room) {
			room.clients.delete(ws);
			room.size = room.clients.size;

			if (room.clients.size === 0) {
				this.roomsMap.delete(roomCode);
			} else {
				// 通知其他用户
				this.broadcastToRoom(
					roomCode,
					{
						event: "roomMessage",
						payload: {
							type: "system",
							userName: this.SYSTEM_USER_NAME,
							text: `${userName}走了`,
						},
					},
					ws,
				);

				// 如果房主离开，转移房主权限
				if (isHost) {
					const newHost = Array.from(room.clients)[0];
					const newHostData = this.userMap.get(newHost);
					if (newHostData) {
						newHostData.isHost = true;
						newHost.send(JSON.stringify({ event: "hostChanged" }));
						room.host = newHost.id;
					}
				}
			}
		}

		this.userMap.delete(ws);
	}
}
