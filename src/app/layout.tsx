import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotelGest — Plateforme SaaS de Gestion Hôtelière & Événementielle",
  description:
    "Solution moderne et intégrée de gestion hôtelière multi-sites, restauration, service traiteur et location de matériel événementiel.",
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
      </body>
    </html>
  );
}
