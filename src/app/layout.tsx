import type { Metadata } from "next";
import "./globals.css";
import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hotelgestion.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hôtel Le Vignoble — Écrins Hôteliers d'Exception au Bénin",
    template: "%s | Hôtel Le Vignoble",
  },
  description:
    "Séjournez dans les établissements de prestige du Groupe Hôtel Le Vignoble à Bohicon, Abomey, Abomey-Calavi et Zogbodomey. Suites royales, haute gastronomie locale, cave climatisée, service traiteur et flotte privée.",
  keywords: [
    "Hôtel Le Vignoble",
    "Hôtel Bénin",
    "Hôtel Bohicon",
    "Hôtel Abomey",
    "Hôtel Calavi",
    "Hôtel Zogbodomey",
    "Réservation hôtel Bénin",
    "Cave à vin Bénin",
    "Location véhicule VIP Bénin",
    "Service traiteur banquet Bénin",
    "Suite royale",
  ],
  authors: [{ name: "Groupe Hôtel Le Vignoble", url: siteUrl }],
  creator: "Hôtel Le Vignoble SARL",
  publisher: "Hôtel Le Vignoble SARL",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Hôtel Le Vignoble — Bénin",
    title: "Hôtel Le Vignoble — Écrins Hôteliers d'Exception au Bénin",
    description:
      "Suites royales, haute gastronomie du terroir, cave à vins millésimée, service traiteur de prestige et conciergerie VIP au Bénin.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Hôtel Le Vignoble — Hospitalité d'Élite au Bénin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hôtel Le Vignoble — Écrins Hôteliers d'Exception au Bénin",
    description:
      "Suites royales, haute gastronomie du terroir, cave à vins millésimée et conciergerie VIP au Bénin.",
    images: ["/api/og"],
    creator: "@HotelLeVignoble",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-[#fdfcfb] text-stone-900 antialiased">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
