"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const COMMUNITIES = [
  { name: "Startups", members: "12.4k", sticker: "sticker-yellow" },
  { name: "Business", members: "18.1k", sticker: "sticker-mint" },
  { name: "Programming", members: "22.0k", sticker: "sticker-blue" },
  { name: "Sports", members: "9.2k", sticker: "sticker-pink" },
  { name: "Career", members: "15.7k", sticker: "sticker-white" },
  { name: "College", members: "11.3k", sticker: "sticker-yellow" },
  { name: "Freelancing", members: "8.6k", sticker: "sticker-mint" },
  { name: "Finance", members: "10.9k", sticker: "sticker-white" },
];

const CATEGORY_STICKERS = ["sticker-yellow", "sticker-blue", "sticker-mint", "sticker-pink"] as const;

export function CommunitiesPreview() {
  return (
    <section id="communities" className="border-b-[1.5px] border-[#111] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">COMMUNITIES</p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">
              Find your people by <span className="marker-yellow">experience.</span>
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/communities">Browse all →</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
          {COMMUNITIES.map((c) => (
            <Link
              key={c.name}
              href="/communities"
              className="editorial-card p-5 transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111]"
            >
              <span className={`sticker ${c.sticker}`}>{c.name.toUpperCase()}</span>
              <h3 className="mt-5 font-serif text-2xl">{c.name}</h3>
              <p className="mt-2 font-mono text-[11px] tracking-wider text-muted-foreground">
                {c.members} MEMBERS
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-2.5">
          {CATEGORIES.slice(0, 12).map((cat, i) => (
            <span key={cat} className={`sticker ${CATEGORY_STICKERS[i % CATEGORY_STICKERS.length]}`}>
              {cat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
