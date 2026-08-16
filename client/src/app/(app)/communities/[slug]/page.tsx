"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { getApiErrorMessage, getInitials } from "@/lib/utils";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { Button } from "@/components/ui/button";
import type { Community, Question, User } from "@/types";

export default function CommunityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const queryClient = useQueryClient();

  const { data: community, isLoading } = useQuery({
    queryKey: ["community", slug],
    queryFn: async () => {
      try {
        return await apiGet<Community>(`/communities/${slug}`);
      } catch {
        return null;
      }
    },
  });

  const { data: questions = [] } = useQuery({
    queryKey: ["community-questions", slug],
    queryFn: async () => {
      try {
        const data = await apiGet<{ questions: Question[] } | Question[]>(`/communities/${slug}/questions`);
        const list = Array.isArray(data) ? data : data.questions ?? [];
        return list;
      } catch {
        return [];
      }
    },
    enabled: !!community,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["community-members", slug],
    queryFn: async () => {
      try {
        const data = await apiGet<User[]>(`/communities/${slug}/members`);
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: !!community,
  });

  const joinMutation = useMutation({
    mutationFn: () => apiPost(`/communities/${slug}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
      toast.success("Joined community!");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (isLoading) {
    return <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING…</div>;
  }

  if (!community) {
    return (
      <div className="editorial-card p-10 text-center">
        <p className="font-serif text-2xl">Community not found</p>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/communities">Browse communities →</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommunityHeader
        community={community}
        onJoin={() => joinMutation.mutate()}
        isJoining={joinMutation.isPending}
      />

      <div className="flex flex-wrap gap-2">
        <span className="sticker sticker-yellow">QUESTIONS</span>
        <span className="sticker sticker-white">ABOUT</span>
        <span className="sticker sticker-white">MEMBERS</span>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[11px] tracking-[0.14em]">RECENT QUESTIONS</h2>
          <Button asChild variant="soft" size="sm">
            <Link href={`/ask?community=${slug}`}>Ask here →</Link>
          </Button>
        </div>
        {questions.length ? (
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
        ) : (
          <div className="editorial-card flex flex-col items-center p-10 text-center">
            <MessageSquare className="mb-3 h-8 w-8" />
            <p className="font-serif text-xl">No questions yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Be the first to ask in this community.</p>
            <Button asChild variant="secondary" className="mt-4">
              <Link href={`/ask?community=${slug}`}>Ask a question →</Link>
            </Button>
          </div>
        )}
      </section>

      {members.length > 0 && (
        <section>
          <h2 className="font-mono text-[11px] tracking-[0.14em]">MEMBERS</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {members.slice(0, 6).map((m) => (
              <Link key={m._id} href={`/u/${m.username}`} className="editorial-card flex items-center gap-3 p-3 transition hover:-translate-y-0.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[#111] bg-white font-serif">
                  {getInitials(m.name)}
                </div>
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="font-mono text-[10px] tracking-wider text-muted-foreground">@{m.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
