"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _http = require("http");
const _url = require("url");
const _next = /*#__PURE__*/ _interop_require_default(require("next"));
const _socketio = require("socket.io");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = (0, _next.default)({
    dev,
    hostname,
    port
});
const handle = app.getRequestHandler();
app.prepare().then(()=>{
    const httpServer = (0, _http.createServer)(async (req, res)=>{
        try {
            const parsedUrl = (0, _url.parse)(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });
    // Initialize Socket.IO
    const io = new _socketio.Server(httpServer, {
        cors: {
            origin: "*",
            methods: [
                "GET",
                "POST"
            ]
        }
    });
    // Make io accessible globally
    global.io = io;
    io.on("connection", (socket)=>{
        console.log("✅ User Connected:", socket.id);
        socket.on("join-project", (projectId)=>{
            const room = `project_${projectId}`;
            socket.join(room);
            console.log(`🔌 Socket ${socket.id} joined ${room}`);
        });
        socket.on("leave-project", (projectId)=>{
            const room = `project_${projectId}`;
            socket.leave(room);
            console.log(`🔌 Socket ${socket.id} left ${room}`);
        });
        socket.on("join-task", (taskId)=>{
            const room = `task_${taskId}`;
            socket.join(room);
            console.log(`🔌 Socket ${socket.id} joined ${room}`);
        });
        socket.on("leave-task", (taskId)=>{
            const room = `task_${taskId}`;
            socket.leave(room);
            console.log(`🔌 Socket ${socket.id} left ${room}`);
        });
        socket.on("register-user", (userId)=>{
            socket.join(`user_${userId}`);
            console.log(`👤 User ${userId} joined personal room user_${userId}`);
        });
        socket.on("disconnect", ()=>{
            console.log("❌ User Disconnected:", socket.id);
        });
    });
    httpServer.once("error", (err)=>{
        console.error(err);
        process.exit(1);
    }).listen(port, ()=>{
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.IO server running`);
    });
});

