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
    // Next 16 blocks images from local IPs by default; the Laravel dev server runs on localhost.
    dangerouslyAllowLocalIP: isDev,
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
    ];
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
