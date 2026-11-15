import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hôtel Le Vignoble — Écrins Hôteliers d'Exception au Bénin",
  description:
    "Séjournez dans les établissements de prestige du Groupe Hôtel Le Vignoble à Bohicon, Abomey, Abomey-Calavi et Zogbodomey. Suites royales, haute gastronomie locale, cave climatisée et service personnalisé d'excellence.",
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
