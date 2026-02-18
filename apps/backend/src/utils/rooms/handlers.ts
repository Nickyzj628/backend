import type {
	Room,
	RoomMessagePayload,
	UserData,
	VideoInfo,
	WS,
} from "@/types/rooms";
import {
	broadcastToRoom,
	broadcastToRoomWithSender,
	generateRoomCode,
	getAllRooms,
	log,
	roomsMap,
	SYSTEM_USER_NAME,
	userMap,
} from "./state";

export const handleCreateRoom = (
	ws: WS,
	payload: { userName: string },
): void => {
	const roomCode = generateRoomCode();
	const userData: UserData = {
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

	log(`${payload.userName}创建了房间#${roomCode}`);
	log(
		`当前房间列表：${getAllRooms()
			.map((room) => room.name)
			.join(", ")}`,
	);
};

export const handleJoinRoom = (
	ws: WS,
	payload: { roomCode: string; userName: string },
): void => {
	const { roomCode, userName } = payload;
	const isRoomExist = roomsMap.has(roomCode);

	const userData: UserData = {
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

	log(`${userName}${isRoomExist ? "加入" : "创建"}了房间#${roomCode}`);
};

export const handleRoomMessage = (
	ws: WS,
	payload: RoomMessagePayload,
): void => {
	const userData = userMap.get(ws);
	if (!userData) return;

	const { roomCode } = userData;
	const { userName, isHost, text } = payload;
	const type = isHost ? "host" : "user";

	broadcastToRoomWithSender(roomCode, {
		event: "roomMessage",
		payload: { type, userName, text },
	});

	log(`${userName}在房间#${roomCode}说: ${text}`);
};

export const handlePlay = (ws: WS): void => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "played" }, ws);
};

export const handlePause = (ws: WS): void => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "paused" }, ws);
};

export const handleSeek = (ws: WS, time: number): void => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "seeked", payload: time }, ws);
};

export const handleRateChange = (ws: WS, rate: number): void => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(
		userData.roomCode,
		{ event: "rateChanged", payload: rate },
		ws,
	);
};

export const handleEpChange = (ws: WS, ep: number): void => {
	const userData = userMap.get(ws);
	if (!userData) return;

	broadcastToRoom(userData.roomCode, { event: "epChanged", payload: ep }, ws);
};

export const handleSyncVideo = (ws: WS): void => {
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
					payload: { requesterId: ws.id },
				}),
			);
			break;
		}
	}
};

export const handleVideoSyncResponse = (
	ws: WS,
	payload: VideoInfo & { targetId: string },
): void => {
	const userData = userMap.get(ws);
	if (!userData) return;

	const { targetId, currentTime, paused, playbackRate, ep, url } = payload;
	const room = roomsMap.get(userData.roomCode);
	if (!room) return;

	// Find target client by ID
	let targetWs: WS | undefined;
	for (const client of room.clients) {
		if (client.id === targetId) {
			targetWs = client;
			break;
		}
	}

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
};

export const handleDisconnect = (ws: WS): void => {
	const userData = userMap.get(ws);
	if (!userData) {
		return;
	}

	const { userName, roomCode } = userData;
	log(`${userName}离开了房间#${roomCode}`);

	const room = roomsMap.get(roomCode);
	if (room) {
		room.clients.delete(ws);
		room.size = room.clients.size;

		if (room.clients.size === 0) {
			roomsMap.delete(roomCode);
			log(`房间#${roomCode}已关闭`);
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

	log(
		`当前房间列表：${getAllRooms()
			.map((room) => room.name)
			.join(", ")}`,
	);
};
