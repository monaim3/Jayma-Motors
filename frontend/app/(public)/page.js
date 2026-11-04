import { AppointmentSection } from "@/components/features/home/AppointmentSection";
import { BrandsMarquee } from "@/components/features/home/BrandsMarquee";
import { HowItWorksSection } from "@/components/features/home/HowItWorksSection";
import { ReviewsSection } from "@/components/features/home/ReviewsSection";
import { ScrollBuiltHero } from "@/components/features/home/ScrollBuiltHero";
import { ServicesSection } from "@/components/features/home/ServicesSection";
import { ShellHelixSection } from "@/components/features/home/ShellHelixSection";
import { StatsBand } from "@/components/features/home/StatsBand";
import { VideoShowcaseSection } from "@/components/features/home/VideoShowcaseSection";
import { WhyChooseSection } from "@/components/features/home/WhyChooseSection";

/*
 * Home page (Step 5 §6.1), built a few sections at a time.
 * Done: hero, appointment form, numbers band, services, how it works,
 * why choose, workshop video, Shell Helix, reviews (sample data), brands strip.
 * Next sections follow the owner's go-ahead.
 * TrustStrip is kept in components/features/home but hidden for now (owner's call).
 */
export default function HomePage() {
  return (
    <>
      <ScrollBuiltHero />
      <AppointmentSection />
      <StatsBand />
      <ServicesSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <VideoShowcaseSection />
      <ShellHelixSection />
      <ReviewsSection />
      <BrandsMarquee />
    </>
  );
}
