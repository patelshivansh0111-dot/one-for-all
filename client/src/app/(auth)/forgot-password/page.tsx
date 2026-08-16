"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    await forgotPassword(data.email);
    setSent(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md editorial-card p-8">
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">{APP_NAME}</p>
        <h1 className="mt-3 font-serif text-4xl">Forgot password</h1>
        <p className="mt-2 text-sm text-muted-foreground">We&apos;ll email you a reset link.</p>

        {sent ? (
          <div className="mt-6 rounded-2xl border-[1.5px] border-[#111] bg-[#63D1B5]/30 p-4 text-sm text-[#111]">
            If that email exists, a reset link has been sent. Check your inbox (or the server console in
            development).
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <Label className="font-mono text-[10px] tracking-[0.14em]">EMAIL</Label>
              <input
                {...register("email")}
                type="email"
                className="mt-2 w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none"
              />
              {errors.email && <p className="mt-1 text-xs text-accent-pink">{errors.email.message}</p>}
            </div>
            <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
              Send reset link →
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="underline underline-offset-4">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
