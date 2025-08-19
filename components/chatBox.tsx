"use client"
// components/ChatBox.tsx
import React, { useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useSession } from "next-auth/react";

export default function ChatBox({ conversationId }: { conversationId: string }) {
  const { data: session, status } = useSession();
  const { joinConversation, sendMessage, messages, setMessages } = useChat(process.env.NEXT_PUBLIC_SOCKET_URL!, status === "authenticated");

  useEffect(() => {
    if (status === "authenticated") {
      (async () => {
        await joinConversation(conversationId);
        // optionally fetch history via REST
        const res = await fetch(`/api/messages/history?conversationId=${conversationId}&limit=50`);
        const data = await res.json();
        if (data?.messages) setMessages(data.messages);
      })();
    }
  }, [conversationId, status]);

  const onSend = async (text: string) => {
    try {
      await sendMessage({ conversationId, text });
    } catch (err) {
      console.error("send failed", err);
    }
  };

  return (
    <div>
      <div style={{ height: 400, overflow: "auto" }}>
        {messages.map((m) => (
          <div key={m._id} style={{ padding: 8 }}>
            <strong>{m.sender?.name || (m.sender?._id === session?.user?.id ? "You" : "User")}</strong>
            <div>{m.text}</div>
            <small>{new Date(m.createdAt).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      <div>
        <input id="chatInput" placeholder="Message..." />
        <button onClick={() => {
          const el = document.getElementById("chatInput") as HTMLInputElement;
          if (el?.value) { onSend(el.value); el.value = ""; }
        }}>Send</button>
      </div>
    </div>
  );
}
