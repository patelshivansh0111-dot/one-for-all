"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { Button } from "@/components/ui/button";
import type { Question, User } from "@/types";

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["questions-feed"],
    queryFn: async () => {
      const res = await apiGet<{ questions: Question[] }>("/questions");
      return res.questions ?? [];
    },
  });

  const questions = data ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <div className="editorial-card-ink p-5">
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#F5F0E8]/60">PRIMARY ACTION</p>
          <h2 className="mt-2 font-serif text-3xl text-[#F5F0E8]">What are you trying to figure out?</h2>
          <Button asChild variant="secondary" className="mt-5">
            <Link href="/ask">Ask a question →</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING QUESTIONS…</div>
        ) : isError ? (
          <div className="editorial-card p-8">
            <p className="font-serif text-xl">Couldn&apos;t load questions</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The API may be waking up. Wait a moment and refresh.
            </p>
          </div>
        ) : questions.length === 0 ? (
          <div className="editorial-card p-8">
            <p className="font-serif text-xl">No questions yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Be the first to ask the community.</p>
            <Button asChild variant="secondary" className="mt-5">
              <Link href="/ask">Ask a question →</Link>
            </Button>
          </div>
        ) : (
          questions.map((q) => (
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
          ))
        )}
      </div>

      <aside className="hidden space-y-4 lg:block">
        <div className="editorial-card p-4">
          <h3 className="font-mono text-[11px] tracking-[0.14em]">PEOPLE WHO MAY HELP</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Browse people with real experience across topics.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link href="/people">See people →</Link>
          </Button>
        </div>

        <div className="editorial-card p-4">
          <h3 className="font-mono text-[11px] tracking-[0.14em]">TRENDING TOPICS</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {["STARTUPS", "FREELANCING", "CAREER", "MONEY", "SPORTS"].map((t) => (
              <Link key={t} href={`/search?q=${encodeURIComponent(t.toLowerCase())}`}>
                <span className="sticker sticker-white">{t}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
