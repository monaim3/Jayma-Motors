import { Anton, Bodoni_Moda, Nunito_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { SITE } from "@/lib/constants";
import "./globals.css";

// Body + UI headings: Nunito Sans — soft, highly readable (as on the reference site).
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
});

// Display headings: Bodoni Moda — elegant high-contrast Didot serif (the reference
// site's Theano Didot style; Theano is not on Google Fonts).
const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  display: "swap",
});

// Poster headlines on the service cards only: bold condensed, like workshop ads.
// Not preloaded, so other pages don't download it.
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Car Service & Repair in Dhaka`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    locale: "en_BD",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#c42927",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunitoSans.variable} ${bodoniModa.variable} ${anton.variable}`}>
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body>; ignore those mismatches. */}
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
