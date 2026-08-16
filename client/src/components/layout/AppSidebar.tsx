"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME, APP_NAV, APP_SUBTITLE } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r-[1.5px] border-[#111] bg-[#FFFDF8] lg:flex">
      <div className="border-b-[1.5px] border-[#111] px-5 py-5">
        <Link href="/home">
          <div className="font-serif text-2xl leading-none">{APP_NAME}</div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
            {APP_SUBTITLE}
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {APP_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full border-[1.5px] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition",
                active
                  ? "border-[#111] bg-[#FFD34E] shadow-[2px_2px_0_#111]"
                  : "border-transparent hover:border-[#111] hover:bg-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t-[1.5px] border-[#111] p-4">
        <Button asChild variant="secondary" className="w-full">
          <Link href="/ask">Ask something →</Link>
        </Button>
        {user && (
          <Link
            href={`/u/${user.username}`}
            className="mt-3 flex items-center gap-3 rounded-2xl border-[1.5px] border-[#111] bg-white p-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-[#63D1B5] font-serif text-[#111]">
              {user.name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user.name}</div>
              <div className="truncate font-mono text-[10px] text-muted-foreground">@{user.username}</div>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
