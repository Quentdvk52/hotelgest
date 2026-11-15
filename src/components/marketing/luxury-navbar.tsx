"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, CalendarCheck, User, Sparkles } from "lucide-react";

export function LuxuryNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Les Hôtels Vignobles", href: "#hotels" },
    { label: "Nos offres", href: "#offres" },
    { label: "Hébergements", href: "#hebergements" },
    { label: "Restaurant", href: "#restaurant" },
    { label: "Location", href: "#location" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-stone-950/95 backdrop-blur-xl border-b border-stone-800/90 py-3 shadow-2xl"
          : "bg-gradient-to-b from-stone-950/90 via-stone-950/50 to-transparent py-4 sm:py-5"
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
            {/* Official Logo Badge: Preserves exact proportions and pristine sharpness */}
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
            className="hidden lg:flex items-center gap-8 text-sm font-medium text-stone-200"
            aria-label="Navigation principale"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative py-1 hover:text-[#d4af37] transition-colors duration-150 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#d4af37] hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs: Book & Login */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#reserver"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-700/80 text-xs font-semibold tracking-wide transition-all duration-150 hover:border-[#d4af37]/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            >
              <CalendarCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Réserver</span>
            </a>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#be9629] hover:from-[#e4c26e] hover:to-[#d4af37] text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#d4af37]/20 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-stone-950"
            >
              <User className="w-4 h-4 text-stone-950" />
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-[#d4af37] text-stone-950 text-xs font-bold uppercase tracking-wider shadow-md"
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
        <div className="lg:hidden bg-stone-950/95 backdrop-blur-2xl border-b border-stone-800 px-4 pt-4 pb-6 mt-3 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-stone-200 hover:bg-stone-900 hover:text-[#d4af37] font-medium text-base transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-stone-800/80 flex flex-col gap-2.5">
              <a
                href="#reserver"
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
                <span>Login (Client / Staff)</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
