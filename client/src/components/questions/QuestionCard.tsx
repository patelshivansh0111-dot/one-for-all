"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QuestionCardData {
  id: string;
  content: string;
  category: string;
  tags?: string[];
  answersCount?: number;
  helpfulCount?: number;
  isAnonymous?: boolean;
  author?: {
    name?: string;
    username?: string;
    headline?: string;
    experienceTags?: string[];
  } | null;
}

const CATEGORY_STICKERS = ["sticker-yellow", "sticker-blue", "sticker-pink", "sticker-mint"] as const;

export function QuestionCard({ question }: { question: QuestionCardData }) {
  const sticker = CATEGORY_STICKERS[question.category.length % CATEGORY_STICKERS.length];
  const displayName = question.isAnonymous ? "Anonymous" : question.author?.name || "Member";
  const experience =
    question.author?.headline ||
    question.author?.experienceTags?.[0] ||
    (question.isAnonymous ? "Community member" : "Sharing a question");

  return (
    <article className="editorial-card p-5 transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-white font-serif text-lg text-[#111]">
            {question.isAnonymous ? "?" : displayName.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-[#111]">{displayName}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {experience}
            </div>
          </div>
        </div>
        <span className={cn("sticker", sticker)}>{question.category}</span>
      </div>

      <Link href={`/questions/${question.id}`} className="mt-4 block">
        <p className="font-serif text-xl leading-snug text-[#111] sm:text-2xl">{question.content}</p>
      </Link>

      {!!question.tags?.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {question.tags.map((tag) => (
            <span key={tag} className="sticker sticker-white">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t-[1.5px] border-[#111]/15 pt-4">
        <span className="font-mono text-[11px] tracking-wider text-[#111]">
          {question.answersCount ?? 0} ANSWERS
        </span>
        <span className="font-mono text-[11px] tracking-wider text-[#111]">
          {question.helpfulCount ?? 0} FOUND HELPFUL
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button asChild size="sm" variant="soft">
            <Link href={`/questions/${question.id}`}>Answer</Link>
          </Button>
          <Button size="sm" variant="outline">
            Helpful
          </Button>
          <Button size="sm" variant="ghost">
            Save
          </Button>
        </div>
      </div>
    </article>
  );
}
