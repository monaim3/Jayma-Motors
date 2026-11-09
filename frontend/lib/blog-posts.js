/**
 * Blog (Step 5 §6.7): car-care awareness articles for Dhaka drivers. DRAFT
 * text written from general workshop practice — owner/technicians to review
 * before launch. Moves to the posts API (admin-editable, milestone F8/B8).
 *
 * body blocks: { type: "h2" | "p" | "ul" | "ol" | "tip" | "warn", text | items }
 * Photos: our own workshop stills (portrait 1080×1920, public/images/gallery).
 */
export const BLOG_CATEGORIES = [
  { slug: "seasonal", label: "Seasonal care" },
  { slug: "maintenance", label: "Maintenance" },
  { slug: "safety", label: "Safety" },
  { slug: "diagnostics", label: "Diagnostics" },
  { slug: "bodywork", label: "Paint & body" },
];

export const BLOG_POSTS = [
  {
    slug: "driving-through-waterlogged-roads",
    title: "Waterlogged roads: how to protect your car this monsoon",
    excerpt:
      "A few minutes of rain can turn Dhaka's roads into rivers. Here's when to drive through, when to turn back — and the one mistake that can destroy an engine.",
    category: "seasonal",
    date: "2026-11-02",
    readMins: 6,
    image: { src: "/images/gallery/g9.webp", alt: "Car being pressure-washed in the Jayma Motors wash bay" },
    service: "routine-maintenance",
    takeaways: [
      "If the water is above the middle of your wheels, don't drive through it.",
      "Go slow and steady in first gear — never stop or change gear in the water.",
      "If the engine stalls in water, do not restart it.",
    ],
    body: [
      {
        type: "p",
        text: "Every monsoon, workshops across Dhaka see the same story: a car that drove through a flooded street, stalled, and was started again. What could have been a simple drying-out becomes a bent engine and a bill in the lakhs. Most of this damage is avoidable.",
      },
      { type: "h2", text: "Before the rains: get the car ready" },
      {
        type: "ul",
        items: [
          "Wiper blades — replace them if they smear or squeak.",
          "Tyres — worn tread can't push water away, so the car can skid (aquaplane).",
          "Lights and indicators — you need to see, and be seen, in heavy rain.",
          "Door seals and drain holes — blocked drains let water collect inside doors and the floor.",
        ],
      },
      { type: "h2", text: "Should you drive through?" },
      {
        type: "p",
        text: "Your engine breathes through an air intake that usually sits low at the front. If water gets sucked in, it can't be compressed like air — the engine can lock up and bend internal parts (called hydrolock). As a simple rule: if the water is higher than the middle of your wheels, or you can't see the road surface, find another way or wait.",
      },
      {
        type: "warn",
        text: "Watch other vehicles: a bus or truck passing the other way pushes a wave that can be much higher than the water itself.",
      },
      { type: "h2", text: "If you must cross" },
      {
        type: "ol",
        items: [
          "Wait for vehicles ahead to cross, so you don't meet a wave.",
          "Use first gear (or L in an automatic) and keep the engine speed a little raised.",
          "Drive slowly and steadily — a small bow wave in front of the car is fine, a big splash is not.",
          "Don't stop, and don't change gear, until you're out.",
        ],
      },
      { type: "h2", text: "If the engine stalls in water" },
      {
        type: "p",
        text: "Do not try to restart it. Switch everything off, put the car in neutral and push it to higher ground, then call a mechanic. A stalled engine that is restarted with water inside is the most expensive mistake in monsoon driving.",
      },
      { type: "h2", text: "After driving through water" },
      {
        type: "ul",
        items: [
          "Test your brakes gently at low speed — press lightly a few times to dry them.",
          "Check the floor and boot for water; wet carpets cause smells, mould and rust.",
          "Check the engine oil: if it looks milky or creamy, water has got in — don't drive, get it checked.",
          "Get an underbody wash to remove mud and dirty water from brakes and suspension.",
        ],
      },
      {
        type: "tip",
        text: "Stuck or stalled? Call our hotline — we'll tell you what to do before you turn the key again.",
      },
    ],
  },
  {
    slug: "engine-oil-change-dhaka-traffic",
    title: "How often should you change engine oil in Dhaka traffic?",
    excerpt:
      "Stop-and-go traffic is harder on oil than a highway trip. Learn the signs your oil is tired, how to check it in two minutes, and how to avoid fake oil.",
    category: "maintenance",
    date: "2026-10-24",
    readMins: 5,
    image: { src: "/images/gallery/g45.webp", alt: "Genuine Shell Helix oil being poured into an engine" },
    service: "routine-maintenance",
    takeaways: [
      "Dhaka traffic counts as 'severe' driving — change oil sooner than the normal schedule.",
      "Check the dipstick once a month; it takes two minutes.",
      "Buy sealed, genuine oil — fake oil is common and can damage the engine.",
    ],
    body: [
      {
        type: "p",
        text: "Engine oil keeps hundreds of moving metal parts from grinding against each other, and carries heat away. Over time it breaks down and fills with dirt, and it stops doing that job well.",
      },
      { type: "h2", text: "Why city driving wears oil faster" },
      {
        type: "p",
        text: "Most car manuals have two service schedules: normal and 'severe'. Long idling in traffic jams, short trips, heat and dust are all on the severe list — which describes most driving in Dhaka. In these conditions, oil should be changed sooner than the normal interval in your manual.",
      },
      {
        type: "p",
        text: "The right interval depends on your car, its age and the oil type (mineral, semi-synthetic or fully synthetic). Check your manual's severe schedule, or ask us for the right interval for your car.",
      },
      { type: "h2", text: "Signs your oil needs changing" },
      {
        type: "ul",
        items: [
          "The oil on the dipstick is black and gritty instead of amber.",
          "The level is below the minimum mark.",
          "The engine sounds louder or ticks more than usual.",
          "A burning oil smell, or blue smoke from the exhaust.",
          "The oil pressure warning light comes on — stop safely and switch off the engine.",
        ],
      },
      { type: "h2", text: "How to check your oil in two minutes" },
      {
        type: "ol",
        items: [
          "Park on level ground and switch off the engine. Wait a few minutes.",
          "Pull out the dipstick, wipe it clean, push it fully back in.",
          "Pull it out again: the oil should be between the two marks.",
          "Look at the colour: amber is good, very dark or milky needs attention.",
        ],
      },
      { type: "h2", text: "Fake oil: a real problem" },
      {
        type: "p",
        text: "Refilled or counterfeit oil sold in look-alike bottles is a known problem. It may not protect the engine at all. Buy from authorized sellers, check the seal is unbroken, and always change the oil filter at the same time.",
      },
      {
        type: "tip",
        text: "Jayma Motors is an authorized Shell Helix dealer — we use only genuine, sealed oil.",
      },
    ],
  },
  {
    slug: "brake-warning-signs",
    title: "7 warning signs your brakes need attention",
    excerpt:
      "Squeals, grinding, a soft pedal or a car that pulls to one side — your brakes usually warn you long before they fail. Here's what each sign means.",
    category: "safety",
    date: "2026-10-15",
    readMins: 5,
    image: { src: "/images/gallery/g69.webp", alt: "Car raised on a lift for underbody and brake inspection" },
    service: "engine-brake-servicing",
    takeaways: [
      "Grinding metal means the pads are worn through — stop driving and get it checked.",
      "A soft or sinking pedal is serious: it can mean a fluid leak or air in the system.",
      "Brake fluid absorbs moisture — most makers recommend changing it about every two years.",
    ],
    body: [
      {
        type: "p",
        text: "Brakes are the most important safety system on your car, and in Dhaka's stop-and-go traffic they work hard every day. The good news: they almost always give warning signs before something fails.",
      },
      { type: "h2", text: "The 7 signs" },
      {
        type: "ol",
        items: [
          "Squealing when you brake — many pads have a small metal tab that squeals when they're worn thin.",
          "Grinding or scraping — the pad material is gone and metal is rubbing on metal. Stop driving.",
          "Vibration or pulsing in the pedal or steering — often uneven or worn brake discs.",
          "The car pulls to one side when braking — a sticking calliper or uneven wear.",
          "A soft, spongy or sinking pedal — air in the lines or a fluid leak.",
          "The brake warning light is on — low fluid or a system fault.",
          "It takes longer to stop than it used to.",
        ],
      },
      {
        type: "warn",
        text: "If the pedal goes down to the floor, or you hear grinding, don't keep driving 'until the weekend'. Call for help.",
      },
      { type: "h2", text: "Don't forget the brake fluid" },
      {
        type: "p",
        text: "Brake fluid slowly absorbs moisture from the air. Wet fluid boils more easily when brakes get hot, which can make the pedal go soft just when you need it. Most manufacturers recommend changing it about every two years — check your manual.",
      },
      { type: "h2", text: "How often to get brakes checked" },
      {
        type: "p",
        text: "Have the pads, discs and fluid looked at during every regular service, and any time you notice one of the signs above. A check is quick, and catching worn pads early saves the discs — which cost much more to replace.",
      },
      {
        type: "tip",
        text: "Ask to see your old parts — we're happy to show you why something needs replacing.",
      },
    ],
  },
  {
    slug: "check-engine-light-meaning",
    title: "Check engine light on? Don't panic — but don't ignore it",
    excerpt:
      "That small orange engine symbol can mean anything from a loose fuel cap to a serious misfire. Here's what solid and flashing lights mean, and what to do next.",
    category: "diagnostics",
    date: "2026-10-06",
    readMins: 5,
    image: { src: "/images/gallery/g15.webp", alt: "Technicians checking a car at Jayma Motors" },
    service: "computerized-diagnosis",
    takeaways: [
      "Solid light: get it checked soon. Flashing light: slow down and get it checked now.",
      "Check the fuel cap first — a loose cap is a common cause.",
      "Clearing the code without fixing the cause doesn't solve anything.",
    ],
    body: [
      {
        type: "p",
        text: "Modern cars watch their own engines through dozens of sensors. When something reads outside its normal range, the computer stores a fault code and turns on the check engine light. The light tells you something is wrong — the code tells a technician what.",
      },
      { type: "h2", text: "Solid or flashing?" },
      {
        type: "ul",
        items: [
          "Solid light: a fault has been found, but it's usually not an emergency. Book a check soon.",
          "Flashing light: often a serious misfire. Unburnt fuel can overheat and damage the catalytic converter. Reduce speed, avoid hard acceleration and get it checked as soon as possible.",
        ],
      },
      { type: "h2", text: "Common causes" },
      {
        type: "ul",
        items: [
          "A loose or damaged fuel cap.",
          "A worn oxygen (O2) sensor.",
          "Old spark plugs or a failing ignition coil.",
          "A dirty or faulty airflow (MAF) sensor.",
          "Vacuum leaks or a sticking EGR valve.",
          "On CNG-converted cars, fuel-mixture codes are common — the system needs proper tuning.",
        ],
      },
      { type: "h2", text: "What you can do" },
      {
        type: "ol",
        items: [
          "Check that the fuel cap is tight — it may take a few drives for the light to go off.",
          "Notice any symptoms: shaking, loss of power, rough idle, a smell, higher fuel use.",
          "Get the code read with a scan tool, then fix the cause.",
        ],
      },
      {
        type: "warn",
        text: "Some shops simply clear the code so the light goes off. If the cause isn't fixed, it comes back — and the problem can get worse in the meantime.",
      },
      {
        type: "tip",
        text: "Our computerized diagnosis reads the codes and live sensor data, and we explain the result before any work starts.",
      },
    ],
  },
  {
    slug: "car-battery-heat-bangladesh",
    title: "Why car batteries die faster in Bangladesh's heat",
    excerpt:
      "Heat, not cold, is a battery's biggest enemy. Learn the early signs of a weak battery and simple habits that help it last longer.",
    category: "maintenance",
    date: "2026-09-27",
    readMins: 4,
    image: { src: "/images/gallery/g60.webp", alt: "Technician checking the engine bay during a service" },
    service: "battery-replacement",
    takeaways: [
      "Heat speeds up the chemical wear inside a battery.",
      "Slow starting and dim lights are early warnings — test it before it leaves you stranded.",
      "Clean, tight terminals and regular longer drives help a battery last.",
    ],
    body: [
      {
        type: "p",
        text: "Many people think cold weather kills batteries. In fact, heat does more long-term damage: it speeds up the chemical reactions and water loss inside the battery. Under a hot bonnet in a Dhaka summer, batteries often wear out sooner than their rated life.",
      },
      { type: "h2", text: "Early signs of a weak battery" },
      {
        type: "ul",
        items: [
          "The engine turns over slowly when starting, especially in the morning.",
          "Headlights or dashboard lights look dim at idle.",
          "A clicking sound when you turn the key.",
          "The battery warning light comes on while driving.",
          "White or green powder (corrosion) on the terminals.",
          "A swollen or bulging battery case — replace it right away.",
        ],
      },
      { type: "h2", text: "Habits that help your battery last" },
      {
        type: "ul",
        items: [
          "Park in the shade when you can.",
          "Keep the terminals clean and tight.",
          "Avoid only short trips — a longer drive each week lets the battery fully charge.",
          "Don't leave lights, music or chargers running with the engine off.",
          "Get the battery tested at every service, and before long trips.",
        ],
      },
      {
        type: "warn",
        text: "When jump-starting, connect the cables in the right order and keep sparks away from the battery. If you're unsure, call for help.",
      },
      {
        type: "tip",
        text: "We test your battery and charging system in minutes, and replace it on the spot if needed.",
      },
    ],
  },
  {
    slug: "car-ac-not-cooling",
    title: "Car AC not cooling? 6 common causes",
    excerpt:
      "Warm air on a 35° day is miserable. Most AC problems come from a few common causes — and some simple habits keep it cold for longer.",
    category: "seasonal",
    date: "2026-09-18",
    readMins: 4,
    image: { src: "/images/gallery/g51.webp", alt: "Jayma Motors team working under the bonnet" },
    service: "diagnosis-repair",
    takeaways: [
      "Low refrigerant almost always means a leak — refilling without fixing it is temporary.",
      "A dirty cabin filter and a dusty condenser are common, cheap fixes.",
      "Get the AC checked before summer, not in the middle of it.",
    ],
    body: [
      {
        type: "p",
        text: "In Bangladesh, the AC isn't a luxury — it's how you survive traffic in April. When it starts blowing warm, the cause is usually one of a handful of things.",
      },
      { type: "h2", text: "The 6 common causes" },
      {
        type: "ol",
        items: [
          "Low refrigerant — the AC is a sealed system, so low gas means a leak somewhere.",
          "A clogged cabin air filter — weak airflow from the vents.",
          "A dusty or blocked condenser at the front of the car — it can't release heat.",
          "A weak radiator or condenser fan — cooling gets worse in traffic.",
          "A failing compressor or compressor clutch.",
          "Electrical faults — fuses, relays, switches or sensors.",
        ],
      },
      { type: "h2", text: "Bad smell from the vents?" },
      {
        type: "p",
        text: "A musty smell usually means mould on the evaporator, hidden behind the dashboard. It can be cleaned and disinfected — and a new cabin filter helps too.",
      },
      { type: "h2", text: "Keep it cold for longer" },
      {
        type: "ul",
        items: [
          "Run the AC for a few minutes every week, even in winter — it keeps seals from drying out.",
          "In a hot parked car, open the windows for a minute before using maximum AC.",
          "Replace the cabin filter as recommended — more often in dusty Dhaka.",
          "Rinse the condenser during washes to clear dust and insects.",
          "Book an AC check in February or March, before the heat arrives.",
        ],
      },
      {
        type: "tip",
        text: "Fix the cause, not just the gas: a leak repaired before recharging keeps the AC cold for longer.",
      },
    ],
  },
  {
    slug: "protect-car-paint-dust-sun",
    title: "Protect your car's paint from Dhaka's dust and sun",
    excerpt:
      "Dust scratches, sun fades and bird droppings etch. Simple washing and parking habits keep your paint looking new for years.",
    category: "bodywork",
    date: "2026-09-08",
    readMins: 4,
    image: { src: "/images/gallery/g75.webp", alt: "Paint preparation and finishing in the Jayma Motors paint booth" },
    service: "body-painting-detailing",
    takeaways: [
      "Never wipe a dusty car with a dry cloth — rinse first.",
      "Remove bird droppings and tree sap quickly; they can mark paint within days.",
      "Wax or sealant every few months adds a protective layer.",
    ],
    body: [
      {
        type: "p",
        text: "Your car's paint has a thin clear coat on top that gives it shine and protection. Dhaka's dust, strong sun and air pollution slowly wear that layer away — but a few habits make a big difference.",
      },
      { type: "h2", text: "Dust: the hidden scratcher" },
      {
        type: "p",
        text: "Road dust is full of fine, sharp particles. Wiping a dusty car with a dry cloth drags them across the surface and leaves swirl marks — the fine circles you see in sunlight. Always rinse loose dirt off with water first.",
      },
      { type: "h2", text: "A paint-safe wash" },
      {
        type: "ol",
        items: [
          "Rinse the whole car from top to bottom.",
          "Use a car shampoo, not dishwashing liquid or detergent — they strip protection.",
          "Wash with a soft microfibre mitt, rinsing it often.",
          "Dry with a clean microfibre towel; don't let water dry in the sun.",
        ],
      },
      { type: "h2", text: "Sun and fading" },
      {
        type: "p",
        text: "UV light slowly oxidises paint, making it dull and chalky — red and dark colours show it most. Park in the shade or under a cover when you can, and add a coat of wax or sealant every few months as a protective layer.",
      },
      {
        type: "warn",
        text: "Bird droppings and tree sap are acidic. Left for days in the sun, they can etch into the clear coat. Clean them off gently with water as soon as you can.",
      },
      { type: "h2", text: "Fix small chips early" },
      {
        type: "p",
        text: "A small stone chip lets moisture reach the metal. Touching it up early stops rust before it spreads under the paint — a much bigger repair later.",
      },
      {
        type: "tip",
        text: "Our polishing and detailing removes swirl marks and restores shine — and our paint booth handles everything from chips to a full respray.",
      },
    ],
  },
];

/** Heading id for in-page links ("On this page"). */
export function headingId(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatPostDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
