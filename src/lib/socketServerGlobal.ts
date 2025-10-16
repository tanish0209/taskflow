import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";

// Use a global variable to persist Socket.IO across hot reloads
declare global {
  var io: Server | undefined;
}

let io: Server | null = null;

export const initSocketServer = (server: HTTPServer) => {
  if (global.io) {
    console.log("Socket.IO already initialized (using existing instance)");
    return global.io;
  }

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join-project", (projectId: string) => {
      const room = `project_${projectId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    socket.on("leave-project", (projectId: string) => {
      const room = `project_${projectId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left ${room}`);
    });

    socket.on("join-task", (taskId: string) => {
      const room = `task_${taskId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    socket.on("leave-task", (taskId: string) => {
      const room = `task_${taskId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left ${room}`);
    });

    socket.on("register-user", (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined personal room user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });

  global.io = io;
  return io;
};

export const getIO = () => {
  if (!global.io) throw new Error("Socket.io not initialized!");
  return global.io;
};
