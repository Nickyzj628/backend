import { Socket } from "socket.io";

// 扩展 Socket 接口
declare module "socket.io" {
  interface Socket {
    roomCode: string;
    userName: string;
    isHost: boolean;
  }
}
