"use client";

import { HOW_IT_WORKS } from "@/lib/constants";

const CYCLE = [
  { label: "ASK", sticker: "sticker-yellow" },
  { label: "MATCH", sticker: "sticker-blue" },
  { label: "LEARN", sticker: "sticker-mint" },
  { label: "GROW", sticker: "sticker-pink" },
  { label: "GIVE BACK", sticker: "sticker-yellow" },
  { label: "ASK", sticker: "sticker-blue" },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b-[1.5px] border-[#111] bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">HOW IT WORKS</p>
        <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl md:text-6xl">
          Ask. Learn. Grow. <span className="marker-yellow">Give back.</span>
        </h2>

        <div className="mt-12 grid gap-5 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="editorial-card p-6">
              <div className="font-mono text-sm tracking-[0.2em] text-muted-foreground">{item.step}</div>
              <h3 className="mt-4 font-serif text-3xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {CYCLE.map((step, i) => (
            <div key={`${step.label}-${i}`} className="flex items-center gap-2 sm:gap-3">
              <span className={`sticker ${step.sticker}`}>{step.label}</span>
              {i < CYCLE.length - 1 && (
                <span className="font-mono text-xs text-[#111]" aria-hidden>
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
