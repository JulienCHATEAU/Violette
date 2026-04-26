import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Agentation } from "agentation";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

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
  themeColor: "#7a559f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <main className="flex-1 w-full max-w-xl mx-auto px-6 sm:px-8 pt-8 pb-32">{children}</main>
        <Nav />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
