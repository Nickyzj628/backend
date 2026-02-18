import { timeLog } from "@nickyzj2023/utils";
import type { Room, UserData, WS } from "@/types/rooms";

const log = (...args: string[]) => timeLog("[rooms]", ...args);

export const roomsMap = new Map<string, Room>();
export const userMap = new Map<WS, UserData>();

export const SYSTEM_USER_NAME = "NeiKos496";

export const generateRoomCode = (length = 4): string => {
	const chars = "0123456789";
	let code = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		code += chars[randomIndex];
	}
	return code;
};

export const getAllRooms = (): { name: string; size: number }[] => {
	const rooms: { name: string; size: number }[] = [];
	for (const [roomName, room] of roomsMap) {
		rooms.push({
			name: roomName,
			size: room.clients.size,
		});
	}
	return rooms;
};

export const broadcastToRoom = (
	roomCode: string,
	message: unknown,
	senderWs?: WS,
): void => {
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

export const broadcastToRoomWithSender = (
	roomCode: string,
	message: unknown,
): void => {
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

export { log };
