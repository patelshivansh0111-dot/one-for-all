"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PHILOSOPHY, VISION } from "@/lib/constants";

export function LandingCTA() {
  return (
    <section id="about" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="editorial-card-ink mx-auto max-w-5xl px-6 py-14 text-center sm:px-12">
        <p className="font-mono text-[11px] tracking-[0.2em] text-[#F5F0E8]/60">{PHILOSOPHY}</p>
        <h2 className="mt-6 font-serif text-4xl leading-tight tracking-tight text-[#F5F0E8] sm:text-5xl md:text-6xl">
          When you don&apos;t know what to do, you shouldn&apos;t have to figure it out alone.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[#F5F0E8]/75">{VISION}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">Join One for All →</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-[#F5F0E8] bg-transparent text-[#F5F0E8] hover:bg-white/10"
          >
            <Link href="/login?next=/ask">Ask something</Link>
          </Button>
        </div>
      </div>

      <footer className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t-[1.5px] border-[#111] pt-8 sm:flex-row">
        <div>
          <div className="font-serif text-xl text-[#111]">One for All</div>
          <div className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
            A COMMUNITY FOR HUMAN EXPERIENCE
          </div>
        </div>
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground">© 2026 ONE FOR ALL</p>
      </footer>
    </section>
  );
}
