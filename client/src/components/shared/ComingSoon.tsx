import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({
  title,
  description = "Coming later — MVP focuses on asking & helping.",
}: ComingSoonProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">{APP_NAME}</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">{title}</h1>
      <p className="mt-4 text-muted-foreground">{description}</p>
      <div className="editorial-card mt-8 w-full p-6">
        <p className="font-serif text-xl">
          We&apos;re building the core experience first: ask questions, find people with real experience,
          and help others.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary">
            <Link href="/ask">Ask a question →</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/home">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
