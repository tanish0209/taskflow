import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 100,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 50000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket Connected:", socket!.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket Connection Error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket Disconnected:", reason);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
