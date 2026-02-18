import { useSocket } from "@/etc/socket-context";
import { copyToClipboard } from "@/helpers/dom";
import useUser from "@/hooks/store/use-user";
import { FormEvent } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import { toast } from "react-hot-toast/headless";
import { useSearchParams } from "wouter-preact";
import Badge, { BadgeType } from "../../components/badge";
import Button from "@/components/button";

const getBadgeInfo = (message: RoomMessage) => {
    const result = {
        type: "default" as BadgeType,
        role: "观众",
    };

    if (message.type === "system") {
        result.type = "danger";
        result.role = "系统";
    } else if (message.type === "host") {
        result.type = "info";
        result.role = "房主";
    }

    return result;
};

const Room = ({
    isHost = true,
    onChangeHost = (isHost: boolean) => void 0,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");

    const [user] = useUser();
    const userName = user.name;

    const socket = useSocket();
    const socketId = socket?.id;

    /**
     * 房间进出相关逻辑
     */

    const [isInRoom, setIsInRoom] = useState(false);

    // 创建房间
    const onCreateRoom = () => {
        socket.emit("createRoom", { userName });
    };

    // 加入房间
    useEffect(() => {
        if (socket && socketId && roomId && !isInRoom) {
            socket.emit("joinRoom", roomId, { userName });
        }
    }, [socket, socketId, roomId, isInRoom]);

    // 房间进出事件
    useEffect(() => {
        if (!socket) {
            return;
        }

        const onRoomCreated = async (roomId: string) => {
            setSearchParams((prev) => {
                prev.set("roomId", roomId);
                return prev;
            }, { replace: true });
            setIsInRoom(true);
            onChangeHost(true);

            toast.success(<button className="text-left" onClick={() => copyToClipboard(window.location.href)}>
                房间创建成功！点击复制链接到剪贴板
            </button>, { duration: 10000 });
        };

        const onRoomJoined = () => {
            setIsInRoom(true);
            onChangeHost(false);
        };

        const onHostChanged = () => {
            onChangeHost(true);
            toast.success("你成为了房主！");
        };

        socket.on("roomCreated", onRoomCreated);
        socket.on("roomJoined", onRoomJoined);
        socket.on("hostChanged", onHostChanged);

        return () => {
            socket.off("roomCreated", onRoomCreated);
            socket.off("roomJoined", onRoomJoined);
            socket.off("hostChanged", onHostChanged);
        };
    }, [socket, roomId]);

    /**
     * 消息收发相关逻辑
     */

    const [messages, setMessages] = useState<RoomMessage[]>([]);

    // 发消息
    const onSendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (!socket) {
            return;
        }

        const form = e.target as HTMLFormElement;
        const input = form.elements["text"] as HTMLInputElement;
        const message = { userName, isHost, text: input.value };

        socket.emit("roomMessage", message);
        form.reset();
    };

    // 收消息
    useEffect(() => {
        if (!socket) {
            return;
        }

        const onRoomMessage = (message: RoomMessage) => {
            setMessages((prev) => [...prev, message]);
        };
        socket.on("roomMessage", onRoomMessage);

        return () => {
            socket.off("roomMessage", onRoomMessage);
        };
    }, [socket]);

    // 聊天框自动滚动至底部
    const messagesRef = useRef<HTMLUListElement>(null);
    useEffect(() => {
        const element = messagesRef.current;
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }, [messages]);

    if (!isInRoom) return (
        <Button size="lg" className="w-full justify-center" onClick={onCreateRoom}>
            创建房间
        </Button>
    );

    return <>
        <ul ref={messagesRef} className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {messages.map((message, index) => {
                const badge = getBadgeInfo(message);
                return (
                    <li key={index} className="flex items-start gap-1">
                        <Badge type={badge.type}>
                            {badge.role}
                        </Badge>
                        <div className="flex-1 text-neutral-800 transition dark:text-neutral-200">
                            <strong>{message.userName}：</strong>
                            <span>{message.text}</span>
                        </div>
                    </li>
                );
            })}
        </ul>
        <form className="mt-3" onSubmit={onSendMessage}>
            <input
                name="text"
                placeholder="点击输入文本"
                className="px-3 py-2 sm:py-2.5 block w-full border-neutral-200 outline-none rounded-xl sm:text-sm transition focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            />
        </form>
    </>;
};

export default Room;
