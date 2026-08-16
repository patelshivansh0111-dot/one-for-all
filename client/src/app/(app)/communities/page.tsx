"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { apiGet } from "@/lib/api";
import { CommunityCard } from "@/components/community/CommunityCard";
import { Button } from "@/components/ui/button";
import { DEMO_COMMUNITIES } from "@/lib/constants";
import type { Community } from "@/types";

export default function CommunitiesPage() {
  const { data: communities = DEMO_COMMUNITIES, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      try {
        const data = await apiGet<Community[] | { items: Community[] }>("/communities");
        const list = Array.isArray(data) ? data : data.items ?? [];
        return list.length ? list : DEMO_COMMUNITIES;
      } catch {
        return DEMO_COMMUNITIES;
      }
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
