"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DEMO_PEOPLE } from "@/lib/constants";
import type { User } from "@/types";

export default function PeoplePage() {
  const [query, setQuery] = useState("");

  const { data: people = DEMO_PEOPLE, isLoading } = useQuery({
    queryKey: ["people", query],
    queryFn: async () => {
      try {
        if (query.trim()) {
          const res = await apiGet<{ users: User[] }>("/search", { q: query, type: "users" });
          if (res.users?.length) return res.users;
        }
        const users = await apiGet<User[] | { users: User[] }>("/users");
        const list = Array.isArray(users) ? users : users.users ?? [];
        return list.length ? list : DEMO_PEOPLE;
      } catch {
        if (query.trim()) {
          const q = query.toLowerCase();
          return DEMO_PEOPLE.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.headline?.toLowerCase().includes(q) ||
              p.location?.toLowerCase().includes(q) ||
              p.experienceTags?.some((t) => t.toLowerCase().includes(q))
          );
        }
        return DEMO_PEOPLE;
      }
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">PEOPLE</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
          People with <span className="marker-yellow">real experience</span>
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Not influencers. Not gurus. People who&apos;ve actually done the thing you&apos;re trying to figure out.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, location, or experience…"
          className="w-full rounded-full border-[1.5px] border-[#111] bg-white py-3 pl-11 pr-4 font-mono text-xs outline-none focus:ring-2 focus:ring-accent-blue/30"
        />
      </div>

      {isLoading ? (
        <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING PEOPLE…</div>
      ) : people.length === 0 ? (
        <div className="editorial-card p-10 text-center">
          <p className="font-serif text-2xl">No people found</p>
          <p className="mt-2 text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => {
            const tags = person.experienceTags || (person as { tags?: string[] }).tags || [];
            const helped = person.peopleHelped ?? 0;
            return (
              <article key={person._id} className="editorial-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-white font-serif text-xl">
                    {person.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-xl">{person.name}</h2>
                    <p className="text-sm text-muted-foreground">{person.headline || (person as User).profession}</p>
                    {person.location && (
                      <p className="mt-1 font-mono text-[10px] tracking-wider text-muted-foreground">
                        {person.location.toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-3 font-mono text-[11px] tracking-wider">HELPED {helped} PEOPLE</p>
                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="sticker sticker-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Button asChild variant="secondary" size="sm" className="mt-4">
                  <Link href={`/u/${person.username}`}>Ask {person.name.split(" ")[0]} →</Link>
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
