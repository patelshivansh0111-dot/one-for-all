import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import "./globals.css";

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  openGraph: {
    title: APP_NAME,
    description: APP_TAGLINE,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F0E8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrument.variable} ${manrope.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster
                  position="top-center"
                  toastOptions={{
                    style: {
                      border: "1.5px solid #111",
                      background: "#FFFDF8",
                      color: "#111",
                      fontFamily: "var(--font-manrope)",
                    },
                  }}
                />
              </TooltipProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
