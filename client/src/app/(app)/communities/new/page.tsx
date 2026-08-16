"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  isPrivate: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function NewCommunityPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isPrivate: false },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiPost<{ slug: string }>("/communities", data),
    onSuccess: (data) => {
      toast.success("Community created!");
      router.push(`/communities/${data.slug}`);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">NEW COMMUNITY</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Create a space</h1>
        <p className="mt-2 text-muted-foreground">For people figuring out the same things together.</p>
      </header>

      <div className="editorial-card p-6 sm:p-8">
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-[10px] tracking-wider">
              NAME
            </Label>
            <input
              id="name"
              placeholder="First-Time Founders"
              className="w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-accent-pink">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug" className="font-mono text-[10px] tracking-wider">
              URL SLUG
            </Label>
            <input
              id="slug"
              placeholder="first-time-founders"
              className="w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none"
              {...register("slug")}
            />
            {errors.slug && <p className="text-xs text-accent-pink">{errors.slug.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="font-mono text-[10px] tracking-wider">
              DESCRIPTION
            </Label>
            <textarea
              id="description"
              placeholder="What's this community about?"
              rows={4}
              className="w-full resize-none rounded-2xl border-[1.5px] border-[#111] bg-[#F5F0E8] p-4 text-sm outline-none"
              {...register("description")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="private">Private community</Label>
            <Switch
              id="private"
              checked={watch("isPrivate")}
              onCheckedChange={(v) => setValue("isPrivate", v)}
            />
          </div>
          <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create community →"}
          </Button>
        </form>
      </div>
    </div>
  );
}
