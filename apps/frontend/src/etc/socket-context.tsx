import { BACKEND_PORT, BASE_URL } from "@/etc/constants";
import { createContext } from "preact";
import { ReactNode } from "preact/compat";
import { useContext, useEffect, useState } from "preact/hooks";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

/**
 * 通用的 Socket.IO Context Provider
 */
export const SocketProvider = ({
    config,
    children,
}: {
    config: Partial<ManagerOptions & SocketOptions>,
    children: ReactNode,
}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    useEffect(() => {
        const socket = io(`${BASE_URL}:${BACKEND_PORT}`, {
            ...config,
        });
        socket.on("connect", () => {
            setSocket(socket);
        });
        socket.on("disconnect", () => {
            setSocket(null);
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
