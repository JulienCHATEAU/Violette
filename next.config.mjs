import nextPwa from "next-pwa";

const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  customWorkerDir: "worker",
  runtimeCaching: [
    {
      urlPattern: /^\/uploads\/.*/i,
      handler: "CacheFirst",
      options: { cacheName: "uploads", expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } },
    },
    {
      urlPattern: /^\/api\/plants\/?.*/i,
      handler: "NetworkFirst",
      options: { cacheName: "api-plants", networkTimeoutSeconds: 3 },
    },
    {
      urlPattern: /^\/plants(\/|$)/i,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "pages-plants" },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
};

export default withPWA(nextConfig);
