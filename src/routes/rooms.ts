import { timeLog } from "@nickyzj2023/utils";
import { Elysia } from "elysia";

type WS = any;

interface Room {
	name: string;
	size: number;
	clients: Set<WS>;
	host?: string;
}

interface UserData {
	userName: string;
	roomCode: string;
	isHost: boolean;
}

interface RoomMessagePayload {
	userName: string;
	isHost: boolean;
	text: string;
}

interface VideoInfo {
	currentTime?: number;
	paused?: boolean;
	playbackRate?: number;
	ep?: number;
	url?: string;
}

const roomsMap = new Map<string, Room>();
const userMap = new Map<WS, UserData>();

const SYSTEM_USER_NAME = "NeiKos496";

const generateRoomCode = (length = 4) => {
	const chars = "0123456789";
	let code = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		code += chars[randomIndex];
	}
	return code;
};

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

const broadcastToRoom = (roomCode: string, message: unknown, senderWs?: WS) => {
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

const broadcastToRoomWithSender = (roomCode: string, message: unknown) => {
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

const handleCreateRoom = (ws: WS, payload: { userName: string }) => {
	const roomCode = generateRoomCode();
	const userData = {
		userName: payload.userName,
		roomCode,
		isHost: true,
	};

	userMap.set(ws, userData);

	const room: Room = {
		name: roomCode,
		size: 1,
		clients: new Set([ws]),
		host: ws.remoteAddress,
	};
	roomsMap.set(roomCode, room);

	ws.send(JSON.stringify({ event: "roomCreated", payload: roomCode }));

	timeLog(`${payload.userName}创建了房间#${roomCode}`);
	timeLog(`当前房间列表：${getAllRooms().map((room) => room.name)}`);
};

const handleJoinRoom = (
	ws: WS,
	payload: { roomCode: string; userName: string },
) => {
	const { roomCode, userName } = payload;
	const isRoomExist = roomsMap.has(roomCode);

	const userData = {
		userName,
		roomCode,
		isHost: false,
	};
	userMap.set(ws, userData);

	let room = roomsMap.get(roomCode);
	if (!room) {
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
		room.clients.add(ws);
		room.size = room.clients.size;
		ws.send(JSON.stringify({ event: "roomJoined" }));

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

	userMap.set(ws, userData);

	timeLog(`${userName}${isRoomExist ? "加入" : "创建"}了房间#${roomCode}`);
};

const handleRoomMessage = (ws: WS, payload: RoomMessagePayload) => {
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

const handlePlay = (ws: WS) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "played" }, ws);
};

const handlePause = (ws: WS) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "paused" }, ws);
};

const handleSeek = (ws: WS, time: number) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "seeked", payload: time }, ws);
};

const handleRateChange = (ws: WS, rate: number) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(
		userData.roomCode,
		{ event: "rateChanged", payload: rate },
		ws,
	);
};

const handleEpChange = (ws: WS, ep: number) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "epChanged", payload: ep }, ws);
};

const handleSyncVideo = (ws: WS) => {
	const userData = userMap.get(ws);
	if (!userData) return;

	const room = roomsMap.get(userData.roomCode);
	if (!room) return;

	for (const client of room.clients) {
		const clientData = userMap.get(client);
		if (clientData?.isHost) {
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

const handleVideoSyncResponse = (
	ws: WS,
	payload: { targetWs: WS; videoInfo: VideoInfo },
) => {
	const { targetWs, videoInfo } = payload;

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

const handleDisconnect = (ws: WS) => {
	const userData = userMap.get(ws);
	if (!userData) {
		return;
	}

	const { userName, roomCode } = userData;
	timeLog(`${userName}离开了房间#${roomCode}`);

	const room = roomsMap.get(roomCode);
	if (room) {
		room.clients.delete(ws);
		room.size = room.clients.size;

		if (room.clients.size === 0) {
			roomsMap.delete(roomCode);
			timeLog(`房间#${roomCode}已关闭`);
		} else {
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

	userMap.delete(ws);

	timeLog(`当前房间列表：${getAllRooms().map((room) => room.name)}`);
};

export const rooms = new Elysia().ws("/rooms", {
	open(ws) {
		timeLog(`新用户连接到放映室：${ws.id}`);
	},
	message(ws, message) {
		try {
			const data = JSON.parse(
				typeof message === "string"
					? message
					: new TextDecoder().decode(message),
			);
			const { event: eventName, payload } = data as {
				event: string;
				payload: unknown;
			};

			switch (eventName) {
				case "createRoom":
					handleCreateRoom(ws, payload as { userName: string });
					break;
				case "joinRoom":
					handleJoinRoom(ws, payload as { roomCode: string; userName: string });
					break;
				case "roomMessage":
					handleRoomMessage(ws, payload as RoomMessagePayload);
					break;
				case "play":
					handlePlay(ws);
					break;
				case "pause":
					handlePause(ws);
					break;
				case "seek":
					handleSeek(ws, payload as number);
					break;
				case "rateChange":
					handleRateChange(ws, payload as number);
					break;
				case "epChange":
					handleEpChange(ws, payload as number);
					break;
				case "syncVideo":
					handleSyncVideo(ws);
					break;
				case "videoSyncResponse":
					handleVideoSyncResponse(
						ws,
						payload as { targetWs: WS; videoInfo: VideoInfo },
					);
					break;
				default:
					console.warn(`未知事件: ${eventName}`);
			}
		} catch (error) {
			console.error("解析消息时出错:", error);
		}
	},
	close(ws) {
		handleDisconnect(ws);
	},
});
