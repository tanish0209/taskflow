import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Extend global type
declare global {
  var io: Server | undefined;
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  global.io = io;

  io.on("connection", (socket) => {
    console.log("✅ User Connected:", socket.id);

    socket.on("join-project", (projectId: string) => {
      const room = `project_${projectId}`;
      socket.join(room);
      console.log(`🔌 Socket ${socket.id} joined ${room}`);
    });

    socket.on("leave-project", (projectId: string) => {
      const room = `project_${projectId}`;
      socket.leave(room);
      console.log(`🔌 Socket ${socket.id} left ${room}`);
    });

    socket.on("join-task", (taskId: string) => {
      const room = `task_${taskId}`;
      socket.join(room);
      console.log(`🔌 Socket ${socket.id} joined ${room}`);
    });

    socket.on("leave-task", (taskId: string) => {
      const room = `task_${taskId}`;
      socket.leave(room);
      console.log(`🔌 Socket ${socket.id} left ${room}`);
    });

    socket.on("register-user", (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined personal room user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ User Disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running`);
    });
});
