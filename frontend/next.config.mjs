const isDev = process.env.NODE_ENV === "development";
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,

  // Public content cached for 10 minutes, refreshed sooner when Laravel calls /api/revalidate.
  cacheLife: {
    content: { stale: 300, revalidate: 600, expire: 86400 },
  },

  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", ""),
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/storage/**",
      },
    ],
    // 90 = large hero photos (service pages); everything else uses the default 75.
    qualities: [75, 90],
    // Next 16 blocks images from local IPs by default; the Laravel dev server runs on localhost.
    dangerouslyAllowLocalIP: isDev,
  },

  // Pages dropped from the plan (owner, 2026-11-09): keep old/shared links working.
  async redirects() {
    return [
      { source: "/why-us", destination: "/about", permanent: true },
      // Temporary: points to /products (Shell Helix category) once that page exists.
      { source: "/shell-helix", destination: "/#shell-helix", permanent: false },
      // Temporary until these pages are built (booking = B3); remove each line when its page exists.
      { source: "/book-appointment", destination: "/#appointment", permanent: false },
      { source: "/service-enquiry", destination: "/contact", permanent: false },
      { source: "/products", destination: "/#shell-helix", permanent: false },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Static files in public/ (3.5 MB 3D car, photos, videos): let browsers keep
      // them for a week, then refresh in the background. Names aren't hashed, so a
      // replaced file shows up within a week (or straight away under a new name).
      ...["/models/:path*", "/images/:path*", "/videos/:path*", "/brand/:path*"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      })),
      // MapLibre worker is re-copied on every install; one day is enough.
      {
        source: "/vendor/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
