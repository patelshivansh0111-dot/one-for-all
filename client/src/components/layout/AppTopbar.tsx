"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-[1.5px] border-[#111] bg-[#F5F0E8]/95 px-4 py-3 backdrop-blur-sm">
      <div>
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">TODAY</p>
        <h1 className="font-serif text-xl leading-tight sm:text-2xl">What are you trying to figure out?</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="soft" size="icon" aria-label="Search">
          <Link href="/search">
            <Search className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
          <Link href="/ask">Ask →</Link>
        </Button>
      </div>
    </header>
  );
}
