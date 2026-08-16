"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api, { apiGet, apiPost } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/utils";
import type { CreatePostData, PaginatedResponse, Post } from "@/types";

export function useFeed() {
  const queryClient = useQueryClient();

  const feedQuery = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const data = await apiGet<PaginatedResponse<Post>>("/posts/feed", {
          page: pageParam,
          limit: 10,
        });
        return data;
      } catch {
        return { items: [], total: 0, page: pageParam, limit: 10, hasMore: false };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

  const createPost = useMutation({
    mutationFn: (data: CreatePostData) => apiPost<Post>("/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post created!");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to create post")),
  });

  const likePost = useMutation({
    mutationFn: async (postId: string) => {
      await api.post(`/posts/${postId}/like`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to like post")),
  });

  const bookmarkPost = useMutation({
    mutationFn: async (postId: string) => {
      await api.post(`/posts/${postId}/bookmark`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Bookmark updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to bookmark")),
  });

  const posts = feedQuery.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    posts,
    feedQuery,
    createPost,
    likePost,
    bookmarkPost,
  };
}
