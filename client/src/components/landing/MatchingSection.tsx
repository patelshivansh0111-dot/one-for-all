"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEMO_MATCHES } from "@/lib/constants";

const EXAMPLE_QUESTION =
  "I want to start a clothing business in Gujarat but don't know anything about manufacturing or suppliers.";

const EXAMPLE_TAGS = ["BUSINESS", "CLOTHING", "MANUFACTURING", "GUJARAT"] as const;

const MATCHING_INTRO =
  "You ask about starting a clothing business in Gujarat. We find people with relevant experience — never claiming they know the answer, only that they may be able to help.";

export function MatchingSection() {
  return (
    <section id="people" className="border-b-[1.5px] border-[#111] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">AI PEOPLE MATCHING</p>
        <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl">
          People who <span className="marker-yellow">may be able to help.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-muted-foreground">{MATCHING_INTRO}</p>

        <div className="editorial-card-ink mt-8 p-5 sm:p-6">
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#F5F0E8]/70">EXAMPLE QUESTION</p>
          <p className="mt-3 font-serif text-xl text-[#F5F0E8] sm:text-2xl">{`"${EXAMPLE_QUESTION}"`}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLE_TAGS.map((t) => (
              <span key={t} className="sticker sticker-yellow">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 overflow-visible md:grid-cols-3">
          {DEMO_MATCHES.map((person) => (
            <article key={person.name} className="editorial-card flex flex-col p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-[#63d1b5] font-serif text-xl text-[#111]">
                {person.name.charAt(0)}
              </div>
              <h3 className="mt-4 font-serif text-2xl">{person.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{person.role}</p>
              <p className="font-mono text-[10px] tracking-wider text-muted-foreground">
                {person.years} · {person.location}
              </p>
              <p className="mt-4 font-mono text-[11px] font-semibold tracking-wider text-[#111]">
                HELPED {person.helped} PEOPLE
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{person.reason}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {person.tags.map((tag) => (
                  <span key={tag} className="sticker sticker-white">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex-1" />
              <Button asChild variant="soft" className="w-full sm:w-auto">
                <Link href="/people">Ask {person.name.split(" ")[0]} →</Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
