"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { formatRelativeTime, getApiErrorMessage, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import type { Answer, Question, User } from "@/types";

export default function QuestionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);
  const [answerText, setAnswerText] = useState("");
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  const { data: question, isLoading: questionLoading } = useQuery({
    queryKey: ["question", id],
    queryFn: async () => {
      const res = await apiGet<{ question: Question } | Question>(`/questions/${id}`);
      return res && typeof res === "object" && "question" in res ? res.question : (res as Question);
    },
  });

  const { data: answers = [], isLoading: answersLoading } = useQuery({
    queryKey: ["answers", id],
    queryFn: async () => {
      const res = await apiGet<{ answers: Answer[] } | Answer[]>("/answers", { questionId: id });
      return Array.isArray(res) ? res : res.answers ?? [];
    },
    enabled: !!question,
  });

  const isOwnQuestion =
    Boolean(currentUser?._id) &&
    Boolean(question?.author?._id) &&
    String(currentUser?._id) === String(question?.author?._id);

  const postAnswer = useMutation({
    mutationFn: () => apiPost<{ answer: Answer } | Answer>("/answers", { questionId: id, content: answerText }),
    onSuccess: () => {
      setAnswerText("");
      queryClient.invalidateQueries({ queryKey: ["answers", id] });
      queryClient.invalidateQueries({ queryKey: ["question", id] });
      toast.success("Answer posted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const markHelpful = async (answerId: string) => {
    if (helpfulIds.has(answerId)) return;
    try {
      await apiPost(`/answers/${answerId}/helpful`);
      setHelpfulIds((prev) => new Set(prev).add(answerId));
      queryClient.invalidateQueries({ queryKey: ["answers", id] });
      toast.success("Marked as helpful");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not mark as helpful"));
    }
  };

  if (questionLoading) {
    return <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING QUESTION…</div>;
  }

  if (!question) {
    return (
      <div className="editorial-card p-10 text-center">
        <p className="font-serif text-2xl">Question not found</p>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/home">Back to home →</Link>
        </Button>
      </div>
    );
  }

  const authorName = question.isAnonymous ? "Anonymous" : question.author?.name || "Member";
  const authorHeadline =
    question.author?.headline ||
    question.author?.experienceTags?.[0] ||
    (question.isAnonymous ? "Community member" : "Asking the community");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <article className="editorial-card p-5 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-white font-serif text-xl">
              {question.isAnonymous ? "?" : authorName.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{authorName}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {authorHeadline}
              </p>
            </div>
          </div>
          <span className="sticker sticker-yellow">{question.category}</span>
        </div>

        <h1 className="mt-6 font-serif text-2xl leading-snug sm:text-3xl">{question.content}</h1>

        {question.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <span key={tag} className="sticker sticker-white">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-4 border-t-[1.5px] border-[#111]/15 pt-4 font-mono text-[11px] tracking-wider">
          <span>{question.answersCount ?? answers.length} ANSWERS</span>
          <span>{question.helpfulCount ?? 0} FOUND HELPFUL</span>
          {question.createdAt && <span>{formatRelativeTime(question.createdAt)}</span>}
        </div>
      </article>

      <section className="space-y-4">
        <h2 className="font-mono text-[11px] tracking-[0.14em]">
          {answers.length} {answers.length === 1 ? "ANSWER" : "ANSWERS"}
        </h2>

        {answersLoading ? (
          <div className="editorial-card p-6 font-mono text-xs">LOADING ANSWERS…</div>
        ) : answers.length === 0 ? (
          <div className="editorial-card p-6 text-sm text-muted-foreground">
            No answers yet. Be the first to share experience — if this isn&apos;t your question.
          </div>
        ) : (
          answers.map((answer) => (
            <div key={answer._id} className="editorial-card p-5">
              {answer.isBestAnswer && (
                <span className="sticker sticker-mint mb-3">BEST ANSWER</span>
              )}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-white font-serif">
                  {answer.author?.name ? getInitials(answer.author.name) : "?"}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {answer.author?.username ? (
                      <Link href={`/u/${answer.author.username}`} className="font-serif text-lg hover:underline">
                        {answer.author.name}
                      </Link>
                    ) : (
                      <span className="font-serif text-lg">{answer.author?.name || "Member"}</span>
                    )}
                    {answer.author?.headline && (
                      <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                        {answer.author.headline}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 leading-relaxed">{answer.content}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      size="sm"
                      variant={helpfulIds.has(answer._id) ? "secondary" : "outline"}
                      onClick={() => markHelpful(answer._id)}
                    >
                      Helpful · {answer.helpfulCount + (helpfulIds.has(answer._id) ? 1 : 0)}
                    </Button>
                    {answer.createdAt && (
                      <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                        {formatRelativeTime(answer.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="editorial-card p-5 sm:p-8">
        <h2 className="font-serif text-2xl">Share your experience</h2>
        {isOwnQuestion ? (
          <p className="mt-2 text-sm text-muted-foreground">
            This is your question — wait for others to answer. You can&apos;t answer your own question.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              You don&apos;t need the perfect answer — share what worked (or didn&apos;t) for you.
            </p>
            {isAuthenticated ? (
              <>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={5}
                  placeholder="Write your answer…"
                  className="mt-4 w-full resize-none rounded-2xl border-[1.5px] border-[#111] bg-[#F5F0E8] p-4 font-serif text-lg outline-none focus:ring-2 focus:ring-accent-blue/30"
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="secondary"
                    disabled={!answerText.trim() || postAnswer.isPending}
                    onClick={() => postAnswer.mutate()}
                  >
                    {postAnswer.isPending ? "Posting…" : "Post answer →"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-muted-foreground">Sign in to share your experience.</p>
                <Button asChild variant="secondary" className="mt-4">
                  <Link href="/login">Sign in →</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
