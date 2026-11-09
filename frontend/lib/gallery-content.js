/**
 * Gallery (Step 5 §6.5). Stills from the owner's workshop video
 * (assets-src/video): sharpest frame at full 1080×1920, lightly enhanced
 * (g0 is the older 720×1280 still). Replaced by admin-managed albums
 * (gallery API, milestone F8/B8) once the backend is ready.
 */
export const GALLERY_ALBUMS = [
  { slug: "workshop", label: "Workshop" },
  { slug: "mechanical", label: "Mechanical" },
  { slug: "paint-body", label: "Paint & Body" },
  { slug: "wash-detailing", label: "Wash & Detailing" },
];

export const GALLERY_PHOTOS = [
  { src: "/images/gallery/g0.webp", album: "workshop", caption: "Our 60,000 sq ft workshop hall" },
  { src: "/images/gallery/g1.webp", album: "workshop", caption: "Jayma Motors, Vatara" },
  { src: "/images/gallery/g69.webp", album: "workshop", caption: "Car on the lift for underbody work" },
  { src: "/images/gallery/g63.webp", album: "workshop", caption: "Service bays at work" },
  { src: "/images/gallery/g15.webp", album: "mechanical", caption: "Technicians on an engine job" },
  { src: "/images/gallery/g18.webp", album: "mechanical", caption: "The right tools for every job" },
  { src: "/images/gallery/g24.webp", album: "mechanical", caption: "Welding and fabrication" },
  { src: "/images/gallery/g51.webp", album: "mechanical", caption: "Team work under the bonnet" },
  { src: "/images/gallery/g60.webp", album: "mechanical", caption: "Fluid top-up and engine check" },
  { src: "/images/gallery/g123.webp", album: "mechanical", caption: "Engine detail work" },
  { src: "/images/gallery/g45.webp", album: "mechanical", caption: "Genuine Shell Helix oil change" },
  { src: "/images/gallery/g66.webp", album: "mechanical", caption: "Oil service in progress" },
  { src: "/images/gallery/g73.webp", album: "paint-body", caption: "Spraying in the paint booth" },
  { src: "/images/gallery/g75.webp", album: "paint-body", caption: "Paint prep and finishing" },
  { src: "/images/gallery/g9.webp", album: "wash-detailing", caption: "Pressure wash bay" },
];
