"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { formatNumber, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Community } from "@/types";

const TAG_COLORS = [
  "sticker-yellow",
  "sticker-blue",
  "sticker-mint",
  "sticker-pink",
];

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  const members = community.memberCount ?? (community as { membersCount?: number }).membersCount ?? 0;

  return (
    <Link href={`/communities/${community.slug}`} className="block">
      <article className="editorial-card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111]">
        <div className="border-b-[1.5px] border-[#111]/15 bg-[#111] px-5 py-4 text-[#F5F0E8]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-[#F5F0E8]/30 bg-white/10 font-serif text-lg">
              {community.logo ? (
                <img src={community.logo} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(community.name)
              )}
            </div>
            <div>
              <h3 className="font-serif text-xl">{community.name}</h3>
              <p className="font-mono text-[10px] tracking-wider text-[#F5F0E8]/65">/{community.slug}</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {community.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{community.description}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="sticker sticker-white">
              <Users className="mr-1 inline h-3 w-3" />
              {formatNumber(members)} MEMBERS
            </span>
            {community.tags?.slice(0, 2).map((tag, i) => (
              <span key={tag} className={cn("sticker", TAG_COLORS[i % TAG_COLORS.length])}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
