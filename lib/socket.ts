import { Server as NetServer } from "http";
import type { NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: IOServer;
    };
  };
};

let ioInstance: IOServer | null = null;

export function getOrCreateIO(server: NetServer) {
  if (ioInstance) return ioInstance;

  ioInstance = new IOServer(server, {
    path: "/api/socket/io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  return ioInstance;
}

export function getIO(): IOServer | null {
  return ioInstance;
}