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
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const app = (0, _next.default)({
    dev
});
const handle = app.getRequestHandler();
app.prepare().then(()=>{
    const httpServer = (0, _http.createServer)(async (req, res)=>{
        try {
            const parsedUrl = (0, _url.parse)(req.url, true);
            await handle(req, res, parsedUrl);
        } catch  {
            res.statusCode = 500;
            res.end("Internal server error");
        }
    });
    if (!global.io) {
        const io = new _socketio.Server(httpServer, {
            cors: {
                origin: process.env.NEXT_PUBLIC_SOCKET_URL || "*",
                methods: [
                    "GET",
                    "POST"
                ]
            }
        });
        global.io = io;
        io.on("connection", (socket)=>{
            socket.on("join-project", (projectId)=>{
                socket.join(`project_${projectId}`);
            });
            socket.on("leave-project", (projectId)=>{
                socket.leave(`project_${projectId}`);
            });
            socket.on("join-task", (taskId)=>{
                socket.join(`task_${taskId}`);
            });
            socket.on("leave-task", (taskId)=>{
                socket.leave(`task_${taskId}`);
            });
            socket.on("register-user", (userId)=>{
                socket.join(`user_${userId}`);
            });
        });
    }
    httpServer.once("error", ()=>process.exit(1)).listen(port, hostname);
});

