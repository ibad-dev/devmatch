import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import type { NextApiResponseWithSocket } from "@/lib/socket";
import { getToken } from "next-auth/jwt";
import { env } from "@/config/env";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import dbConnect from "@/lib/db";

type Attachment = { url: string; type: string; name?: string; size?: number };

export const config = {
  api: {
    bodyParser: false,
  },
};

async function setupIO(io: IOServer) {
  await dbConnect();

  io.use(async (socket, next) => {
    try {
      const req = socket.request as unknown as NextApiRequest;
      const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
      if (!token || !token.id) {
        return next(new Error("unauthorized"));
      }
      socket.data.userId = token.id as string;
      socket.join(`user:${token.id}`);
      next();
    } catch {
      next(new Error("auth_error"));
    }
  });

  io.on("connection", (socket) => {
    const userId: string = socket.data.userId;

    socket.on("join_conversation", async (conversationId: string) => {
      if (!conversationId) return;
      socket.join(`conversation:${conversationId}`);
    });

    socket.on(
      "message:send",
      async (payload: { conversationId: string; content: string; attachments?: Attachment[] }) => {
        try {
          await dbConnect();
          const { conversationId, content, attachments } = payload;
          const message = await Message.create({
            conversation: conversationId,
            sender: userId,
            content,
            attachments: attachments || [],
            readBy: [userId],
          });

          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessageAt: new Date(),
            lastMessage: message._id,
          });

          io.to(`conversation:${conversationId}`).emit("message:new", {
            _id: message._id,
            conversation: conversationId,
            sender: userId,
            content: message.content,
            attachments: message.attachments,
            createdAt: message.createdAt,
          });
        } catch {
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    socket.on("typing", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing", { userId });
    });

    socket.on("read", async (conversationId: string) => {
      try {
        await dbConnect();
        await Message.updateMany(
          { conversation: conversationId, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );
        io.to(`conversation:${conversationId}`).emit("read", { userId });
      } catch {}
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket | NextApiResponse) {
  const resWithSocket = res as NextApiResponseWithSocket;

  if (!("io" in resWithSocket.socket.server) || !resWithSocket.socket.server.io) {
    const io = new IOServer(resWithSocket.socket.server, {
      path: "/api/socket/io",
      cors: { origin: "*" },
    });
    resWithSocket.socket.server.io = io;
    await setupIO(io);
  }

  res.end();
}