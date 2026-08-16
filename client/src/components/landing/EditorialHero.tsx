"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { STICKER_COLORS } from "@/lib/constants";

const STICKERS = [
  { label: "BUSINESS", rotate: -8, x: "8%", y: "18%", color: STICKER_COLORS[0] },
  { label: "CAREER", rotate: 6, x: "78%", y: "14%", color: STICKER_COLORS[1] },
  { label: "SPORTS", rotate: -4, x: "86%", y: "48%", color: STICKER_COLORS[2] },
  { label: "LIFE", rotate: 10, x: "6%", y: "58%", color: STICKER_COLORS[3] },
  { label: "EDUCATION", rotate: -6, x: "72%", y: "72%", color: STICKER_COLORS[4] },
  { label: "STARTUPS", rotate: 8, x: "18%", y: "78%", color: STICKER_COLORS[0] },
  { label: "MONEY", rotate: -10, x: "58%", y: "8%", color: STICKER_COLORS[3] },
  { label: "SKILLS", rotate: 5, x: "42%", y: "86%", color: STICKER_COLORS[1] },
];

export function EditorialHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="index"
      className="relative overflow-hidden border-b-[1.5px] border-[#111] px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {STICKERS.map((s) => (
          <span
            key={s.label}
            className={`sticker absolute ${s.color} ${mounted ? "sticker-float" : ""}`}
            style={{ left: s.x, top: s.y, transform: `rotate(${s.rotate}deg)` }}
          >
            {s.label}
          </span>
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="mb-6 font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
          ASK PEOPLE WHO&apos;VE BEEN THERE
        </p>

        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="marker-yellow">Everyone</span> knows something.
          <br />
          <span className="marker-yellow">Someone</span> needs to know it.
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {
            "A community where you can ask the questions you're trying to figure out — and connect with people who've actually been there."
          }
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary">
            <Link href="/login?next=/ask">Ask a question →</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Explore the community</Link>
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-2 md:hidden">
          {["BUSINESS", "CAREER", "SPORTS", "LIFE", "EDUCATION", "STARTUPS"].map((label, i) => (
            <span key={label} className={`sticker ${STICKER_COLORS[i % STICKER_COLORS.length]}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {mounted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
        />
      )}
    </section>
  );
}
