"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  CalendarCheck,
  User,
  ChevronDown,
  Sparkles,
  Bed,
  Utensils,
  Wine,
  PartyPopper,
  Car,
  ArrowRight,
  Phone,
  ShieldCheck,
} from "lucide-react";

export function LuxuryNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mega menu on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const servicesMegaMenu = [
    {
      title: "Hébergements & Suites de Prestige",
      tagline: "Standard Confort, Supérieure & Suite Royale",
      description: "Suites climatisées de 24m² à 60m², literie king size, baignoire balnéo et vue jardin.",
      price: "Dès 25 000 XOF / nuit",
      imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
      href: "/#hebergements",
      icon: <Bed className="w-4 h-4 text-[#d4af37]" />,
      badge: "Hôtel 4 Étoiles",
    },
    {
      title: "Haute Gastronomie & Bar Lounge",
      tagline: "Saveurs d'Abomey & Cuisine Internationale",
      description: "Amiwo au poulet bicyclette, sauce crincrin au mouton, carte QR et cocktails signatures.",
      price: "Dès 4 500 XOF le plat",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      href: "/#restaurant",
      icon: <Utensils className="w-4 h-4 text-[#d4af37]" />,
      badge: "Cuisine Terroir",
    },
    {
      title: "Cave à Vin & Champagnes",
      tagline: "Boutique en Ligne & Grands Crus de Garde",
      description: "Moët & Chandon, Veuve Clicquot, Châteauneuf-du-Pape, rhums vieux et boissons locales.",
      price: "Dès 3 500 XOF la bouteille",
      imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
      href: "/cave-a-vin",
      icon: <Wine className="w-4 h-4 text-[#d4af37]" />,
      badge: "Boutique Officielle",
    },
    {
      title: "Service Traiteur & Banquets",
      tagline: "Buffets Prestigieux & Réceptions Clé en Main",
      description: "Buffets béninois complets, cocktails dînatoires et brigade de maîtres d'hôtel en tenue.",
      price: "Dès 8 500 XOF / convive",
      imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80",
      href: "/catering-equipment",
      icon: <PartyPopper className="w-4 h-4 text-[#d4af37]" />,
      badge: "Sur-Mesure",
    },
    {
      title: "Location de Matériel Événementiel",
      tagline: "Chaises Napoléon, Tables Rondes & Bâches 50m²",
      description: "Mobilier VIP blanc, couverts dorés prestige, chafing dishes et livraison sur site.",
      price: "Dès 500 XOF / article / jour",
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80",
      href: "/catering-equipment",
      icon: <Sparkles className="w-4 h-4 text-[#d4af37]" />,
      badge: "Stock Immédiat",
    },
    {
      title: "Flotte de Véhicules VIP avec Chauffeur",
      tagline: "Navettes Aéroport Cotonou & Excursions",
      description: "Berlines de luxe climatisées et SUV 4x4 tout-terrain avec chauffeurs bilingues formés.",
      price: "Dès 45 000 XOF le transfert",
      imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
      href: "/#location",
      icon: <Car className="w-4 h-4 text-[#d4af37]" />,
      badge: "Service 24/7",
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-stone-950/95 backdrop-blur-xl border-b border-stone-800/90 py-3 shadow-2xl"
          : "bg-gradient-to-b from-stone-950/90 via-stone-950/60 to-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Identity with Official Logo */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] rounded-2xl"
            aria-label="Hôtel Le Vignoble - Accueil"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 shadow-lg shadow-black/40 border border-white/30 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-200 flex-shrink-0">
              <Image
                src="/logo-vignoble-transparent.png"
                alt="Logo Officiel Hôtel Le Vignoble"
                width={56}
                height={56}
                priority
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">
                Hôtel Le Vignoble
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
                Bohicon • Abomey • Calavi • Zogbodomey
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden xl:flex items-center gap-6 text-sm font-medium text-stone-200"
            aria-label="Navigation principale"
          >
            <a
              href="/#hotels"
              className="py-1 hover:text-[#d4af37] transition-colors duration-150"
            >
              Les Hôtels Vignobles
            </a>

            {/* "Nos offres" Trigger for Professional Mega Menu */}
            <div className="relative" ref={megaMenuRef}>
              <button
                type="button"
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                onMouseEnter={() => setMegaMenuOpen(true)}
                className={`inline-flex items-center gap-1.5 py-1 transition-colors duration-150 font-semibold ${
                  megaMenuOpen ? "text-[#d4af37]" : "hover:text-[#d4af37]"
                }`}
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
              >
                <span>Nos offres</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    megaMenuOpen ? "rotate-180 text-[#d4af37]" : "text-stone-400"
                  }`}
                />
              </button>

              {/* Mega Menu Dropdown Card */}
              {megaMenuOpen && (
                <div
                  onMouseLeave={() => setMegaMenuOpen(false)}
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[980px] max-w-[95vw] z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200"
                >
                  <div className="bg-stone-950/98 backdrop-blur-3xl border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-white">
                    {/* Mega Menu Top Header */}
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-800/80">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37] block">
                          Univers & Prestations Exclusives
                        </span>
                        <h3 className="text-xl font-bold font-serif text-white">
                          Les Services Signatures de l&apos;Hôtel Le Vignoble
                        </h3>
                      </div>
                      <Link
                        href="/#offres"
                        onClick={() => setMegaMenuOpen(false)}
                        className="text-xs text-[#d4af37] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Voir les packages séjours</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* 6 Grid Service Cards with Real Images */}
                    <div className="grid grid-cols-3 gap-5">
                      {servicesMegaMenu.map((service, idx) => (
                        <Link
                          key={idx}
                          href={service.href}
                          onClick={() => setMegaMenuOpen(false)}
                          className="group relative rounded-2xl bg-stone-900/80 border border-stone-800 overflow-hidden hover:border-[#d4af37]/60 transition-all flex flex-col justify-between"
                        >
                          <div className="relative h-28 w-full overflow-hidden">
                            <Image
                              src={service.imageUrl}
                              alt={service.title}
                              fill
                              sizes="320px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-950/80 text-[10px] font-bold text-[#d4af37] border border-stone-700 backdrop-blur-md">
                              {service.icon}
                              <span>{service.badge}</span>
                            </div>
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold font-serif text-white group-hover:text-[#d4af37] transition-colors leading-snug">
                                {service.title}
                              </h4>
                              <p className="text-[11px] text-stone-400 font-light mt-1 line-clamp-2 leading-relaxed">
                                {service.description}
                              </p>
                            </div>
                            <div className="pt-2 mt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                              <span className="font-bold text-[#d4af37]">{service.price}</span>
                              <span className="text-stone-400 group-hover:text-white flex items-center gap-0.5">
                                Découvrir <ArrowRight className="w-3 h-3 text-[#d4af37]" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Mega Menu Bottom Strip */}
                    <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-300">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                        <span>Meilleur tarif garanti • Accueil VIP offert en direct</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <a
                          href="tel:+22997001122"
                          className="text-[#d4af37] hover:underline flex items-center gap-1.5 font-semibold"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Conciergerie : +229 97 00 11 22</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <a
              href="/#hebergements"
              className="py-1 hover:text-[#d4af37] transition-colors duration-150"
            >
              Hébergements
            </a>

            <a
              href="/#restaurant"
              className="py-1 hover:text-[#d4af37] transition-colors duration-150"
            >
              Restaurant
            </a>

            {/* Added: Service Traiteur */}
            <Link
              href="/catering-equipment"
              className="py-1 hover:text-[#d4af37] transition-colors duration-150"
            >
              Service traiteur
            </Link>

            {/* Added: Cave à Vin (Boutique) */}
            <Link
              href="/cave-a-vin"
              className="py-1 text-[#d4af37] hover:text-[#e4c26e] transition-colors duration-150 font-semibold flex items-center gap-1"
            >
              <Wine className="w-3.5 h-3.5" />
              <span>Cave à vin</span>
            </Link>

            <a
              href="/#location"
              className="py-1 hover:text-[#d4af37] transition-colors duration-150"
            >
              Location
            </a>
          </nav>

          {/* Action CTAs: Book & Client Login Only */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/#reserver"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-700/80 text-xs font-semibold tracking-wide transition-all duration-150 hover:border-[#d4af37]/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            >
              <CalendarCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Réserver</span>
            </a>

            {/* Top Header Login Button: Strictly for Guests & Visitors */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#be9629] hover:from-[#e4c26e] hover:to-[#d4af37] text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#d4af37]/20 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-stone-950"
            >
              <User className="w-4 h-4 text-stone-950" />
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 xl:hidden">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-stone-950 text-xs font-bold uppercase tracking-wider shadow-md"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-stone-900/90 border border-stone-800 text-stone-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              aria-expanded={mobileMenuOpen}
              aria-label="Ouvrir le menu de navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-stone-950/98 backdrop-blur-2xl border-b border-stone-800 px-4 pt-4 pb-6 mt-3 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-2.5">
            <a
              href="/#hotels"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-stone-200 hover:bg-stone-900 hover:text-[#d4af37] font-medium text-sm transition-colors"
            >
              Les Hôtels Vignobles
            </a>
            <a
              href="/#offres"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-stone-200 hover:bg-stone-900 hover:text-[#d4af37] font-medium text-sm transition-colors"
            >
              Nos offres & séjours
            </a>
            <a
              href="/#hebergements"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-stone-200 hover:bg-stone-900 hover:text-[#d4af37] font-medium text-sm transition-colors"
            >
              Hébergements
            </a>
            <a
              href="/#restaurant"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-stone-200 hover:bg-stone-900 hover:text-[#d4af37] font-medium text-sm transition-colors"
            >
              Restaurant
            </a>
            <Link
              href="/catering-equipment"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-stone-200 hover:bg-stone-900 hover:text-[#d4af37] font-medium text-sm transition-colors"
            >
              Service traiteur
            </Link>
            <Link
              href="/cave-a-vin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[#d4af37] hover:bg-stone-900 font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <Wine className="w-4 h-4" />
              <span>Cave à vin (Boutique)</span>
            </Link>
            <a
              href="/#location"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-stone-200 hover:bg-stone-900 hover:text-[#d4af37] font-medium text-sm transition-colors"
            >
              Location
            </a>

            <div className="pt-4 border-t border-stone-800/80 flex flex-col gap-2.5">
              <a
                href="/#reserver"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-stone-900 text-stone-200 text-center font-semibold text-sm flex items-center justify-center gap-2 border border-stone-800"
              >
                <CalendarCheck className="w-4 h-4 text-[#d4af37]" />
                <span>Réserver un séjour</span>
              </a>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#be9629] text-stone-950 text-center font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
              >
                <User className="w-4 h-4 text-stone-950" />
                <span>Mon Compte Client (Visiteurs)</span>
              </Link>
              <Link
                href="/staff/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-stone-950 text-stone-400 text-center font-medium text-xs flex items-center justify-center gap-2 border border-stone-800/60"
              >
                <span>Accès Direction & Staff →</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
