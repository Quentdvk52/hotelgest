import React from "react";
import Image from "next/image";
import Link from "next/link";
import { LuxuryNavbar } from "@/components/marketing/luxury-navbar";
import { BookingEngine } from "@/components/marketing/booking-engine";
import { PropertiesSection } from "@/components/marketing/properties-section";
import { OffersSection } from "@/components/marketing/offers-section";
import { RoomsCarousel } from "@/components/marketing/rooms-carousel";
import { DiningSection } from "@/components/marketing/dining-section";
import { EventsKestrelCarousel } from "@/components/marketing/events-kestrel-carousel";
import { VehicleRentalSection } from "@/components/marketing/vehicle-rental-section";
import { EventsEquipmentSection } from "@/components/marketing/events-equipment-section";
import { CateringAndMcSection } from "@/components/marketing/catering-mc-section";
import { DirectBookingPerks } from "@/components/marketing/direct-booking-perks";
import { PracticalInfoSection } from "@/components/marketing/practical-info-section";
import { LuxuryFooter } from "@/components/marketing/luxury-footer";
import { Sparkles, ArrowRight, ShieldCheck, Award } from "lucide-react";

export default function LuxuryHomePage() {
  return (
    <div className="min-h-screen bg-[#fdfcfb] text-stone-900 flex flex-col selection:bg-[#7c3c46] selection:text-white">
      {/* 1. Sticky / Translucent Luxury Navbar */}
      <LuxuryNavbar />

      <main className="flex-1">
        {/* 2. Hero Section with Cinematic Ambience & Integrated Booking Engine */}
        <section className="relative min-h-[92vh] flex flex-col justify-between pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-stone-950 text-white">
          {/* Background Photography with Sophisticated Dark Vignette Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85"
              alt="Hôtel Le Vignoble - Domaine et Suites de Prestige"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter brightness-[0.45] contrast-[1.08] scale-105 animate-in fade-in duration-700"
            />
            {/* Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/80" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-950/30 to-stone-950/90 pointer-events-none" />
          </div>

          {/* Hero Editorial Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center my-auto">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-[#d9a844]/50 text-[#d9a844] text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 shadow-xl">
                <Sparkles className="w-4 h-4 text-[#d9a844]" />
                <span>Groupe Hôtelier Le Vignoble • Bohicon • Abomey • Calavi • Zogbodomey</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif tracking-tight text-white leading-[1.1] mb-6 drop-shadow-md">
                L&apos;Élégance Intemporelle & l&apos;Art de Recevoir au Bénin
              </h1>

              <p className="text-base sm:text-xl text-stone-200 font-light max-w-2xl mx-auto leading-relaxed mb-8">
                Quatre adresses d&apos;exception conçues pour les voyageurs raffinés. Suites royales,
                haute gastronomie du terroir, cave de garde climatisée et service attentif sur-mesure.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#reserver"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#d9a844] via-[#e4c26e] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold text-sm uppercase tracking-wider shadow-2xl shadow-[#d9a844]/30 transition-transform active:scale-95 flex items-center gap-2.5"
                >
                  <span>Réserver un séjour</span>
                  <ArrowRight className="w-4 h-4 text-stone-950" />
                </a>

                <a
                  href="#hotels"
                  className="px-7 py-4 rounded-2xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/80 text-sm font-semibold tracking-wide transition-colors backdrop-blur-md flex items-center gap-2"
                >
                  <span>Découvrir nos 4 hôtels</span>
                </a>
              </div>
            </div>
          </div>

          {/* Integrated Real Interactive Booking Engine */}
          <div className="relative z-20 mt-12 sm:mt-16">
            <BookingEngine />
          </div>
        </section>

        {/* 3. Section: Les 4 Hôtels Vignobles */}
        <PropertiesSection />

        {/* 4. Section: Nos Offres & Séjours d'Exception */}
        <OffersSection />

        {/* 5. Section: Hébergements & Suites de Prestige with Accessible Animated Carousel */}
        <RoomsCarousel />

        {/* 6. Section: Restaurant, Bar & Cave à Vin */}
        <DiningSection />

        {/* 6b. Section: Évènements, Galas & Rendez-vous (Carrousel Kestrel) */}
        <EventsKestrelCarousel />

        {/* 7. Section: Location de Véhicules & Chauffeurs VIP */}
        <VehicleRentalSection />

        {/* 8. Section: Salles de Réception & Matériel Événementiel */}
        <EventsEquipmentSection />

        {/* 8b. Section: Service Traiteur et Maître de Cérémonies */}
        <CateringAndMcSection />

        {/* 9. Section: Avantages de Réserver en Direct */}
        <DirectBookingPerks />

        {/* 10. Section: Informations Pratiques, Accès & Conciergerie */}
        <PracticalInfoSection />
      </main>

      {/* 11. Luxury Footer with Legal Notices and Discreet Staff Portal Link */}
      <LuxuryFooter />
    </div>
  );
}
