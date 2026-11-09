/**
 * Reviews page (Step 5 §6.6). Real reviews from the Jayma Motors Google
 * Business listing, copied 2026-11-09 (English text verbatim; Badal Ahmed's
 * Bangla review has typing slips fixed; `year` approximated from Google's
 * "x years ago"). Only reviews with a comment, 4★–5★, about cars. Moves to the
 * reviews API (milestone F7/B7) once customers can post reviews on the site.
 */

/** Google listing totals on 2026-11-09 — update when the listing changes. */
export const GOOGLE_RATING = {
  average: 4.2,
  total: 101,
  breakdown: { 5: 62, 4: 15, 3: 10, 2: 6, 1: 8 },
  checked: "November 2026",
};

export const REVIEW_TOPICS = [
  { slug: "repair", label: "Service & repair" },
  { slug: "wash", label: "Car wash" },
  { slug: "team", label: "Friendly team" },
  { slug: "price", label: "Fair price" },
];

/** Latest detailed review, shown as the spotlight. */
export const FEATURED_REVIEW = {
  name: "Mahbub Amin",
  localGuide: true,
  rating: 5,
  year: "Nov 2026",
  text: "Very good car wash! Staff are friendly and they wash the car properly. I asked them not to use air blower inside because it spreads sand on the seats, and they listened. They used vacuum instead and put paper on the floor mats to keep it clean. Special thanks to Sohan. He asked me first before spraying water on the engine, because some cars are sensitive to water. I really liked that he cares about the car. Highly recommended, I will come again!",
};

export const GOOGLE_REVIEWS = [
  {
    name: "SAIMUM AREFEEN",
    localGuide: true,
    rating: 4,
    year: "2022",
    topics: ["wash", "team", "price"],
    text: "Good service, well behaved. Taking car care from them more than 3 years. Car washing is good with very cheaper price.",
  },
  {
    name: "S. M. Shoaib",
    localGuide: true,
    rating: 5,
    year: "2019",
    topics: ["team", "price"],
    text: "Best motor workshop in Bashundara area. Owner shahidul Bhai is very humble person. Their rate also very competitive. Me always went there..",
  },
  {
    name: "Tanvir Shawkat",
    localGuide: true,
    rating: 5,
    year: "2021",
    topics: ["repair"],
    text: "One stop solution for vehicles. Servicing, electric work, paint, wash and spare parts available.",
  },
  {
    name: "Md Imranur Rahman",
    localGuide: true,
    rating: 5,
    year: "2018",
    topics: ["wash", "price"],
    text: "So far the best place for car wash. Reasonable price and they wash with care.",
  },
  {
    name: "Badal Ahmed",
    rating: 5,
    year: "2018",
    topics: ["team"],
    textBn:
      "আমি জায়মা মটরস এর সর্বাঙ্গিন উন্নতি কামনা করি, তরুন উদ্যোক্তা জনাব শহিদুল ইসলাম ভাইর সাফল্য কামনা করি। আমি আমার সকল চালক বন্ধুদের কে অনুরোধ করব, জায়মা মটরস এ পরিদর্শন করে এক কাপ চা খেয়ে আসবে।",
    text: "I wish Jayma Motors all-round progress, and success to the young entrepreneur Mr. Shahidul Islam. I will ask all my driver friends to visit Jayma Motors and have a cup of tea.",
  },
  {
    name: "Imtiyaz Uddin Shafi",
    rating: 5,
    year: "2025",
    topics: ["wash", "repair"],
    text: "Great service. Wash servicing top notch",
  },
  {
    name: "Imroze Parvez",
    localGuide: true,
    rating: 5,
    year: "2023",
    topics: ["team", "repair"],
    text: "Staffs are decent. They know their work.",
  },
  {
    name: "Kazi Faisal Kabir",
    rating: 5,
    year: "2019",
    topics: ["repair"],
    text: "Jayma motors is a good excellent service workshop in Bangladesh",
  },
  {
    name: "Jahid Hassan",
    rating: 5,
    year: "2022",
    topics: ["repair"],
    text: "Great place for car repairing",
  },
  {
    name: "fazlul huque",
    localGuide: true,
    rating: 5,
    year: "2020",
    topics: ["repair"],
    text: "Service best & quick!",
  },
  {
    name: "Afnan Zaman",
    localGuide: true,
    rating: 5,
    year: "2019",
    topics: ["repair"],
    text: "Satisfied with their work",
  },
  {
    name: "Mohosina Akter",
    rating: 5,
    year: "2022",
    topics: ["repair"],
    text: "Very good workshop",
  },
  {
    name: "imran hossen",
    localGuide: true,
    rating: 5,
    year: "2021",
    topics: ["repair"],
    text: "Good for car servicing",
  },
  {
    name: "Vashkar Chatterjee",
    localGuide: true,
    rating: 4,
    year: "2019",
    topics: ["repair"],
    text: "Good place to service cars",
  },
];

/** Short lines from the reviews above, for the moving quote band. */
export const REVIEW_SNIPPETS = [
  "They know their work",
  "Highly recommended, I will come again!",
  "Great place for car repairing",
  "Reasonable price and they wash with care",
  "Service best & quick!",
  "One stop solution for vehicles",
  "Their rate also very competitive",
  "Satisfied with their work",
  "Wash servicing top notch",
  "Very good workshop",
  "Good place to service cars",
  "He cares about the car",
];
