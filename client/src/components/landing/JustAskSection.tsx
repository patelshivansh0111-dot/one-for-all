"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EXAMPLE_QUESTIONS, CATEGORIES } from "@/lib/constants";

export function JustAskSection() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("CAREER");
  const [anonymous, setAnonymous] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setIndex((i) => (i + 1) % EXAMPLE_QUESTIONS.length), 3200);
    return () => clearInterval(id);
  }, []);

  const placeholder = EXAMPLE_QUESTIONS[index];

  return (
    <section id="ask-demo" className="border-b-[1.5px] border-[#111] bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-center font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
          THE CORE EXPERIENCE
        </p>
        <h2 className="mt-4 text-center font-serif text-5xl tracking-tight sm:text-6xl md:text-7xl">
          Just <span className="marker-yellow">ask.</span>
        </h2>

        <div className="editorial-card mt-12 p-5 sm:p-8">
          <div className="relative min-h-[9.5rem]">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              aria-label="What are you trying to figure out?"
              className="w-full resize-none rounded-2xl border-[1.5px] border-[#111] bg-[#F5F0E8] p-4 text-base outline-none focus:ring-2 focus:ring-accent-blue/30"
              placeholder=""
            />
            {!value && (
              <div className="pointer-events-none absolute inset-x-4 top-4 text-muted-foreground">
                <span className="font-mono text-[10px] tracking-[0.14em]">
                  WHAT ARE YOU TRYING TO FIGURE OUT?
                </span>
                {mounted ? (
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={placeholder}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-2 font-serif text-xl text-[#111]/70 sm:text-2xl"
                    >
                      {placeholder}
                    </motion.p>
                  </AnimatePresence>
                ) : (
                  <p className="mt-2 font-serif text-xl text-[#111]/70 sm:text-2xl">{EXAMPLE_QUESTIONS[0]}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label htmlFor="ask-category" className="font-mono text-[10px] tracking-[0.12em]">
              CATEGORY
            </label>
            <select
              id="ask-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-full border-[1.5px] border-[#111] bg-white px-3 py-2 font-mono text-[11px] uppercase tracking-wider outline-none"
            >
              {CATEGORIES.slice(0, 10).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setAnonymous((v) => !v)}
              className={`sticker ${anonymous ? "sticker-pink" : "sticker-white"}`}
            >
              {anonymous ? "ANONYMOUS ON" : "ASK ANONYMOUSLY"}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["FIRST CLIENT", "NO TEAM", "CAREER SWITCH"].map((tag) => (
              <span key={tag} className="sticker sticker-mint">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                const q = value.trim() || placeholder;
                router.push(
                  `/ask?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&anon=${anonymous}`
                );
              }}
            >
              Ask the community →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
