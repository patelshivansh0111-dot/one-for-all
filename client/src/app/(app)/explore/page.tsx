"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { CommunityCard } from "@/components/community/CommunityCard";
import { Button } from "@/components/ui/button";
import {
  DEMO_COMMUNITIES,
  DEMO_MATCHES,
  DEMO_PEOPLE,
  POPULAR_TOPICS,
} from "@/lib/constants";
import type { Community, LeaderboardEntry, MatchedPerson, Question, User } from "@/types";

const FALLBACK_QUESTIONS: Question[] = [
  {
    _id: "t1",
    content: "How do I get my first freelance client with no portfolio?",
    category: "FREELANCING",
    tags: ["FREELANCING", "CLIENTS"],
    isAnonymous: false,
    answersCount: 14,
    helpfulCount: 52,
    author: { _id: "1", name: "Arjun", username: "arjun", headline: "Student" },
  },
  {
    _id: "t2",
    content: "What's the realistic path to starting a clothing brand in Gujarat?",
    category: "BUSINESS",
    tags: ["APPAREL", "GUJARAT", "STARTUPS"],
    isAnonymous: false,
    answersCount: 9,
    helpfulCount: 38,
    author: { _id: "2", name: "Kavya", username: "kavya", headline: "Aspiring founder" },
  },
  {
    _id: "t3",
    content: "Should I take a safe job or join an early-stage startup?",
    category: "CAREER",
    tags: ["CAREER", "STARTUPS"],
    isAnonymous: true,
    answersCount: 22,
    helpfulCount: 71,
    author: null,
  },
];

const FALLBACK_LEADERBOARD: LeaderboardEntry[] = DEMO_PEOPLE.slice(0, 5).map((p, i) => ({
  _id: p._id,
  name: p.name,
  username: p.username,
  peopleHelped: p.peopleHelped,
  questionsAnswered: 12 + i * 3,
  badges: i === 0 ? ["EARLY HELPER"] : [],
}));

export default function ExplorePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["explore"],
    queryFn: async () => {
      const [trendingRes, communitiesRes, leaderboardRes, matchRes] = await Promise.allSettled([
        apiGet<{ questions: Question[] }>("/questions/trending"),
        apiGet<Community[] | { items: Community[] }>("/communities"),
        apiGet<{ leaderboard: LeaderboardEntry[] }>("/achievements/leaderboard"),
        apiPost<{ people: MatchedPerson[] }>("/ai/match-people", {
          question: "People with experience starting businesses or helping others with career decisions",
        }),
      ]);

      const trending =
        trendingRes.status === "fulfilled" && trendingRes.value.questions?.length
          ? trendingRes.value.questions
          : FALLBACK_QUESTIONS;

      let communities: Community[] = DEMO_COMMUNITIES;
      if (communitiesRes.status === "fulfilled") {
        const raw = communitiesRes.value;
        const list = Array.isArray(raw) ? raw : raw.items ?? [];
        if (list.length) communities = list;
      }

      let leaderboard: LeaderboardEntry[] = FALLBACK_LEADERBOARD;
      if (leaderboardRes.status === "fulfilled" && leaderboardRes.value.leaderboard?.length) {
        leaderboard = leaderboardRes.value.leaderboard;
      }

      let people: MatchedPerson[] = DEMO_MATCHES.map((m, i) => ({
        _id: `m${i}`,
        name: m.name,
        username: m.name.toLowerCase().replace(/\s+/g, ""),
        headline: m.role,
        location: m.location,
        peopleHelped: m.helped,
        experienceTags: m.tags,
        matchReason: m.reason,
      }));
      if (matchRes.status === "fulfilled" && matchRes.value.people?.length) {
        people = matchRes.value.people;
      }

      return { trending, communities, leaderboard, people };
    },
  });

  const trending = data?.trending ?? FALLBACK_QUESTIONS;
  const communities = data?.communities ?? DEMO_COMMUNITIES;
  const leaderboard = data?.leaderboard ?? FALLBACK_LEADERBOARD;
  const people = data?.people ?? [];

  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">EXPLORE</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
          Discover questions, people & <span className="marker-yellow">communities</span>
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Real experience from people who&apos;ve been there — not generic advice.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[11px] tracking-[0.14em]">TRENDING QUESTIONS</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/home">See all →</Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING…</div>
        ) : (
          <div className="space-y-4">
            {trending.slice(0, 4).map((q) => (
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
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[11px] tracking-[0.14em]">PEOPLE YOU MAY WANT TO ASK</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {people.slice(0, 6).map((person) => (
            <div key={person._id} className="editorial-card p-5">
              <h3 className="font-serif text-xl">{person.name}</h3>
              <p className="text-sm text-muted-foreground">
                {person.headline || person.profession}
                {person.location ? ` · ${person.location}` : ""}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-wider">
                HELPED {person.peopleHelped ?? 0} PEOPLE
              </p>
              {person.matchReason && (
                <p className="mt-2 text-xs text-muted-foreground">{person.matchReason}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {(person.experienceTags || []).slice(0, 3).map((tag) => (
                  <span key={tag} className="sticker sticker-white">
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild variant="soft" size="sm" className="mt-4">
                <Link href={`/u/${person.username}`}>Ask →</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[11px] tracking-[0.14em]">ACTIVE COMMUNITIES</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/communities">Browse all →</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {communities.slice(0, 4).map((c) => (
            <CommunityCard key={c._id} community={c} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[11px] tracking-[0.14em]">TOP CONTRIBUTORS</h2>
        <div className="editorial-card divide-y-[1.5px] divide-[#111]/10">
          {leaderboard.slice(0, 5).map((entry, i) => (
            <Link
              key={entry._id}
              href={`/u/${entry.username}`}
              className="flex items-center gap-4 p-4 transition hover:bg-muted/30"
            >
              <span className="font-mono text-lg font-bold text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-white font-serif">
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-serif text-lg">{entry.name}</p>
                <p className="font-mono text-[10px] tracking-wider text-muted-foreground">
                  HELPED {entry.peopleHelped ?? entry.xp ?? 0} · {entry.questionsAnswered ?? 0} ANSWERS
                </p>
              </div>
              {entry.badges?.[0] && (
                <span className="sticker sticker-yellow">{entry.badges[0]}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[11px] tracking-[0.14em]">POPULAR TOPICS</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TOPICS.map((topic, i) => {
            const colors = [
              "sticker-yellow",
              "sticker-blue",
              "sticker-pink",
              "sticker-mint",
              "sticker-white",
            ];
            return (
              <Link key={topic} href={`/search?q=${encodeURIComponent(topic.toLowerCase())}`}>
                <span className={cnSticker(colors[i % colors.length])}>{topic}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function cnSticker(color: string) {
  return `sticker ${color} cursor-pointer transition hover:-translate-y-0.5`;
}
