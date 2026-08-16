"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    api
      .get(`/auth/verify-email/${token}`)
      .then(() => {
        setStatus("success");
        setMessage("Email verified. You're ready to ask and help.");
      })
      .catch(() => {
        setStatus("error");
        setMessage("This verification link is invalid or expired.");
      });
  }, [token]);

  return (
    <div className="editorial-card p-8 text-center">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">{APP_NAME}</p>
      <h1 className="mt-3 font-serif text-4xl">
        {status === "loading" ? "Verifying" : status === "success" ? "Verified" : "Couldn’t verify"}
      </h1>
      <p className="mt-3 text-muted-foreground">{message}</p>
      <Button asChild variant="secondary" className="mt-8">
        <Link href={status === "success" ? "/home" : "/login"}>
          {status === "success" ? "Continue →" : "Back to login"}
        </Link>
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="editorial-card p-8 font-mono text-xs">LOADING…</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </main>
  );
}
