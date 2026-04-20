import nextPwa from "next-pwa";

const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.DISABLE_PWA === "true",
  customWorkerDir: "worker",
  runtimeCaching: [
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
};

export default withPWA(nextConfig);
