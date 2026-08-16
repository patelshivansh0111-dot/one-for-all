"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { apiGet, apiPatch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";
import type { Notification } from "@/types";

const iconMap = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: MessageCircle,
  message: MessageCircle,
  answer: MessageCircle,
  helpful: Heart,
  event: Bell,
  system: Bell,
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const data = await apiGet<Notification[]>("/notifications");
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
  });

  useEffect(() => {
    if (!socket) return;
    const handler = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [socket, queryClient]);

  const markAllRead = async () => {
    try {
      await apiPatch("/notifications/read-all");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <header>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">NOTIFICATIONS</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Stay in the loop</h1>
          <p className="mt-2 text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </header>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING…</div>
      ) : notifications.length === 0 ? (
        <div className="editorial-card flex flex-col items-center p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-white">
            <Bell className="h-7 w-7" />
          </div>
          <p className="font-serif text-2xl">No notifications yet</p>
          <p className="mt-2 text-muted-foreground">
            When someone answers your question or finds your answer helpful, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconMap[n.type as keyof typeof iconMap] || Bell;
            const content = (
              <div
                className={`editorial-card flex items-start gap-3 p-4 transition hover:-translate-y-0.5 ${
                  !n.read ? "bg-[#FFD34E]/15" : ""
                }`}
              >
                {n.actor ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-white font-serif text-sm">
                    {n.actor.avatar ? (
                      <img src={n.actor.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      getInitials(n.actor.name)
                    )}
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-white">
                    <Icon className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 font-mono text-[10px] tracking-wider text-muted-foreground">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>
                {!n.read && <span className="sticker sticker-yellow">NEW</span>}
              </div>
            );

            return n.link ? (
              <Link key={n._id} href={n.link}>
                {content}
              </Link>
            ) : (
              <div key={n._id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
