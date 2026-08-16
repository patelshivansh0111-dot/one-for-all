"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="editorial-card px-8 py-6 font-mono text-xs tracking-[0.16em]">LOADING…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          <ErrorBoundary>
            <div className="mx-auto max-w-6xl p-4 sm:p-6">{children}</div>
          </ErrorBoundary>
        </main>
      </div>
      <MobileBottomNav />
      <Link href="/ask" className="sr-only">
        Ask
      </Link>
    </div>
  );
}
