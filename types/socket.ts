import type { Server as IOServer } from "socket.io";
import type { NextApiResponse } from "next";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: {
      io?: IOServer;
    };
  };
};
