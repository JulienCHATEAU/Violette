import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Violette — mes plantes",
  description: "PWA pour soigner mes plantes et recevoir leurs petits messages 🌿",
  applicationName: "Violette",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Violette" },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#2d8630",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-6 pb-24 safe-top">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
