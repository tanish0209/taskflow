import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

declare global {
  var io: Server | undefined;
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch {
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  if (!global.io) {
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_SOCKET_URL || "*",
        methods: ["GET", "POST"],
      },
    });
    global.io = io;

    io.on("connection", (socket) => {
      socket.on("join-project", (projectId: string) => {
        socket.join(`project_${projectId}`);
      });

      socket.on("leave-project", (projectId: string) => {
        socket.leave(`project_${projectId}`);
      });

      socket.on("join-task", (taskId: string) => {
        socket.join(`task_${taskId}`);
      });

      socket.on("leave-task", (taskId: string) => {
        socket.leave(`task_${taskId}`);
      });

      socket.on("register-user", (userId: string) => {
        socket.join(`user_${userId}`);
      });
    });
  }

  httpServer.once("error", () => process.exit(1)).listen(port, hostname);
});
