"use client";

import Link from "next/link";
import { APP_NAME, APP_SUBTITLE, LANDING_NAV } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function EditorialNav() {
  return (
    <header className="sticky top-0 z-40 border-b-[1.5px] border-[#111] bg-[#F5F0E8]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="min-w-0">
          <div className="font-serif text-2xl leading-none tracking-tight sm:text-3xl">{APP_NAME}</div>
          <div className="mt-1 hidden font-mono text-[9px] tracking-[0.16em] text-muted-foreground sm:block">
            {APP_SUBTITLE}
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] font-medium tracking-[0.14em] text-[#111] transition hover:opacity-60"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button asChild size="sm" variant="secondary">
          <Link href="/login?next=/ask">Ask something ↗</Link>
        </Button>
      </div>
    </header>
  );
}
