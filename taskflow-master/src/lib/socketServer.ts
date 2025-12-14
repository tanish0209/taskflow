import type { Server } from "socket.io";

declare global {
  var io: Server | undefined;
}

export const getIO = (): Server => {
  if (!global.io) {
    throw new Error("Socket.io not initialized!");
  }
  return global.io;
};
