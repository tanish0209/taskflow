import { Server } from "socket.io";
import type { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "../../../types/socket";

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log("Socket.IO already running");
  } else {
    console.log("Initializing Socket.IO");
    const io = new Server(res.socket.server as any, {
      path: "/api/socketio",
      addTrailingSlash: false,
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

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
