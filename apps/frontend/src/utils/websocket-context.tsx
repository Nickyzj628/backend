import { createContext } from "preact";
import type { ReactNode } from "preact/compat";
import { useContext } from "preact/hooks";
import { type MessageHandler, useWebSocket } from "@/hooks/use-websocket";
import { BACKEND_PORT, BASE_URL } from "@/utils/constants";

export type WebSocketContextType = {
	send: (event: string, payload?: unknown) => void;
	on: (event: string, handler: MessageHandler) => void;
	off: (event: string, handler: MessageHandler) => void;
	connected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
	const wsUrl = `${BASE_URL.replace("https://", "wss://").replace("http://", "ws://")}:${BACKEND_PORT}/rooms`;
	const { status, send, on, off } = useWebSocket(wsUrl);

	const value: WebSocketContextType = {
		send,
		on,
		off,
		connected: status === "open",
	};

	return (
		<WebSocketContext.Provider value={value}>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocketContext = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error(
			"useWebSocketContext must be used within a WebSocketProvider",
		);
	}
	return context;
};
