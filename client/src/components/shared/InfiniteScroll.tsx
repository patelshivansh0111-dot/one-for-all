"use client";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function InfiniteScroll({ hasMore, isLoading, onLoadMore }: InfiniteScrollProps) {
  const { ref } = useInfiniteScroll({ hasMore, isLoading, onLoadMore });

  if (!hasMore) return null;

  return (
    <div ref={ref} className="flex justify-center py-8">
      {isLoading && (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      )}
    </div>
  );
}
