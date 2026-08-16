"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { APP_NAME, APP_TAGLINE, API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function safeNext(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/home";
  return path;
}

function LoginForm() {
  const { login } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) router.replace(next);
  }, [isAuthenticated, router, next]);

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/">
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">{APP_NAME}</p>
          <p className="mt-2 font-serif text-3xl">{APP_TAGLINE}</p>
        </Link>
      </div>

      <div className="editorial-card p-8">
        <h1 className="font-serif text-3xl">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to ask, answer, and help others. If the API is offline, local demo mode is used
          automatically.
        </p>

        <form
          onSubmit={handleSubmit(async (data) => {
            const user = await login(data);
            if (user) router.replace(next);
          })}
          className="mt-6 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-[10px] tracking-wider">
              EMAIL
            </Label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-accent-pink">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-mono text-[10px] tracking-wider">
                PASSWORD
              </Label>
              <Link href="/forgot-password" className="font-mono text-[10px] tracking-wider underline">
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-accent-pink">{errors.password.message}</p>}
          </div>
          <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in →"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-[1.5px] border-[#111]/15" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#fffdf8] px-3 font-mono text-[10px] tracking-wider text-muted-foreground">
              OR
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <a href={`${API_URL}/auth/google`}>Continue with Google</a>
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={<div className="editorial-card p-8 font-mono text-xs">LOADING…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
