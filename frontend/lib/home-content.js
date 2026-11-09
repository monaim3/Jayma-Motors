/**
 * Home page content (Step 5 §6.1). Services move to the Laravel API in
 * milestone B2/F2; until then this list (decision D6) feeds the home page.
 */

import { FEATURED_REVIEW, GOOGLE_REVIEWS } from "@/lib/reviews-content";

/**
 * Share of the hero's scroll used to build the car; the rest is the drive-off,
 * where the finished car drives out of the frame.
 */
export const HERO_BUILD_END = 0.72;

/** Scroll-built hero stages (Step 5 §6.1.1): each assembly step shows one service. */
export const HERO_STAGES = [
  {
    key: "diagnosis",
    title: "Computerized diagnosis",
    text: "Every car tells a story. We read it with modern scan tools before we touch a bolt.",
  },
  {
    key: "engine",
    title: "Engine & brake servicing",
    text: "Engines tuned, oils changed, brakes inspected and replaced by certified technicians.",
  },
  {
    key: "body",
    title: "Denting & body repair",
    text: "Dents and accident damage restored so panels line up like new.",
  },
  {
    key: "paint",
    title: "Painting & detailing",
    text: "Full body painting, polishing and detailing for a deep, lasting finish.",
  },
  {
    key: "wheels",
    title: "Wheel alignment & balancing",
    text: "Precise alignment and balancing for a straight, smooth and safe drive.",
  },
  {
    key: "ready",
    title: "Ready to drive",
    text: "Checked, cleaned and handed back — your car, cared for.",
  },
];

/** Booking form brands; mirrors the backend VehicleBrandSeeder until the brands API lands. */
export const VEHICLE_BRANDS = [
  "Toyota",
  "Honda",
  "Nissan",
  "Mitsubishi",
  "Mazda",
  "Suzuki",
  "Subaru",
  "Lexus",
  "Hyundai",
  "Kia",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Volkswagen",
  "Land Rover",
  "Ford",
  "Proton",
  "Tata",
  "MG",
  "Other",
];

/**
 * Numbers band. `placeholder: true` values are estimates to be confirmed by
 * the owner before launch (Step 10 checklist).
 */
export const HOME_STATS = [
  // Since 2008. Fixed number (reading the clock breaks static prerendering); bump yearly.
  { value: 18, suffix: "+", label: "Years in service" },
  { value: 10000, suffix: "+", label: "Cars serviced", placeholder: true },
  { value: 20, suffix: "+", label: "Car brands" },
  { value: 30, suffix: "+", label: "Expert technicians" },
];

/** "Why choose Jayma" points (owner to confirm wording before launch). */
export const WHY_POINTS = [
  {
    icon: "ScanLine",
    title: "Computerized diagnosis",
    text: "Modern scan tools find the real fault first — no guesswork, no wasted parts.",
  },
  {
    icon: "BadgeCheck",
    title: "Certified technicians",
    text: "Experienced mechanics trained on Japanese, Korean and European cars.",
  },
  {
    icon: "Droplets",
    title: "Genuine parts & Shell Helix",
    text: "Authorized Shell Helix dealer — sealed, genuine oils and quality parts.",
  },
  {
    icon: "ReceiptText",
    title: "Clear quote before work",
    text: "We explain the problem and the price, and start only after you approve.",
  },
];

/**
 * Workshop video section (web version of the owner's reel). `preview` is a
 * short silent loop of workshop action used as the moving background/card.
 * `aspect` (width / height) is the video file's real shape and sets the popup
 * player: 9 / 16 for this reel, 16 / 9 once the landscape video arrives.
 * `cardAspect` is the shape of the card on the page (16:9; a portrait clip
 * is centre-cropped to fill it).
 */
export const WORKSHOP_VIDEO = {
  src: "/videos/why-jayma.mp4",
  preview: "/videos/why-jayma-preview.mp4",
  poster: "/videos/why-jayma-poster.jpg",
  title: "Inside the Jayma Motors workshop",
  duration: "2:20",
  aspect: 9 / 16,
  cardAspect: 16 / 9,
};

/** "How it works": the customer's path from booking to pick-up. */
export const HOW_STEPS = [
  {
    icon: "CalendarCheck",
    title: "Book your slot",
    text: "Book online in a minute, or call or WhatsApp us — pick a day that suits you.",
  },
  {
    icon: "ScanLine",
    title: "Diagnosis & clear quote",
    text: "We check the car, explain what's wrong and give you the price before any work.",
  },
  {
    icon: "Wrench",
    title: "Expert repair",
    text: "Certified technicians fix it with genuine parts and Shell Helix oils.",
  },
  {
    icon: "KeyRound",
    title: "Drive away happy",
    text: "Final check, a clean car and your keys back — on time, as promised.",
  },
];

/** Home carousel: real Google reviews (lib/reviews-content), the longer English ones. */
export const HOME_REVIEWS = [
  FEATURED_REVIEW,
  ...["SAIMUM AREFEEN", "S. M. Shoaib", "Tanvir Shawkat", "Md Imranur Rahman", "Imroze Parvez"].map((name) =>
    GOOGLE_REVIEWS.find((review) => review.name === name),
  ),
];

/** Home FAQ (owner to confirm the answers before launch). Also output as FAQPage structured data. */
export const HOME_FAQS = [
  {
    q: "Which car brands do you service?",
    a: "All major makes — Japanese, Korean and European. Toyota, Honda, Nissan, Mitsubishi, Hyundai, Kia, BMW, Mercedes-Benz, Audi and many more.",
  },
  {
    q: "Do I need an appointment?",
    a: "Walk-ins are welcome, but booking ahead means your car gets a slot without waiting. Book online in a minute, or call or WhatsApp us.",
  },
  {
    q: "How long does a regular service take?",
    a: "A routine service or oil change usually takes a few hours, and most cars are ready the same day. Bigger repairs, denting or painting take longer — we tell you the time with the quote.",
  },
  {
    q: "Will I know the price before the work starts?",
    a: "Yes. We diagnose the car first, explain the problem and give you the price. Work starts only after you approve it.",
  },
  {
    q: "Do you use genuine parts and oil?",
    a: "Yes. We are an authorized Shell Helix dealer and use genuine, sealed oils and quality parts — never refilled or diluted.",
  },
  {
    q: "Do you offer pick-up and drop or emergency help?",
    a: "Yes — call or WhatsApp us with your location and the problem, and we will arrange pick-up and drop or help in an emergency.",
  },
];

/**
 * Opening hours — open every day, closing 9 PM (confirmed by the owner); the
 * 9 AM opening time is still a placeholder to confirm (Step 10 checklist).
 * Later read from the admin-edited site settings.
 */
export const OPENING_HOURS = [{ days: "Every day", time: "9:00 AM – 9:00 PM" }];

/** Shell Helix highlight: common grades kept in stock (owner to confirm). */
export const SHELL_GRADES = ["0W-20", "5W-30", "5W-40", "10W-40", "15W-40"];

export const TRUST_ITEMS = [
  { icon: "ShieldCheck", title: "Since 2008", text: "Trusted multi-brand workshop" },
  { icon: "Cpu", title: "Computerized diagnosis", text: "Accurate fault finding" },
  { icon: "Award", title: "Certified technicians", text: "Skilled, experienced team" },
  { icon: "Droplets", title: "Authorized Shell Helix dealer", text: "Genuine lubricants" },
];

/** Featured services on the home page (D6 list). */
export const HOME_SERVICES = [
  {
    slug: "engine-brake-servicing",
    icon: "Cog",
    name: "Engine & Brake Servicing",
    text: "Engine tune-ups, brake pads, discs and fluid — inspected and serviced properly.",
  },
  {
    slug: "computerized-diagnosis",
    icon: "Cpu",
    name: "Computerized Diagnosis",
    text: "Scan-tool diagnosis to find faults quickly and fix the real cause.",
  },
  {
    slug: "diagnosis-repair",
    icon: "Wrench",
    name: "Diagnosis & Repair",
    text: "Mechanical and electrical repairs for all major car brands.",
  },
  {
    slug: "denting",
    icon: "Hammer",
    name: "Denting & Body Repair",
    text: "Accident and dent repair that restores your car's original shape.",
  },
  {
    slug: "body-painting-detailing",
    icon: "PaintRoller",
    name: "Painting & Detailing",
    text: "Full body painting, polishing and detailing for a showroom finish.",
  },
  {
    slug: "wheel-alignment",
    icon: "CircleDot",
    name: "Wheel Alignment & Balancing",
    text: "Computer alignment and balancing for safer handling and even tyre wear.",
  },
  {
    slug: "routine-maintenance",
    icon: "ClipboardCheck",
    name: "Routine Maintenance",
    text: "Oil changes, filters and scheduled servicing by certified technicians.",
  },
  {
    slug: "battery-replacement",
    icon: "BatteryCharging",
    name: "Battery Replacement",
    text: "Battery testing and replacement for all makes, done on the spot.",
  },
];
