"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { apiGet } from "@/lib/api";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { Button } from "@/components/ui/button";
import type { Question, User } from "@/types";

const FALLBACK_SAVED: Question[] = [];

export default function SavedPage() {
  const { data: questions = FALLBACK_SAVED, isLoading } = useQuery({
    queryKey: ["saved-questions"],
    queryFn: async () => {
      try {
        const res = await apiGet<{ questions: Question[] } | Question[]>("/questions/saved");
        const list = Array.isArray(res) ? res : res.questions ?? [];
        return list;
      } catch {
        return FALLBACK_SAVED;
      }
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">SAVED</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
          Questions to <span className="marker-yellow">revisit</span>
        </h1>
        <p className="mt-3 text-muted-foreground">Answers and threads you want to come back to.</p>
      </header>

      {isLoading ? (
        <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING…</div>
      ) : questions.length === 0 ? (
        <div className="editorial-card flex flex-col items-center p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-white">
            <Bookmark className="h-7 w-7" />
          </div>
          <p className="font-serif text-2xl">Nothing saved yet</p>
          <p className="mt-2 max-w-sm text-muted-foreground">
            When you find a question worth revisiting, save it from the feed or question page.
          </p>
          <Button asChild variant="secondary" className="mt-6">
            <Link href="/home">Browse questions →</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
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
        </div>
      )}
    </div>
  );
}
