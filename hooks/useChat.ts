// hooks/useChat.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

type Media = { url: string; type: "image" | "video" | "file" };
type Message = {
  _id: string;
  conversationId: string;
  sender: any;
  text?: string;
  media?: Media | null;
  seenBy?: string[];
  createdAt: string;
};

export function useChat(socketUrl: string, sessionReady: boolean) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!sessionReady) return;

    const socket = io(socketUrl, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("newMessage", (message: Message) => {
      setMessages((m) => (m.some((x) => x._id === message._id) ? m : [...m, message]));
    });

    socket.on("messageSeen", ({ messageId, userId }: any) => {
      setMessages((m) => m.map((msg) => (msg._id === messageId ? { ...msg, seenBy: [...(msg.seenBy || []), userId] } : msg)));
    });

    socket.on("notification", (data: any) => {
      // optional: show toast or update badge
      console.log("notif", data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketUrl, sessionReady]);

  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current) return Promise.reject("Not connected");
    return new Promise((resolve) => {
      socketRef.current?.emit("joinConversation", conversationId, (res: any) => resolve(res));
    });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("leaveConversation", conversationId);
  }, []);

  const sendMessage = useCallback(async (payload: { conversationId: string; text?: string; media?: Media | null }) => {
    if (!socketRef.current) throw new Error("Socket not connected");
    const tempId = uuidv4();
    const optimistic: Message = {
      _id: tempId,
      conversationId: payload.conversationId,
      sender: { _id: "me" },
      text: payload.text,
      media: payload.media ?? null,
      seenBy: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);

    return new Promise((resolve, reject) => {
      socketRef.current?.emit("sendMessage", { ...payload, tempId }, (ack: any) => {
        if (ack?.error) {
          setMessages((m) => m.filter((x) => x._id !== tempId));
          return reject(ack.error);
        }
        setMessages((m) => m.map((x) => (x._id === tempId ? ack.message : x)));
        resolve(ack.message);
      });
    });
  }, []);

  const markSeen = useCallback((conversationId: string, messageId: string) => {
    socketRef.current?.emit("messageSeen", { conversationId, messageId }, (ack: any) => {
      // optional callback
    });
  }, []);

  return {
    socket: socketRef.current,
    connected,
    messages,
    joinConversation,
    leaveConversation,
    sendMessage,
    markSeen,
    setMessages,
  };
}
