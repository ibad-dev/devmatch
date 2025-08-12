"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

export function useSocket() {
  return useContext(SocketContext);
}

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const s = io("/api/socket/io", {
      path: "/api/socket/io",
      transports: ["websocket"],
      withCredentials: true,
    });

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [status]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}