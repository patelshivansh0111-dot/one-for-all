"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { apiGet } from "@/lib/api";
import { CommunityCard } from "@/components/community/CommunityCard";
import { Button } from "@/components/ui/button";
import type { Community } from "@/types";

export default function CommunitiesPage() {
  const { data: communities = [], isLoading, isError } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const data = await apiGet<Community[] | { items: Community[] }>("/communities");
      return Array.isArray(data) ? data : data.items ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <header>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">COMMUNITIES</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
            Find your <span className="marker-yellow">people</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Small groups organized around shared experiences — not noisy chat servers.
          </p>
        </header>
        <Button asChild variant="secondary">
          <Link href="/communities/new">
            <Plus className="h-4 w-4" />
            Create community
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING COMMUNITIES…</div>
      ) : isError ? (
        <div className="editorial-card p-10 text-center">
          <p className="font-serif text-2xl">Couldn&apos;t load communities</p>
          <p className="mt-2 text-muted-foreground">Refresh in a moment if the API is waking up.</p>
        </div>
      ) : communities.length === 0 ? (
        <div className="editorial-card p-10 text-center">
          <p className="font-serif text-2xl">No communities yet</p>
          <Button asChild variant="secondary" className="mt-6">
            <Link href="/communities/new">Create one →</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => (
            <CommunityCard key={c._id} community={c} />
          ))}
        </div>
      )}
    </div>
  );
}
