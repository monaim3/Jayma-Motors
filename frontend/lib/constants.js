/**
 * Fallback business details (Step 2 §1). From F2 on, the header and footer
 * read these from Laravel's public settings; these values are the defaults.
 */
export const SITE = {
  name: "Jayma Motors",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description:
    "Multi-brand car service and repair workshop in Vatara, Dhaka since 2008. Computerized diagnosis, engine & brake service, denting, painting and authorized Shell Helix lubricants.",
  tagline: "Your Car's Care, Our Commitment",
  taglineBn: "আপনার গাড়ির যত্ন, আমাদের অঙ্গীকার — জায়মা মোটরস, যেখানে বিশ্বস্ততা মেলে দক্ষতায়!",
  since: 2008,
  phone: "01711-949110",
  phoneHref: "tel:+8801711949110",
  whatsappHref: "https://wa.me/8801711949110",
  email: "jaymamotors@gmail.com",
  address: "441-442, Evercare Hospital Road (beside Khanas/Khudos), Vatara, Dhaka, Bangladesh",
  /**
   * Workshop map position: the open plot on the south side of Kuwaiti Masjid
   * Road (beside the pond), marked by the owner on the satellite map. The
   * Google Business listing pin (23.8106731, 90.4305717) sits on Evercare
   * Hospital instead — owner to correct it in Google Business Profile.
   */
  geo: { lat: 23.807437, lng: 90.427828 },
  social: {
    facebook: "https://www.facebook.com/jaymamotors",
  },
};

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_LINKS = [
  { href: "/why-us", label: "Why Us" },
  { href: "/shell-helix", label: "Shell Helix Lubricants" },
  { href: "/service-enquiry", label: "Service Enquiry" },
  { href: "/book-appointment", label: "Book Appointment" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

export const ACCOUNT_NAV = [
  { href: "/account", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/account/vehicles", label: "My Vehicles", icon: "Car" },
  { href: "/account/appointments", label: "Appointments", icon: "CalendarDays" },
  { href: "/account/service-history", label: "Service History", icon: "Wrench" },
  { href: "/account/reviews", label: "My Reviews", icon: "Star" },
  { href: "/account/profile", label: "Profile", icon: "UserRound" },
];

/** Admin sidebar groups (Step 5 §4.4). `permission` hides items the role cannot use. */
export const ADMIN_NAV = [
  {
    label: "Operations",
    items: [
      { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", permission: "dashboard.view" },
      { href: "/admin/appointments", label: "Appointments", icon: "CalendarDays", permission: "appointments.manage" },
      { href: "/admin/enquiries", label: "Enquiries", icon: "Inbox", permission: "enquiries.manage" },
      {
        href: "/admin/service-records",
        label: "Service Records",
        icon: "Wrench",
        permission: "service-records.manage",
      },
      { href: "/admin/customers", label: "Customers", icon: "Users", permission: "customers.manage" },
      { href: "/admin/vehicles", label: "Vehicles", icon: "Car", permission: "vehicles.manage" },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/services", label: "Services", icon: "Settings2", permission: "content.manage" },
      { href: "/admin/products", label: "Products", icon: "Package", permission: "content.manage" },
      { href: "/admin/posts", label: "Blog", icon: "Newspaper", permission: "content.manage" },
      { href: "/admin/gallery", label: "Gallery", icon: "Images", permission: "content.manage" },
      { href: "/admin/reviews", label: "Reviews", icon: "Star", permission: "reviews.moderate" },
      { href: "/admin/client-logos", label: "Client Logos", icon: "BadgeCheck", permission: "content.manage" },
      { href: "/admin/pages", label: "Pages", icon: "FileText", permission: "content.manage" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: "SlidersHorizontal", permission: "settings.manage" },
      { href: "/admin/users", label: "Users", icon: "UserCog", permission: "users.manage" },
      { href: "/admin/audit-log", label: "Audit Log", icon: "History", permission: "audit-logs.view" },
    ],
  },
];

/** Status → badge tone (Step 5 §2.3). */
export const STATUS_TONES = {
  pending: "warning",
  new: "warning",
  confirmed: "info",
  contacted: "info",
  in_progress: "info",
  checked_in: "violet",
  completed: "success",
  approved: "success",
  converted: "success",
  published: "success",
  cancelled: "neutral",
  rejected: "neutral",
  no_show: "neutral",
  expired: "outline",
  closed: "outline",
  draft: "outline",
};
