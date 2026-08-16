"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z.string().min(6, "At least 6 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

type Form = z.infer<typeof schema>;

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const { resetPassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <div className="editorial-card p-8 text-center">
        <h1 className="font-serif text-3xl">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">This reset link is missing a token.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/forgot-password">Request a new one</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="editorial-card p-8">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">{APP_NAME}</p>
      <h1 className="mt-3 font-serif text-4xl">Reset password</h1>
      <form
        onSubmit={handleSubmit(async (data) => {
          await resetPassword(token, data.password);
        })}
        className="mt-8 space-y-4"
      >
        <div>
          <Label className="font-mono text-[10px] tracking-[0.14em]">NEW PASSWORD</Label>
          <input
            {...register("password")}
            type="password"
            className="mt-2 w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none"
          />
          {errors.password && <p className="mt-1 text-xs text-accent-pink">{errors.password.message}</p>}
        </div>
        <div>
          <Label className="font-mono text-[10px] tracking-[0.14em]">CONFIRM</Label>
          <input
            {...register("confirm")}
            type="password"
            className="mt-2 w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none"
          />
          {errors.confirm && <p className="mt-1 text-xs text-accent-pink">{errors.confirm.message}</p>}
        </div>
        <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
          Update password →
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="editorial-card p-8 font-mono text-xs">LOADING…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
