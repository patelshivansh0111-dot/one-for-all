"use client";

import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setIsConnected(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const socket = connectSocket(token || undefined);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [user]);

  return { socket: getSocket(), isConnected };
}
