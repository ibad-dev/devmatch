"use client";
import React, { useEffect, useState } from "react";
import SocketProvider from "@/components/Chat/SocketProvider";
import ChatWindow from "@/components/Chat/ChatWindow";

interface Conversation {
  _id: string;
  name?: string;
  isGroup: boolean;
  participants: string[];
}

function HomeInner() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/chat/conversations", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length && !activeId) setActiveId(data[0]._id);
      }
    }
    load();
  }, []);

  return (
    <div className="h-screen grid grid-cols-12">
      <aside className="col-span-3 border-r p-3 space-y-2">
        <div className="font-semibold mb-2">Conversations</div>
        {conversations.map((c) => (
          <button
            key={c._id}
            onClick={() => setActiveId(c._id)}
            className={`block w-full text-left px-2 py-2 rounded ${activeId === c._id ? "bg-blue-50" : "hover:bg-gray-50"}`}
          >
            {c.name || (c.isGroup ? "Group" : "Direct Message")}
          </button>
        ))}
      </aside>
      <main className="col-span-9 p-3">
        {activeId ? (
          <div className="h-full">
            <ChatWindow conversationId={activeId} />
          </div>
        ) : (
          <div className="text-gray-500">Select a conversation</div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <SocketProvider>
      <HomeInner />
    </SocketProvider>
  );
}
