"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_NAV } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

export function MobileBottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t-[1.5px] border-[#111] bg-[#F5F0E8] lg:hidden">
      <div className="mx-auto flex max-w-lg items-end justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {MOBILE_NAV.map((item) => {
          const href = item.href === "/profile" ? (user ? `/u/${user.username}` : "/login") : item.href;
          const active =
            item.href === "/profile"
              ? pathname.startsWith("/u/")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const isAsk = item.href === "/ask";

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 font-mono text-[9px] uppercase tracking-[0.08em]",
                active ? "text-[#111]" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full border-[1.5px] border-[#111]",
                  isAsk
                    ? "-mt-5 h-14 w-14 bg-[#FFD34E] shadow-[3px_3px_0_#111]"
                    : active
                      ? "h-9 w-9 bg-white shadow-[2px_2px_0_#111]"
                      : "h-9 w-9 bg-transparent"
                )}
              >
                <Icon className={cn(isAsk ? "h-5 w-5" : "h-4 w-4")} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
