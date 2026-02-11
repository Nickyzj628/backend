import { timeLog } from "@nickyzj2023/utils";

// 房间数据结构
interface Room {
	name: string;
	size: number;
	clients: Set<Bun.WebSocket>;
	host?: string; // 存储房主的 WebSocket ID
}

// 用户数据结构
interface UserData {
	userName: string;
	roomCode: string;
	isHost: boolean;
}

// 全局房间存储
const roomsMap = new Map<string, Room>();
const userMap = new Map<Bun.WebSocket, UserData>();

const SYSTEM_USER_NAME = "NeiKos496";

/**
 * 生成房间号
 * @param length 房间号长度，默认 4 位
 */
const generateRoomCode = (length = 4) => {
	const chars = "0123456789";
	let code = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		code += chars[randomIndex];
	}
	return code;
};

/** 列出所有非用户个人的房间 */
const getAllRooms = (): { name: string; size: number }[] => {
	const rooms: { name: string; size: number }[] = [];
	for (const [roomName, room] of roomsMap) {
		rooms.push({
			name: roomName,
			size: room.clients.size,
		});
	}
	return rooms;
};

/** 广播消息到指定房间的所有客户端（除了发送者） */
const broadcastToRoom = (
	roomCode: string,
	message: any,
	senderWs?: Bun.WebSocket,
) => {
	const room = roomsMap.get(roomCode);
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
};

/** 广播消息到指定房间的所有客户端（包括发送者） */
const broadcastToRoomWithSender = (roomCode: string, message: any) => {
	const room = roomsMap.get(roomCode);
	if (!room) return;

	for (const client of room.clients) {
		try {
			client.send(JSON.stringify(message));
		} catch (err) {
			console.error("发送消息失败:", err);
		}
	}
};

/** 设置房间 WebSocket 逻辑 */
const setupRoomsWebSocket = (ws: Bun.WebSocket) => {
	console.log("新 WebSocket 连接建立");

	// 处理接收到的消息
	ws.addEventListener("message", (event) => {
		try {
			const data =
				typeof event.data === "string" ? JSON.parse(event.data) : event.data;
			const { event: eventName, payload } = data;

			switch (eventName) {
				case "createRoom":
					handleCreateRoom(ws, payload);
					break;
				case "joinRoom":
					handleJoinRoom(ws, payload);
					break;
				case "roomMessage":
					handleRoomMessage(ws, payload);
					break;
				case "play":
					handlePlay(ws);
					break;
				case "pause":
					handlePause(ws);
					break;
				case "seek":
					handleSeek(ws, payload);
					break;
				case "rateChange":
					handleRateChange(ws, payload);
					break;
				case "epChange":
					handleEpChange(ws, payload);
					break;
				case "syncVideo":
					handleSyncVideo(ws);
					break;
				case "videoSyncResponse":
					handleVideoSyncResponse(ws, payload);
					break;
				default:
					console.warn(`未知事件: ${eventName}`);
			}
		} catch (error) {
			console.error("解析消息时出错:", error);
		}
	});

	// 处理连接关闭
	ws.addEventListener("close", () => {
		handleDisconnect(ws);
	});
};

/** 处理创建房间 */
const handleCreateRoom = (ws: Bun.WebSocket, payload: { userName: string }) => {
	const roomCode = generateRoomCode();
	const userData = {
		userName: payload.userName,
		roomCode,
		isHost: true,
	};

	// 更新用户数据
	userMap.set(ws, userData);

	// 创建房间
	const room: Room = {
		name: roomCode,
		size: 1,
		clients: new Set([ws]),
		host: ws.remoteAddress,
	};
	roomsMap.set(roomCode, room);

	// 发送房间创建成功的消息
	ws.send(JSON.stringify({ event: "roomCreated", payload: roomCode }));

	timeLog(`${payload.userName}创建了房间#${roomCode}`);
	timeLog(`当前房间列表：${getAllRooms().map((room) => room.name)}`);
};

/** 处理加入房间 */
const handleJoinRoom = (
	ws: Bun.WebSocket,
	payload: { roomCode: string; userName: string },
) => {
	const { roomCode, userName } = payload;
	const isRoomExist = roomsMap.has(roomCode);

	// 更新用户数据
	const userData = {
		userName,
		roomCode,
		isHost: false,
	};
	userMap.set(ws, userData);

	// 获取房间
	let room = roomsMap.get(roomCode);
	if (!room) {
		// 如果房间不存在，创建新房间并设为房主
		userData.isHost = true;
		room = {
			name: roomCode,
			size: 1,
			clients: new Set([ws]),
			host: ws.remoteAddress,
		};
		roomsMap.set(roomCode, room);
		ws.send(JSON.stringify({ event: "roomCreated", payload: roomCode }));
	} else {
		// 房间存在，添加客户端
		room.clients.add(ws);
		room.size = room.clients.size;
		ws.send(JSON.stringify({ event: "roomJoined" }));

		// 通知房间内其他用户有新人加入
		broadcastToRoom(
			roomCode,
			{
				event: "roomMessage",
				payload: {
					type: "system",
					userName: SYSTEM_USER_NAME,
					text: `${userName}来了`,
				},
			},
			ws,
		);
	}

	// 更新用户数据（可能变为房主）
	userMap.set(ws, userData);

	timeLog(`${userName}${isRoomExist ? "加入" : "创建"}了房间#${roomCode}`);
};

/** 处理房间消息 */
const handleRoomMessage = (
	ws: Bun.WebSocket,
	payload: { userName: string; isHost: boolean; text: string },
) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	const { roomCode } = userData;
	const { userName, isHost, text } = payload;
	const type = isHost ? "host" : "user";

	broadcastToRoomWithSender(roomCode, {
		event: "roomMessage",
		payload: { type, userName, text },
	});

	timeLog(`${userName}在房间#${roomCode}说: ${text}`);
};

/** 处理播放命令 */
const handlePlay = (ws: Bun.WebSocket) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "played" }, ws);
};

/** 处理暂停命令 */
const handlePause = (ws: Bun.WebSocket) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "paused" }, ws);
};

/** 处理跳转命令 */
const handleSeek = (ws: Bun.WebSocket, time: number) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "seeked", payload: time }, ws);
};

/** 处理播放速度变更 */
const handleRateChange = (ws: Bun.WebSocket, rate: number) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(
		userData.roomCode,
		{ event: "rateChanged", payload: rate },
		ws,
	);
};

/** 处理剧集变更 */
const handleEpChange = (ws: Bun.WebSocket, ep: number) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "epChanged", payload: ep }, ws);
};

/** 处理视频同步请求 */
const handleSyncVideo = (ws: Bun.WebSocket) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	const room = roomsMap.get(userData.roomCode);
	if (!room) return;

	// 查找房主
	for (const client of room.clients) {
		const clientData = userMap.get(client);
		if (clientData?.isHost) {
			// 向房主发送同步请求
			client.send(
				JSON.stringify({
					event: "videoSyncRequest",
					payload: ws,
				}),
			);
			break;
		}
	}
};

/** 处理视频同步响应 */
const handleVideoSyncResponse = (
	ws: Bun.WebSocket,
	payload: { targetWs: Bun.WebSocket; videoInfo: any },
) => {
	const { targetWs, videoInfo } = payload;

	// 直接向目标 WebSocket 发送信息
	try {
		targetWs.send(
			JSON.stringify({
				event: "videoInfo",
				payload: videoInfo,
			}),
		);
	} catch (err) {
		console.error("发送视频信息失败:", err);
	}
};

/** 处理断开连接 */
const handleDisconnect = (ws: Bun.WebSocket) => {
	const userData = userMap.get(ws);
	if (!userData) {
		return;
	}

	const { userName, roomCode } = userData;
	timeLog(`${userName}离开了房间#${roomCode}`);

	// 从房间中移除客户端
	const room = roomsMap.get(roomCode);
	if (room) {
		room.clients.delete(ws);
		room.size = room.clients.size;

		if (room.clients.size === 0) {
			// 房间为空，删除房间
			roomsMap.delete(roomCode);
			timeLog(`房间#${roomCode}已关闭`);
		} else {
			// 通知房间内其他用户有人离开
			broadcastToRoom(
				roomCode,
				{
					event: "roomMessage",
					payload: {
						type: "system",
						userName: SYSTEM_USER_NAME,
						text: `${userName}走了`,
					},
				},
				ws,
			);

			// 如果离开的是房主，转移房主权限
			if (userData.isHost) {
				for (const client of room.clients) {
					const clientData = userMap.get(client);
					if (clientData) {
						clientData.isHost = true;
						client.send(JSON.stringify({ event: "hostChanged" }));
						room.host = client.remoteAddress;
						break;
					}
				}
			}
		}
	}

	// 清理用户数据
	userMap.delete(ws);

	timeLog(`当前房间列表：${getAllRooms().map((room) => room.name)}`);
};

export default setupRoomsWebSocket;
