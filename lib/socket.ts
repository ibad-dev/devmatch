import Message, { IMessage } from "@/models/Message";
import { Server as NetServer } from "http";
import type { NextApiResponse } from "next";
import { Server as IOServer, Socket } from "socket.io";
import { env } from "@/config/env";
export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: IOServer;
    };
  };
};

let ioInstance: IOServer | null = null;



// Get or create a singleton instance of the Socket.IO server.
export function getOrCreateIO(server: NetServer): IOServer {
  if (ioInstance) return ioInstance;

  ioInstance = new IOServer(server, {
    path: "/api/socket/io",
    cors: {
      origin:
       env.NODE_ENV === "production" ? "https://yourdomain.com" : "*",
      methods: ["GET", "POST"],
    },
  });

  return ioInstance;
}


// Get the existing Socket.IO instance.
export function getIO(): IOServer | null {
  return ioInstance;
}


// Set up Socket.IO event handlers.
export function setupSocketIO(io: IOServer): void {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

      // Join a conversation room
    socket.on("joinConversation", (conversationId: string) => {
      if (!conversationId) {
        console.error("Invalid conversationId:", conversationId);
        return;
      }

      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
    });

    // Handle sending a message
    socket.on("sendMessage", async (message: IMessage) => {
      try {
        if (!message.conversation || !message.sender || !message.content) {
          console.error("Invalid message data:", message);
          return;
        }

        // Save the message to the database
        const savedMessage = await Message.create(message);

        // Broadcast the message to the conversation room
        io.to(message.conversation.toString()).emit("newMessage", savedMessage);
      } catch (error) {
        console.error("Error saving or broadcasting message:", error);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    
    });
  });
}
