"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      try {
        return await apiGet<User>(`/users/${username}`);
      } catch {
        return null;
      }
    },
  });

  if (isLoading) {
    return <div className="editorial-card p-8 font-mono text-xs tracking-[0.14em]">LOADING PROFILE…</div>;
  }

  if (!user) {
    return (
      <div className="editorial-card p-10 text-center">
        <p className="font-serif text-2xl">Profile not found</p>
        <p className="mt-2 text-muted-foreground">This person may not exist yet.</p>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/people">Browse people →</Link>
        </Button>
      </div>
    );
  }

  const tags = user.experienceTags || user.skills || user.interests || [];
  const badges = user.badges || [];

  return (
    <div className="space-y-6">
      <div className="editorial-card overflow-hidden">
        <div className="border-b-[1.5px] border-[#111]/15 bg-[#111] px-5 py-8 text-[#F5F0E8] sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-[1.5px] border-[#F5F0E8]/30 bg-white/10 font-serif text-3xl">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-[#F5F0E8]/60">PROFILE</p>
                <h1 className="font-serif text-3xl text-[#F5F0E8] sm:text-4xl">{user.name}</h1>
                <p className="font-mono text-xs tracking-wider text-[#F5F0E8]/65">@{user.username}</p>
                {(user.headline || user.profession) && (
                  <p className="mt-2 text-sm text-[#F5F0E8]/80">{user.headline || user.profession}</p>
                )}
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href={`/ask?to=${user.username}`}>Ask {user.name.split(" ")[0]} →</Link>
            </Button>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {user.bio && <p className="max-w-2xl text-muted-foreground">{user.bio}</p>}
          {user.location && (
            <p className="mt-2 font-mono text-[10px] tracking-wider text-muted-foreground">
              {user.location.toUpperCase()}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {user.identityVerified && (
              <span className="sticker sticker-blue">IDENTITY VERIFIED</span>
            )}
            {user.verifiedExperience && (
              <span className="sticker sticker-mint">EXPERIENCE VERIFIED</span>
            )}
            {user.communityTrusted && (
              <span className="sticker sticker-yellow">COMMUNITY TRUSTED</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "PEOPLE HELPED", value: user.peopleHelped ?? 0 },
          { label: "QUESTIONS ANSWERED", value: user.questionsAnswered ?? 0 },
          { label: "COMMUNITY RATING", value: user.communityRating ? `${user.communityRating}/5` : "—" },
          { label: "TOPICS", value: user.topicsCount ?? tags.length },
        ].map((stat) => (
          <div key={stat.label} className="editorial-card p-4 text-center">
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {tags.length > 0 && (
        <section>
          <h2 className="font-mono text-[11px] tracking-[0.14em]">EXPERIENCE</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="sticker sticker-white">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {badges.length > 0 && (
        <section>
          <h2 className="font-mono text-[11px] tracking-[0.14em]">BADGES</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="sticker sticker-yellow">
                {badge}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="editorial-card p-6 text-center">
        <p className="font-serif text-xl">Reputation built on helping, not followers.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask {user.name.split(" ")[0]} about their experience — they&apos;ve helped{" "}
          {user.peopleHelped ?? 0} people so far.
        </p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href={`/ask?to=${user.username}`}>Start a question →</Link>
        </Button>
      </section>
    </div>
  );
}
