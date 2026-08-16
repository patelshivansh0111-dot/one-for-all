"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { APP_NAME, APP_TAGLINE, API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const registerSchema = z
  .object({
    displayName: z.string().min(2, "Name must be at least 2 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (isAuthenticated) router.replace("/home");
  }, [isAuthenticated, router]);

  const onSubmit = async (data: RegisterForm) => {
    await registerUser({
      displayName: data.displayName,
      username: data.username,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">{APP_NAME}</p>
            <p className="mt-2 font-serif text-3xl">{APP_TAGLINE}</p>
          </Link>
        </div>

        <div className="editorial-card p-8">
          <h1 className="font-serif text-3xl">Join the community</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask people who&apos;ve been there. Help others with what you know. If the API is offline,
            registration continues in local demo mode.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="font-mono text-[10px] tracking-wider">
                NAME
              </Label>
              <input
                id="displayName"
                placeholder="Your name"
                className="w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent-blue/30"
                {...register("displayName")}
              />
              {errors.displayName && <p className="text-xs text-accent-pink">{errors.displayName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="font-mono text-[10px] tracking-wider">
                USERNAME
              </Label>
              <input
                id="username"
                placeholder="yourname"
                className="w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent-blue/30"
                {...register("username")}
              />
              {errors.username && <p className="text-xs text-accent-pink">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-[10px] tracking-wider">
                EMAIL
              </Label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent-blue/30"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-accent-pink">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-[10px] tracking-wider">
                PASSWORD
              </Label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent-blue/30"
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-accent-pink">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-mono text-[10px] tracking-wider">
                CONFIRM PASSWORD
              </Label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-full border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent-blue/30"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-accent-pink">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account →"}
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
            Already have an account?{" "}
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
