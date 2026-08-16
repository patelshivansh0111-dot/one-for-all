import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { EditorialNav } from "@/components/landing/EditorialNav";
import { EditorialHero } from "@/components/landing/EditorialHero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { JustAskSection } from "@/components/landing/JustAskSection";
import { MatchingSection } from "@/components/landing/MatchingSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CommunitiesPreview } from "@/components/landing/CommunitiesPreview";
import { LandingCTA } from "@/components/landing/LandingCTA";

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <AnnouncementBar />
      <EditorialNav />
      <EditorialHero />
      <ProblemSection />
      <JustAskSection />
      <MatchingSection />
      <HowItWorksSection />
      <CommunitiesPreview />
      <LandingCTA />
    </main>
  );
}
