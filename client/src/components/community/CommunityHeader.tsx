"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Community } from "@/types";

interface CommunityHeaderProps {
  community: Community;
  onJoin?: () => void;
  isJoining?: boolean;
}

export function CommunityHeader({ community, onJoin, isJoining }: CommunityHeaderProps) {
  const members = community.memberCount ?? (community as { membersCount?: number }).membersCount ?? 0;
  const isMember = (community as { isMember?: boolean }).isMember;

  return (
    <div className="editorial-card overflow-hidden">
      <div className="border-b-[1.5px] border-[#111]/15 bg-[#111] px-5 py-8 text-[#F5F0E8] sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-[1.5px] border-[#F5F0E8]/30 bg-white/10 font-serif text-2xl">
              {community.logo || (community as { avatar?: string }).avatar ? (
                <img
                  src={community.logo || (community as { avatar?: string }).avatar}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                getInitials(community.name)
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-[#F5F0E8]/60">COMMUNITY</p>
              <h1 className="font-serif text-3xl text-[#F5F0E8] sm:text-4xl">{community.name}</h1>
              <p className="font-mono text-xs tracking-wider text-[#F5F0E8]/65">/{community.slug}</p>
            </div>
          </div>
          <Button
            onClick={onJoin}
            disabled={isJoining}
            variant={isMember ? "outline" : "secondary"}
            className={isMember ? "border-[#F5F0E8]/40 text-[#F5F0E8] hover:bg-white/10" : ""}
          >
            {isMember ? "JOINED" : "JOIN →"}
          </Button>
        </div>
      </div>
      <div className="p-5 sm:p-8">
        {community.description && (
          <p className="max-w-2xl text-muted-foreground">{community.description}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="sticker sticker-yellow">
            <Users className="mr-1 inline h-3 w-3" />
            {formatNumber(members)} MEMBERS
          </span>
          {community.tags?.map((tag, i) => (
            <span
              key={tag}
              className={cn(
                "sticker",
                i % 2 === 0 ? "sticker-white" : "sticker-mint"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
