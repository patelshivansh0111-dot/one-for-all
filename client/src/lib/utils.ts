import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date): string {
  const then = new Date(date);
  if (Number.isNaN(then.getTime())) return "";

  const now = Date.now();
  const seconds = Math.floor((now - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  const y = then.getUTCFullYear();
  const m = String(then.getUTCMonth() + 1).padStart(2, "0");
  const d = String(then.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error && typeof error === "object") {
    const maybeAxios = error as {
      message?: string;
      code?: string;
      response?: { data?: { error?: string; message?: string } };
    };
    if (!maybeAxios.response && (maybeAxios.code === "ERR_NETWORK" || maybeAxios.message === "Network Error")) {
      return "Can't reach the API on localhost:5000. Start MongoDB and the server, or continue in demo mode.";
    }
    if (maybeAxios.response?.data?.error) return maybeAxios.response.data.error;
    if (maybeAxios.response?.data?.message) return maybeAxios.response.data.message;
  }
  if (error instanceof Error && error.message !== "Network Error") return error.message;
  return fallback;
}
