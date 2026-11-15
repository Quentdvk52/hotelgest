"use client";

import React, { useState } from "react";
import { SEED_PROPERTIES, SEED_ROOM_TYPES } from "@/lib/db/seed";
import {
  Calendar,
  Users,
  MapPin,
  Search,
  CheckCircle2,
  Sparkles,
  Phone,
  MessageSquare,
  Bed,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function BookingEngine() {
  const [selectedPropertyId, setSelectedPropertyId] = useState(SEED_PROPERTIES[0].id);
  const [checkIn, setCheckIn] = useState("2026-11-20");
  const [checkOut, setCheckOut] = useState("2026-11-22");
  const [adults, setAdults] = useState("2");
  const [rooms, setRooms] = useState("1");
  const [showResults, setShowResults] = useState(false);
  const [bookingModalRoom, setBookingModalRoom] = useState<any | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const selectedProperty =
    SEED_PROPERTIES.find((p) => p.id === selectedPropertyId) || SEED_PROPERTIES[0];

  // Calculate nights
  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById("disponibilites")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleOpenBooking = (room: any) => {
    setBookingModalRoom(room);
    setBookingSuccess(false);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  return (
    <div id="reserver" className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Luxury Search Bar Card */}
      <div className="bg-stone-950/90 backdrop-blur-2xl border border-[#d9a844]/40 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-4 text-[#d9a844] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Moteur de Réservation Officiel • Meilleur Tarif Garanti</span>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Destination / Hotel Selector */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 hover:border-[#d9a844]/60 transition-colors">
            <label className="block text-[11px] font-medium text-stone-400 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#d9a844]" /> Établissement
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer"
            >
              {SEED_PROPERTIES.map((prop) => (
                <option key={prop.id} value={prop.id} className="bg-stone-900 text-white">
                  {prop.name.replace("Hôtel Le Vignoble - ", "")} ({prop.city})
                </option>
              ))}
            </select>
          </div>

          {/* Dates In / Out */}
          <div className="grid grid-cols-2 gap-2 bg-stone-900/90 border border-stone-800 rounded-2xl p-3 hover:border-[#d9a844]/60 transition-colors">
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#d9a844]" /> Arrivée
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">
                Départ
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Guests & Rooms */}
          <div className="grid grid-cols-2 gap-2 bg-stone-900/90 border border-stone-800 rounded-2xl p-3 hover:border-[#d9a844]/60 transition-colors">
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-[#d9a844]" /> Voyageurs
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer"
              >
                <option value="1" className="bg-stone-900 text-white">1 Adulte</option>
                <option value="2" className="bg-stone-900 text-white">2 Adultes</option>
                <option value="3" className="bg-stone-900 text-white">3 Adultes</option>
                <option value="4" className="bg-stone-900 text-white">4 Adultes</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">
                Chambre
              </label>
              <select
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer"
              >
                <option value="1" className="bg-stone-900 text-white">1 Chambre</option>
                <option value="2" className="bg-stone-900 text-white">2 Chambres</option>
                <option value="3" className="bg-stone-900 text-white">3 Chambres</option>
              </select>
            </div>
          </div>

          {/* Search CTA */}
          <div className="flex items-center">
            <button
              type="submit"
              className="w-full h-full min-h-[52px] rounded-2xl bg-gradient-to-r from-[#d9a844] via-[#e4c26e] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold text-sm tracking-wide uppercase shadow-xl shadow-[#d9a844]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Search className="w-4 h-4 text-stone-950" />
              <span>Vérifier les disponibilités</span>
            </button>
          </div>
        </form>

        <div className="mt-3.5 flex flex-wrap items-center justify-between text-xs text-stone-400 px-1 pt-2 border-t border-stone-800/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d9a844]" />
            <span>Tarifs directs sans intermédiaire • Annulation flexible</span>
          </div>
          <div className="text-[#d9a844] font-medium hidden sm:block">
            Conciergerie 24/7 : {selectedProperty.phone}
          </div>
        </div>
      </div>

      {/* Live Available Rooms Showcase */}
      {showResults && (
        <div
          id="disponibilites"
          className="mt-8 bg-stone-900/95 border border-stone-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-white shadow-2xl animate-in fade-in-50 duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#d9a844] font-bold block mb-1">
                Disponibilités Confirmées
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                {selectedProperty.name}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Séjour de {nights} nuit{nights > 1 ? "s" : ""} du{" "}
                <span className="text-stone-200 font-semibold">{checkIn}</span> au{" "}
                <span className="text-stone-200 font-semibold">{checkOut}</span> • {adults} voyageur{Number(adults) > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${selectedProperty.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700"
              >
                <Phone className="w-3.5 h-3.5 text-[#d9a844]" />
                <span>{selectedProperty.phone}</span>
              </a>
              <button
                onClick={() => setShowResults(false)}
                className="p-2 text-stone-400 hover:text-white"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {SEED_ROOM_TYPES.map((rt) => {
              const totalPrice = rt.basePriceXof * nights * Number(rooms);
              return (
                <div
                  key={rt.id}
                  className="bg-stone-950/70 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between hover:border-[#d9a844]/50 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#184f28]/40 text-[#e4c26e] border border-[#184f28]/60">
                        {rt.code}
                      </span>
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Disponible
                      </span>
                    </div>

                    <h4 className="text-lg font-bold font-serif text-white group-hover:text-[#d9a844] transition-colors">
                      {rt.name}
                    </h4>
                    <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                      {rt.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-300">
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-[#d9a844]" />
                        Capacité : {rt.capacity} pers.
                      </span>
                      <span className="text-stone-400">Wi-Fi & Climatisation</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-800 flex items-end justify-between">
                    <div>
                      <div className="text-lg sm:text-xl font-extrabold text-[#d9a844]">
                        {totalPrice.toLocaleString("fr-FR")} XOF
                      </div>
                      <div className="text-[11px] text-stone-400">
                        ({rt.basePriceXof.toLocaleString("fr-FR")} XOF / nuit)
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(rt)}
                      className="px-4 py-2 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <span>Sélectionner</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reservation Confirmation Modal */}
      {bookingModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white relative shadow-2xl">
            <button
              onClick={() => setBookingModalRoom(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg"
              aria-label="Fermer la modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSuccess ? (
              <div>
                <span className="text-xs uppercase tracking-widest text-[#d9a844] font-bold block mb-1">
                  Finaliser votre réservation directe
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif mb-2">
                  {bookingModalRoom.name}
                </h3>
                <p className="text-xs text-stone-400 mb-6">
                  {selectedProperty.name} • {nights} nuit{nights > 1 ? "s" : ""} ({checkIn} au {checkOut})
                </p>

                <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800 mb-6 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-300">
                    <span>Tarif par nuit :</span>
                    <span className="font-semibold">{bookingModalRoom.basePriceXof.toLocaleString("fr-FR")} XOF</span>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>Durée du séjour :</span>
                    <span>{nights} nuit{nights > 1 ? "s" : ""} x {rooms} chambre{Number(rooms) > 1 ? "s" : ""}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-800 flex justify-between text-sm font-bold text-[#d9a844]">
                    <span>Montant total estimé :</span>
                    <span>{(bookingModalRoom.basePriceXof * nights * Number(rooms)).toLocaleString("fr-FR")} XOF</span>
                  </div>
                </div>

                <form onSubmit={handleConfirmReservation} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Nom complet du client principal
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Mme / M. Dossou..."
                      className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#d9a844]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Numéro de téléphone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+229 97 00 00 00"
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#d9a844]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Adresse email
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="client@domaine.com"
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#d9a844]"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-400">
                    Règlement sur place à l&apos;arrivée ou par Mobile Money / Virement validé par la réception. Aucune carte bancaire requise immédiatement.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d9a844] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Confirmer la demande de séjour</span>
                    <ArrowRight className="w-4 h-4 text-stone-950" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif mb-2">Demande Enregistrée avec Succès !</h3>
                <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed mb-6">
                  Merci <span className="font-semibold text-white">{guestName}</span>. Notre conciergerie à{" "}
                  <span className="text-[#d9a844] font-semibold">{selectedProperty.name}</span> a bien reçu votre demande pour{" "}
                  <span className="font-semibold text-white">{bookingModalRoom.name}</span>. Un agent vous contacte au{" "}
                  <span className="font-semibold text-white">{guestPhone}</span> pour finaliser l&apos;accueil.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://wa.me/22997001122?text=Bonjour%2C%20je%20souhaite%20confirmer%20ma%20r%C3%A9servation%20pour%20${encodeURIComponent(
                      bookingModalRoom.name
                    )}%20au%20Vignoble`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Contacter par WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setBookingModalRoom(null);
                      setShowResults(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
