"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CATEGORIES, EXAMPLE_QUESTIONS } from "@/lib/constants";
import { getApiErrorMessage } from "@/lib/utils";
import type { MatchedPerson, Question } from "@/types";

function AskPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [content, setContent] = useState(params.get("q") || "");
  const [category, setCategory] = useState((params.get("category") || "CAREER").toUpperCase());
  const [isAnonymous, setIsAnonymous] = useState(params.get("anon") === "true");
  const [tags, setTags] = useState("");
  const [matches, setMatches] = useState<MatchedPerson[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [createdQuestion, setCreatedQuestion] = useState<Question | null>(null);
  const [step, setStep] = useState<"compose" | "matching" | "results">("compose");

  const categoryOptions = useMemo(
    () => Array.from(new Set([...CATEGORIES.map(String), category])),
    [category]
  );

  const submit = useMutation({
    mutationFn: async () => {
      setStep("matching");
      setMatches([]);
      setTopics([]);
      setCreatedQuestion(null);

      const createdRes = await apiPost<{ question: Question } | Question>("/questions", {
        content,
        category: category.toLowerCase().replace(/\s+/g, "-"),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isAnonymous,
      });
      const created =
        createdRes && typeof createdRes === "object" && "question" in createdRes
          ? createdRes.question
          : (createdRes as Question);
      setCreatedQuestion(created);

      try {
        const match = await apiPost<{ people: MatchedPerson[]; topics: string[] }>("/ai/match-people", {
          question: content,
          category,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        });
        setMatches(match.people || []);
        setTopics(match.topics || []);
      } catch {
        setMatches([]);
        setTopics([]);
      }

      return created;
    },
    onSuccess: () => {
      setStep("results");
      toast.success("Question posted");
    },
    onError: (error) => {
      setStep("compose");
      toast.error(getApiErrorMessage(error, "Could not post your question. Sign in and try again."));
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">ASK</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
          What are you trying to <span className="marker-yellow">figure out?</span>
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {step === "compose" && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="editorial-card space-y-5 p-5 sm:p-8"
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder={EXAMPLE_QUESTIONS[0]}
              className="w-full resize-none rounded-2xl border-[1.5px] border-[#111] bg-[#F5F0E8] p-4 font-serif text-xl outline-none focus:ring-2 focus:ring-accent-blue/30"
            />

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-full border-[1.5px] border-[#111] bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-wider"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setIsAnonymous((v) => !v)}
                className={`sticker ${isAnonymous ? "sticker-pink" : "sticker-white"}`}
              >
                {isAnonymous ? "ANONYMOUS ON" : "ASK ANONYMOUSLY"}
              </button>
            </div>

            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 font-mono text-xs outline-none"
            />

            <p className="text-sm text-muted-foreground">
              Your identity stays hidden if you ask anonymously. We still keep account-level moderation to
              prevent abuse. Community answers are experience-sharing — not professional medical, legal, or
              financial advice.
            </p>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="lg"
                disabled={!content.trim() || submit.isPending}
                onClick={() => submit.mutate()}
              >
                Ask the community →
              </Button>
            </div>
          </motion.div>
        )}

        {step === "matching" && (
          <motion.div
            key="matching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="editorial-card p-10 text-center"
          >
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#111] border-t-transparent" />
            <p className="mt-6 font-mono text-xs tracking-[0.16em]">FINDING PEOPLE WHO MAY BE ABLE TO HELP…</p>
            <p className="mt-3 font-serif text-2xl">Looking for relevant experience, not perfect answers.</p>
          </motion.div>
        )}

        {step === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="editorial-card-ink p-6">
              <p className="font-mono text-[10px] tracking-[0.16em] text-[#F5F0E8]/60">YOUR QUESTION</p>
              <p className="mt-3 font-serif text-2xl text-[#F5F0E8]">&ldquo;{content}&rdquo;</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from(
                  new Set(
                    [category, ...topics]
                      .map((t) => String(t).trim().toUpperCase())
                      .filter(Boolean)
                  )
                )
                  .slice(0, 6)
                  .map((t) => (
                    <span key={t} className="sticker sticker-yellow">
                      {t}
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-3xl">People who may be able to help</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                These people may have relevant experience. They don&apos;t necessarily know the answer.
              </p>
            </div>

            <div className="grid gap-4">
              {matches.length ? (
                matches.map((person) => (
                  <div key={person._id} className="editorial-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-2xl">{person.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {person.headline || person.profession} · {person.location || "India"}
                        </p>
                        <p className="mt-2 font-mono text-[11px] tracking-wider">
                          HELPED {person.peopleHelped ?? 0} PEOPLE
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">{person.matchReason}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(person.experienceTags || []).slice(0, 4).map((tag) => (
                            <span key={tag} className="sticker sticker-white">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button variant="soft" onClick={() => router.push(`/u/${person.username}`)}>
                        Ask {person.name.split(" ")[0]} →
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="editorial-card p-6">
                  <p className="font-serif text-xl">No matches yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your question is posted. As more people join with relevant experience, they&apos;ll show up
                    here.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() =>
                  router.push(createdQuestion?._id ? `/questions/${createdQuestion._id}` : "/home")
                }
              >
                {createdQuestion?._id ? "View question →" : "Go to feed →"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/home")}>
                Go to feed →
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("compose");
                  setMatches([]);
                  setCreatedQuestion(null);
                }}
              >
                Ask another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense
      fallback={
        <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING ASK…</div>
      }
    >
      <AskPageContent />
    </Suspense>
  );
}
