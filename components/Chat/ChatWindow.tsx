"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketProvider";

interface ChatMessage {
  _id: string;
  conversation: string;
  sender: string;
  content: string;
  createdAt: string;
}

export default function ChatWindow({ conversationId }: { conversationId: string }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;

    async function load() {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    }

    load();
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join_conversation", conversationId);

    const handleNew = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    };

    socket.on("message:new", handleNew);
    return () => {
      socket.off("message:new", handleNew);
    };
  }, [socket, conversationId]);

  async function send() {
    if (!input.trim()) return;
    const payload = { conversationId, content: input.trim() };

    if (socket) {
      socket.emit("message:send", payload);
    } else {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setInput("");
  }

  return (
    <div className="flex flex-col h-full border rounded-md">
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m) => (
          <div key={m._id} className="text-sm">
            <span className="font-semibold mr-2">{m.sender.slice(-4)}</span>
            <span>{m.content}</span>
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message"
        />
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}