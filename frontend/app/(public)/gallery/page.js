import { ContactBand } from "@/components/features/home/ContactBand";
import { GalleryGrid } from "@/components/features/gallery/GalleryGrid";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { GALLERY_ALBUMS, GALLERY_PHOTOS } from "@/lib/gallery-content";

export const metadata = {
  title: "Gallery",
  description:
    "Inside Jayma Motors: our 60,000 sq ft workshop in Vatara, Dhaka — technicians at work, paint booth, oil service and wash bay.",
  alternates: { canonical: "/gallery" },
};

/** Gallery (Step 5 §6.5). Photos from lib/gallery-content until the gallery API lands. */
export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={
          <>
            Inside <span className="text-brand-500">Jayma Motors</span>
          </>
        }
        intro="A look around our workshop — the team, the tools and the care that goes into every car."
        crumbs={[{ label: "Gallery" }]}
      />
      <section aria-label="Photos">
        <Container className="pb-10 2xl:pb-15">
          <GalleryGrid albums={GALLERY_ALBUMS} photos={GALLERY_PHOTOS} />
        </Container>
      </section>
      <ContactBand />
    </>
  );
}
