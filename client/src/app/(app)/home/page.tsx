"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { Button } from "@/components/ui/button";
import type { Question, User } from "@/types";
import { DEMO_MATCHES } from "@/lib/constants";

const FALLBACK_QUESTIONS: Question[] = [
  {
    _id: "demo-1",
    content:
      "I know basic programming and want to start freelancing, but I have no idea how to get my first client. Where should I start?",
    category: "FREELANCING",
    tags: ["FREELANCING", "WEB DEVELOPMENT", "CAREER"],
    isAnonymous: false,
    answersCount: 12,
    helpfulCount: 47,
    author: {
      _id: "1",
      name: "Shiv",
      username: "shiv",
      headline: "College Student",
    },
  },
  {
    _id: "demo-2",
    content:
      "I want to start a clothing business in Gujarat but don't know anything about manufacturing or suppliers.",
    category: "BUSINESS",
    tags: ["APPAREL", "MANUFACTURING", "GUJARAT"],
    isAnonymous: false,
    answersCount: 8,
    helpfulCount: 29,
    author: {
      _id: "2",
      name: "Ananya",
      username: "ananya",
      headline: "Aspiring founder",
    },
  },
  {
    _id: "demo-3",
    content: "Should I choose CSE or pursue design if I care more about product than pure coding?",
    category: "CAREER",
    tags: ["COLLEGE", "DESIGN", "CAREER"],
    isAnonymous: true,
    answersCount: 21,
    helpfulCount: 63,
    author: null,
  },
];

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["questions-feed"],
    queryFn: async () => {
      try {
        const res = await apiGet<{ questions: Question[] }>("/questions");
        return res.questions?.length ? res.questions : FALLBACK_QUESTIONS;
      } catch {
        return FALLBACK_QUESTIONS;
      }
    },
  });

  const questions = data || FALLBACK_QUESTIONS;

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
          <div className="mt-4 space-y-4">
            {DEMO_MATCHES.slice(0, 3).map((p) => (
              <div key={p.name} className="border-t-[1.5px] border-[#111]/10 pt-3 first:border-0 first:pt-0">
                <div className="font-serif text-lg">{p.name}</div>
                <p className="text-xs text-muted-foreground">{p.role}</p>
                <p className="mt-1 font-mono text-[10px] tracking-wider">HELPED {p.helped}</p>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link href="/people">See people →</Link>
          </Button>
        </div>

        <div className="editorial-card p-4">
          <h3 className="font-mono text-[11px] tracking-[0.14em]">TRENDING TOPICS</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {["STARTUPS", "FREELANCING", "CAREER", "MONEY", "SPORTS"].map((t) => (
              <span key={t} className="sticker sticker-white">
                {t}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
