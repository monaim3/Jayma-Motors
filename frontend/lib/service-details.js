/**
 * Service detail pages (Step 5 §6.3). Long-form content per service slug in
 * HOME_SERVICES. Owner to confirm wording, times and inclusions before launch;
 * moves to the services API (admin-editable) in milestone F2/B2.
 * photo = our own workshop stills (portrait 1080×1920, public/images/gallery).
 */
export const SERVICE_DETAILS = {
  "engine-brake-servicing": {
    photo: { src: "/images/services/real/engine-brake-servicing.webp", alt: "Two technicians removing the engine cover on a BMW" },
    headline: "Engine & brakes, serviced the right way",
    intro:
      "A healthy engine and sharp brakes keep you safe in Dhaka traffic. We tune the engine, change oils and filters, and inspect every part of the braking system — then show you what we found.",
    duration: "3–5 hours",
    included: [
      "Engine oil and filter change with Shell Helix",
      "Spark plugs, air filter and fuel system check",
      "Brake pads and discs measured, cleaned or replaced",
      "Brake fluid test and top-up or flush",
      "Belts, hoses and coolant inspected",
      "Test drive and report before handover",
    ],
    signs: [
      "Squealing or grinding when braking",
      "Brake pedal feels soft or sinks",
      "Engine shakes at idle or lacks power",
      "Higher fuel use than usual",
    ],
    faqs: [
      {
        q: "How often should brakes be checked?",
        a: "Every service, or every 10,000 km. In Dhaka's stop-start traffic pads wear faster, so earlier checks are worth it.",
      },
      {
        q: "Do you replace parts without asking?",
        a: "Never. We show you the worn part and the price first, and only replace it after you approve.",
      },
    ],
  },
  "computerized-diagnosis": {
    photo: { src: "/images/services/real/computerized-diagnosis.webp", alt: "Technician running a computer diagnosis on the scan-tool station" },
    headline: "Find the real fault — not a guess",
    intro:
      "Modern cars talk through their computers. We plug in professional scan tools, read fault codes and live sensor data, and pinpoint the cause before a single part is changed.",
    duration: "30–60 minutes",
    included: [
      "Full OBD scan of engine, gearbox, ABS and airbag systems",
      "Live data check of sensors while the engine runs",
      "Fault codes explained in plain language",
      "Warning lights cleared after the repair",
      "Written quote for any repair needed",
    ],
    signs: [
      "Check-engine or any warning light is on",
      "Car goes into limp mode or loses power",
      "Rough idle, stalling or hard starting",
      "Gear changes feel harsh or delayed",
    ],
    faqs: [
      {
        q: "Can you scan my brand?",
        a: "Yes — our tools cover Japanese, Korean and European cars, including hybrids.",
      },
      {
        q: "Will the warning light just come back?",
        a: "Not if the cause is fixed. We find the root fault first, so the light stays off.",
      },
    ],
  },
  "diagnosis-repair": {
    photo: { src: "/images/services/real/diagnosis-repair.webp", alt: "Technician repairing a fault in the engine bay" },
    headline: "Mechanical & electrical repairs for every brand",
    intro:
      "From suspension knocks to wiring faults and AC problems, our technicians diagnose carefully and repair with genuine or quality parts — explaining the job and the price first.",
    duration: "Same day to 2 days",
    included: [
      "Suspension, steering and bush repairs",
      "Electrical and wiring fault finding",
      "Starter, alternator and charging system repair",
      "AC check and gas refill",
      "Cooling system and radiator repair",
      "Japanese reconditioned parts on request",
    ],
    signs: [
      "Knocking over bumps or loose steering",
      "Lights, windows or locks not working",
      "AC blowing warm air",
      "Engine overheating",
    ],
    faqs: [
      {
        q: "Do you use genuine parts?",
        a: "Yes, genuine or trusted quality parts. If you prefer reconditioned parts to save cost, we'll tell you the options.",
      },
      {
        q: "How long will my repair take?",
        a: "Most repairs are done the same day. If parts need ordering, we tell you the time with the quote.",
      },
    ],
  },
  denting: {
    photo: { src: "/images/services/real/denting.webp", alt: "Technician repairing a bumper in our body shop" },
    headline: "Dents and accident damage, gone",
    intro:
      "Whether it's a parking scrape or accident damage, our denting team pulls, straightens and reshapes panels so your car's lines look factory-fresh again.",
    duration: "1–4 days",
    included: [
      "Damage assessment and clear quote",
      "Panel pulling, straightening and reshaping",
      "Bumper and plastic repair",
      "Panel replacement when repair isn't possible",
      "Primer, paint match and finish",
      "Insurance claim photos on request",
    ],
    signs: [
      "Dents, creases or scrapes on panels",
      "Gaps between panels after a knock",
      "Cracked or loose bumper",
    ],
    faqs: [
      {
        q: "Will the repaired area match the rest of the car?",
        a: "Yes. We colour-match the paint to your car so the repair blends in.",
      },
      {
        q: "Can you help with an insurance claim?",
        a: "We can provide photos and an itemised estimate for your insurer.",
      },
    ],
  },
  "body-painting-detailing": {
    photo: { src: "/images/services/real/body-painting-detailing.webp", alt: "Painter spraying a panel in our paint booth" },
    headline: "A deep, lasting showroom finish",
    intro:
      "From a single panel to a full respray, plus polishing and detailing — we prepare the surface properly and spray in a dust-controlled booth for a finish that lasts.",
    duration: "1 day (detailing) – 5 days (full paint)",
    included: [
      "Full body or panel painting with colour matching",
      "Paint booth spraying for a clean finish",
      "Machine polishing to remove swirls and dullness",
      "Wash, clay and decontamination",
      "Interior vacuum and wipe-down",
      "Wax or protective coating",
    ],
    signs: [
      "Faded, dull or peeling paint",
      "Swirl marks and fine scratches",
      "Stains or tar on the body",
    ],
    faqs: [
      {
        q: "How long does a full respray take?",
        a: "Usually 4–5 days, including preparation, painting, drying and polishing.",
      },
      {
        q: "Is polishing safe for my paint?",
        a: "Yes. We use the right pads and compounds for your paint, removing only what's needed.",
      },
    ],
  },
  "wheel-alignment": {
    photo: { src: "/images/services/real/wheel-alignment.webp", alt: "Alignment clamp fitted to a wheel on our Launch alignment lift" },
    headline: "Drive straight, wear tyres evenly",
    intro:
      "Potholes and speed breakers knock wheels out of line. Our computerised alignment and balancing bring them back to the manufacturer's settings for safer handling and longer tyre life.",
    duration: "45–90 minutes",
    included: [
      "Computerised four-wheel alignment",
      "Wheel balancing for all four wheels",
      "Tyre pressure and tread check",
      "Steering and suspension inspection",
      "Before-and-after alignment report",
    ],
    signs: [
      "Car pulls to one side",
      "Steering wheel is off-centre",
      "Vibration at speed",
      "Tyres wearing on one edge",
    ],
    faqs: [
      {
        q: "How often should I get an alignment?",
        a: "Every 10,000 km, after new tyres, or after a hard hit on a pothole.",
      },
      {
        q: "What's the difference between alignment and balancing?",
        a: "Alignment sets the wheel angles so the car drives straight; balancing removes vibration by evening out the weight of each wheel.",
      },
    ],
  },
  "routine-maintenance": {
    photo: { src: "/images/services/real/routine-maintenance.webp", alt: "Technician filling fresh engine oil during a service" },
    headline: "Regular care that prevents big bills",
    intro:
      "Scheduled servicing keeps small problems small. We follow your car's service schedule with genuine Shell Helix oils, fresh filters and a thorough multi-point check.",
    duration: "2–3 hours",
    included: [
      "Engine oil change with genuine Shell Helix",
      "Oil, air and cabin filter replacement",
      "Fluid levels checked and topped up",
      "Battery, lights and wipers check",
      "Multi-point safety inspection",
      "Service record for your car",
    ],
    signs: [
      "Service due by date or kilometres",
      "Oil change light is on",
      "Engine sounds louder than usual",
    ],
    faqs: [
      {
        q: "How often should I change engine oil?",
        a: "Usually every 5,000–10,000 km depending on the oil grade and your car. We'll advise based on your model and driving.",
      },
      {
        q: "Which oil do you use?",
        a: "Genuine Shell Helix — we're an authorized dealer, so it's sealed and never diluted.",
      },
    ],
  },
  "battery-replacement": {
    photo: { src: "/images/services/real/battery-replacement.webp", alt: "Technician lifting a car battery out of the engine bay" },
    headline: "No more morning no-starts",
    intro:
      "We test your battery and charging system, and if it's time for a new one, fit the right battery for your car on the spot — then make sure the alternator is charging properly.",
    duration: "20–40 minutes",
    included: [
      "Battery health and voltage test",
      "Alternator and charging system check",
      "Correct battery fitted for your model",
      "Terminals cleaned and protected",
      "Old battery taken back",
    ],
    signs: [
      "Slow or clicking start",
      "Dim headlights or flickering dash",
      "Battery older than 2–3 years",
      "Battery warning light is on",
    ],
    faqs: [
      {
        q: "How long does a car battery last?",
        a: "Typically 2–3 years in Dhaka's heat. Short trips and long idle periods shorten it.",
      },
      {
        q: "Can you come to me if my car won't start?",
        a: "Call or WhatsApp us with your location — we'll help or arrange pick-up.",
      },
    ],
  },
};
