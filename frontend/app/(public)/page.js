import { AppointmentSection } from "@/components/features/home/AppointmentSection";
import { BeforeAfterSection } from "@/components/features/home/BeforeAfterSection";
import { BrandsMarquee } from "@/components/features/home/BrandsMarquee";
import { ContactBand } from "@/components/features/home/ContactBand";
import { FaqSection } from "@/components/features/home/FaqSection";
import { ReviewsSection } from "@/components/features/home/ReviewsSection";
import { ScrollBuiltHero } from "@/components/features/home/ScrollBuiltHero";
import { ServicesSection } from "@/components/features/home/ServicesSection";
import { ShellHelixSection } from "@/components/features/home/ShellHelixSection";
import { StatsBand } from "@/components/features/home/StatsBand";
import { VideoShowcaseSection } from "@/components/features/home/VideoShowcaseSection";
import { WhyChooseSection } from "@/components/features/home/WhyChooseSection";
import { getServices, getSite } from "@/lib/api/content";

/*
 * Home page (Step 5 §6.1), built a few sections at a time.
 * Done: hero, appointment form, numbers band, services, why choose, workshop
 * video, before & after, Shell Helix, reviews, brands strip, FAQ, contact band.
 * Next sections follow the owner's go-ahead.
 * TrustStrip is kept in components/features/home but hidden for now (owner's call).
 * HowItWorksSection removed from home (owner, 2026-11-11); still used on /services.
 */
export default async function HomePage() {
  const [services, site] = await Promise.all([getServices(), getSite()]);
  // Only what the browser components need (keeps the page payload small).
  const cards = services.map(({ slug, name, icon, text, duration, photo }) => ({
    slug,
    name,
    icon,
    text,
    duration,
    photo,
  }));
  const bookable = services.filter((service) => service.isBookable).map(({ slug, name }) => ({ slug, name }));

  return (
    <>
      <ScrollBuiltHero />
      <AppointmentSection services={bookable} phone={site.phone} />
      <StatsBand />
      <ServicesSection services={cards} />
      <WhyChooseSection />
      <VideoShowcaseSection />
      <BeforeAfterSection />
      <ShellHelixSection />
      <ReviewsSection />
      <BrandsMarquee />
      <FaqSection />
      <ContactBand />
    </>
  );
}
