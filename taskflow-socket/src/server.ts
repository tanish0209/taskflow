import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

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

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

app.post("/emit", (req, res) => {
  const { event, payload } = req.body;

  if (!event) {
    return res.status(400).json({ error: "Event name is required" });
  }

  const { room, data } = payload || {};

  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }

  res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("🚀 Socket server running on port", PORT);
});
