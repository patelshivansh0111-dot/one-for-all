"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { apiGet } from "@/lib/api";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { CommunityCard } from "@/components/community/CommunityCard";
import { Button } from "@/components/ui/button";
import { POPULAR_TOPICS } from "@/lib/constants";
import type { SearchResults, User } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"all" | "questions" | "people" | "communities" | "topics">("all");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query.trim()) return { users: [], communities: [], questions: [] } as SearchResults;
      try {
        return await apiGet<SearchResults>("/search", { q: query });
      } catch {
        return { users: [], communities: [], questions: [] };
      }
    },
    enabled: query.trim().length >= 2,
  });

  const hasResults =
    data &&
    (data.users.length + data.communities.length + data.questions.length > 0);

  const tabs = [
    { id: "all" as const, label: "ALL" },
    { id: "questions" as const, label: "QUESTIONS" },
    { id: "people" as const, label: "PEOPLE" },
    { id: "communities" as const, label: "COMMUNITIES" },
    { id: "topics" as const, label: "TOPICS" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">SEARCH</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
          Find experience, not <span className="marker-yellow">noise</span>
        </h1>
      </header>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="People who started a clothing business in Gujarat"
          className="w-full rounded-full border-[1.5px] border-[#111] bg-white py-3 pl-11 pr-4 font-serif text-base outline-none focus:ring-2 focus:ring-accent-blue/30 sm:text-lg"
          autoFocus
        />
      </div>

      {!query.trim() && (
        <div>
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">TRY SEARCHING FOR</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setQuery(topic.toLowerCase())}
                className="sticker sticker-white transition hover:-translate-y-0.5"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {query.trim().length >= 2 && (
        <>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`sticker ${activeTab === tab.id ? "sticker-yellow" : "sticker-white"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading || isFetching ? (
            <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">SEARCHING…</div>
          ) : !hasResults && activeTab !== "topics" ? (
            <div className="editorial-card p-10 text-center">
              <p className="font-serif text-2xl">No results for &ldquo;{query}&rdquo;</p>
              <p className="mt-2 text-muted-foreground">Try a different phrase or browse explore.</p>
              <Button asChild variant="secondary" className="mt-6">
                <Link href="/explore">Explore →</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {(activeTab === "all" || activeTab === "questions") && data!.questions.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-mono text-[11px] tracking-[0.14em]">QUESTIONS</h2>
                  {data!.questions.map((q) => (
                    <QuestionCard
                      key={q._id}
                      question={{
                        id: q._id,
                        content: q.content,
                        category: q.category,
                        tags: q.tags,
                        answersCount: q.answersCount,
                        helpfulCount: q.helpfulCount,
                        isAnonymous: q.isAnonymous,
                        author: q.author as User | null,
                      }}
                    />
                  ))}
                </section>
              )}

              {(activeTab === "all" || activeTab === "people") && data!.users.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-mono text-[11px] tracking-[0.14em]">PEOPLE</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data!.users.map((u) => (
                      <Link key={u._id} href={`/u/${u.username}`} className="editorial-card block p-4 transition hover:-translate-y-0.5">
                        <p className="font-serif text-xl">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.headline || u.bio}</p>
                        <p className="mt-2 font-mono text-[10px] tracking-wider">@{u.username}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {(activeTab === "all" || activeTab === "communities") && data!.communities.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-mono text-[11px] tracking-[0.14em]">COMMUNITIES</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data!.communities.map((c) => (
                      <CommunityCard key={c._id} community={c} />
                    ))}
                  </div>
                </section>
              )}

              {activeTab === "topics" && (
                <section className="space-y-4">
                  <h2 className="font-mono text-[11px] tracking-[0.14em]">MATCHING TOPICS</h2>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TOPICS.filter((t) =>
                      t.toLowerCase().includes(query.toLowerCase())
                    ).map((topic) => (
                      <Link key={topic} href={`/search?q=${encodeURIComponent(topic.toLowerCase())}`}>
                        <span className="sticker sticker-mint">{topic}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING SEARCH…</div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
