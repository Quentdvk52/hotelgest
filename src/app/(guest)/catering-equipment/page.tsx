"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  UtensilsCrossed,
  Package,
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  ShieldCheck,
  ArrowLeft,
  Truck,
  Plus,
  Minus,
} from "lucide-react";
import { KkiapayButton } from "@/components/payments/kkiapay-button";
import {
  SEED_PROPERTIES,
  SEED_CATERING_MENUS,
  SEED_EQUIPMENT_ITEMS,
} from "@/lib/db/seed";

export default function CateringEquipmentPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState(SEED_PROPERTIES[0].id);
  const [activeSection, setActiveSection] = useState<"CATERING" | "EQUIPMENT" | "COMBO">("COMBO");

  // Client form info
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [eventDate, setEventDate] = useState("2026-12-25");
  const [eventTime, setEventTime] = useState("12:00");
  const [deliveryLocation, setDeliveryLocation] = useState("Cotonou / Bohicon");
  const [serviceType, setServiceType] = useState<"LIVRAISON" | "RETRAIT" | "PRESTATION_AVEC_PERSONNEL">("PRESTATION_AVEC_PERSONNEL");
  const [guestCount, setGuestCount] = useState(30);
  const [dietaryNotes, setDietaryNotes] = useState("");

  // Selections
  const [selectedCateringMenuId, setSelectedCateringMenuId] = useState(SEED_CATERING_MENUS[0].id);
  const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({
    "eq-chaise-nap": 30,
    "eq-table-ronde": 3,
    "eq-couverts-dor": 30,
  });

  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);

  const selectedMenu = SEED_CATERING_MENUS.find((m) => m.id === selectedCateringMenuId) || SEED_CATERING_MENUS[0];

  // Price calculations
  const cateringSubtotal =
    activeSection !== "EQUIPMENT" ? selectedMenu.pricePerPersonXof * Math.max(guestCount, selectedMenu.minGuests) : 0;

  const deliveryFee = serviceType === "PRESTATION_AVEC_PERSONNEL" ? 25000 : serviceType === "LIVRAISON" ? 10000 : 0;

  let equipmentRentalTotal = 0;
  let equipmentCautionTotal = 0;

  if (activeSection !== "CATERING") {
    SEED_EQUIPMENT_ITEMS.forEach((eq) => {
      const qty = equipmentQuantities[eq.id] || 0;
      equipmentRentalTotal += qty * eq.dailyRentalPriceXof;
      equipmentCautionTotal += qty * eq.depositPerUnitXof;
    });
  }

  const grandTotal = cateringSubtotal + deliveryFee + equipmentRentalTotal;

  const handleEquipmentQtyChange = (itemId: string, delta: number) => {
    setEquipmentQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert("Veuillez renseigner votre nom et votre numéro de téléphone.");
      return;
    }

    setSubmitting(true);
    try {
      let cateringOrderRes = null;
      let equipmentRentalRes = null;

      // 1. Submit catering order if requested
      if (activeSection !== "EQUIPMENT") {
        const cateringPayload = {
          propertyId: selectedPropertyId,
          clientName,
          clientPhone,
          eventDate,
          eventTime,
          deliveryLocation,
          serviceType,
          guestCount,
          dietaryNotes,
          items: [
            {
              name: selectedMenu.name,
              quantityPortions: guestCount,
              unitPriceXof: selectedMenu.pricePerPersonXof,
            },
          ],
          deliveryFeeXof: deliveryFee,
        };

        const res = await fetch("/api/catering/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cateringPayload),
        });
        const json = await res.json();
        if (json.success) cateringOrderRes = json.data;
      }

      // 2. Submit equipment rental if requested
      if (activeSection !== "CATERING") {
        const itemsToRent = Object.entries(equipmentQuantities)
          .filter(([_, qty]) => qty > 0)
          .map(([itemId, quantity]) => ({ itemId, quantity }));

        if (itemsToRent.length > 0) {
          const rentalPayload = {
            propertyId: selectedPropertyId,
            clientName,
            clientPhone,
            startDate: eventDate,
            endDate: eventDate,
            eventLocation: deliveryLocation,
            items: itemsToRent,
            cateringOrderId: cateringOrderRes?.id,
          };

          const res = await fetch("/api/equipment/rentals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rentalPayload),
          });
          const json = await res.json();
          if (json.success) equipmentRentalRes = json.data;
        }
      }

      setConfirmation({
        cateringOrder: cateringOrderRes,
        equipmentRental: equipmentRentalRes,
        grandTotal,
        equipmentCautionTotal,
      });
    } catch (err: any) {
      alert("Erreur lors de l'envoi de la demande : " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="min-h-screen bg-[#faf5f5] flex items-center justify-center p-4">
        <Card className="max-w-xl w-full p-8 text-center bg-white shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <Badge variant="gold" className="mb-2">Demande & Devis Transmis</Badge>
          <h2 className="text-2xl font-black text-stone-900">Demande Enregistrée avec Succès</h2>
          <p className="text-sm text-stone-600 mt-2 mb-6">
            Votre dossier d&apos;événement a été transmis au responsable événementiel du site.
            Un devis officiel vous sera envoyé sous 24h ouvrées.
          </p>

          <div className="bg-stone-50 rounded-2xl p-6 text-left text-xs space-y-3 mb-6 border border-stone-200">
            {confirmation.cateringOrder && (
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="font-semibold text-stone-600">Réf. Traiteur :</span>
                <span className="font-bold text-stone-900">{confirmation.cateringOrder.orderNumber}</span>
              </div>
            )}
            {confirmation.equipmentRental && (
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="font-semibold text-stone-600">Réf. Location Matériel :</span>
                <span className="font-bold text-stone-900">{confirmation.equipmentRental.rentalNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-600">Prestation estimée :</span>
              <span className="font-extrabold text-[#7c3c46] text-sm">
                {confirmation.grandTotal.toLocaleString("fr-FR")} XOF
              </span>
            </div>
            {confirmation.equipmentCautionTotal > 0 && (
              <div className="flex justify-between text-amber-700 bg-amber-50 p-2 rounded-lg">
                <span>Caution de garantie matériel (restituable) :</span>
                <span className="font-bold">{confirmation.equipmentCautionTotal.toLocaleString("fr-FR")} XOF</span>
              </div>
            )}
          </div>

          <Link href="/">
            <Button variant="primary" className="w-full">
              Retour à l&apos;accueil
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5f5] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Accueil
          </Link>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-black text-[#7c3c46]">
              Service Traiteur & Matériel Événementiel
            </h1>
            <p className="text-xs text-stone-500 font-medium">Hôtel Le Vignoble — Devis & Réservations</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Espace Staff</Button>
          </Link>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={activeSection === "COMBO" ? "primary" : "outline"}
            onClick={() => setActiveSection("COMBO")}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" /> Traiteur + Matériel (Pack Complet)
          </Button>
          <Button
            variant={activeSection === "CATERING" ? "primary" : "outline"}
            onClick={() => setActiveSection("CATERING")}
            className="gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" /> Traiteur Seul
          </Button>
          <Button
            variant={activeSection === "EQUIPMENT" ? "primary" : "outline"}
            onClick={() => setActiveSection("EQUIPMENT")}
            className="gap-2"
          >
            <Package className="w-4 h-4" /> Matériel Seul
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Configuration & Catalog */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Site & Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#7c3c46]" /> 1. Détails de la Manifestation
                </CardTitle>
                <CardDescription>
                  Date, créneau, lieu et sélection de l&apos;établissement Le Vignoble gestionnaire.
                </CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Établissement Responsable
                  </label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#7c3c46]"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Mode de Service
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#7c3c46]"
                  >
                    <option value="PRESTATION_AVEC_PERSONNEL">Prestation avec Personnel & Service (+25 000 XOF)</option>
                    <option value="LIVRAISON">Livraison sur site uniquement (+10 000 XOF)</option>
                    <option value="RETRAIT">Retrait à l&apos;hôtel (Gratuit)</option>
                  </select>
                </div>

                <Input
                  label="Date de l'événement"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />

                <Input
                  label="Heure de service / livraison"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  required
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Lieu précis de livraison / événement"
                    placeholder="Adresse complète, salle des fêtes ou esplanade"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Step 2: Traiteur Selection (if enabled) */}
            {activeSection !== "EQUIPMENT" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-[#7c3c46]" /> 2. Formule Traiteur & Nombre de Convives
                  </CardTitle>
                  <CardDescription>
                    Buffets complets et cocktails préparés par nos chefs.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <div className="w-full sm:w-1/2">
                    <Input
                      label="Nombre de personnes à servir"
                      type="number"
                      min={10}
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 10)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SEED_CATERING_MENUS.map((menu: any) => (
                      <div
                        key={menu.id}
                        onClick={() => setSelectedCateringMenuId(menu.id)}
                        className={`overflow-hidden rounded-2xl border cursor-pointer transition-all ${
                          selectedCateringMenuId === menu.id
                            ? "border-[#7c3c46] bg-[#faf5f5] ring-2 ring-[#7c3c46]/20 shadow-sm"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        {menu.imageUrl && (
                          <div className="relative w-full h-40 bg-stone-100 overflow-hidden">
                            <img
                              src={menu.imageUrl}
                              alt={menu.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-stone-950/80 text-white font-mono text-xs font-bold backdrop-blur-xs">
                              {menu.pricePerPersonXof.toLocaleString("fr-FR")} XOF / pers.
                            </span>
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1.5">
                            <h4 className="font-bold text-stone-900 text-sm">{menu.name}</h4>
                          </div>
                          <p className="text-xs text-stone-500 leading-relaxed">{menu.description}</p>
                          <div className="mt-3 text-[11px] text-stone-400 font-medium">
                            Minimum de commande : {menu.minGuests} personnes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Input
                    label="Préférences alimentaires & allergies"
                    placeholder="Ex: 5 repas sans gluten, sans porc, épicé modéré..."
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                  />
                </div>
              </Card>
            )}

            {/* Step 3: Equipment Rental Catalog (if enabled) */}
            {activeSection !== "CATERING" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#7c3c46]" /> 3. Matériel Événementiel en Location
                  </CardTitle>
                  <CardDescription>
                    Chaises Napoléon, tables rondes, bâches, couverts dorés et plats chauffants.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  {SEED_EQUIPMENT_ITEMS.map((item: any) => {
                    const qty = equipmentQuantities[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:border-stone-300 transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-3.5">
                          {item.imageUrl && (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-stone-900">{item.name}</span>
                              <Badge variant="default" className="text-[10px] uppercase">
                                {item.category}
                              </Badge>
                            </div>
                            <div className="text-xs text-stone-500 mt-1">
                              Tarif : <strong className="text-stone-800">{item.dailyRentalPriceXof.toLocaleString("fr-FR")} XOF</strong> / jour
                              <span className="mx-2">•</span>
                              Caution : <span className="text-amber-700">{item.depositPerUnitXof.toLocaleString("fr-FR")} XOF</span> / unité
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleEquipmentQtyChange(item.id, -5)}
                            className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center text-sm font-bold">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleEquipmentQtyChange(item.id, 5)}
                            className="w-8 h-8 rounded-lg bg-[#7c3c46] text-white flex items-center justify-center hover:bg-[#68353d]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Step 4: Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#7c3c46]" /> 4. Coordonnées du Demandeur
                </CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nom complet ou Raison Sociale"
                  placeholder="Mme / M. Dossou..."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
                <Input
                  label="Téléphone (WhatsApp de préférence)"
                  placeholder="+229 97 00 00 00"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                />
              </div>
            </Card>
          </div>

          {/* Right Column: Instant Quote Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="border-[#7c3c46]/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-stone-900">
                    Récapitulatif de l&apos;Estimation
                  </CardTitle>
                  <CardDescription>
                    Calcul transparent en temps réel
                  </CardDescription>
                </CardHeader>

                <div className="space-y-3 text-sm border-t border-stone-100 pt-4">
                  {activeSection !== "EQUIPMENT" && (
                    <div className="flex justify-between">
                      <span className="text-stone-600">
                        Traiteur ({guestCount} pers.) :
                      </span>
                      <span className="font-semibold text-stone-900">
                        {cateringSubtotal.toLocaleString("fr-FR")} XOF
                      </span>
                    </div>
                  )}

                  {activeSection !== "CATERING" && equipmentRentalTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-stone-600">Location matériel :</span>
                      <span className="font-semibold text-stone-900">
                        {equipmentRentalTotal.toLocaleString("fr-FR")} XOF
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-stone-600">Logistique / Service :</span>
                    <span className="font-semibold text-stone-900">
                      {deliveryFee.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>

                  <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-base text-stone-900">Total Prestation :</span>
                    <span className="font-black text-xl text-[#7c3c46]">
                      {grandTotal.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>

                  {equipmentCautionTotal > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mt-3">
                      <div className="font-semibold mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-600" /> Caution Matériel (Garantie) :
                      </div>
                      <div>
                        {equipmentCautionTotal.toLocaleString("fr-FR")} XOF (entièrement restituée lors de l&apos;état des lieux retour sans dégradation).
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-6">
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full shadow-md"
                    disabled={submitting}
                  >
                    {submitting ? "Traitement..." : "Envoyer la demande de devis"}
                  </Button>

                  {grandTotal > 0 && (
                    <KkiapayButton
                      amount={Math.round(grandTotal * 0.3)}
                      type={activeSection === "EQUIPMENT" ? "EQUIPMENT_RENTAL" : "CATERING_ORDER"}
                      referenceId={`DEV-TRT-${Date.now().toString().slice(-6)}`}
                      customerName={clientName || "Client Traiteur"}
                      customerPhone={clientPhone}
                      label={`Régler l'Acompte 30% KkiaPay (${Math.round(grandTotal * 0.3).toLocaleString("fr-FR")} XOF)`}
                      onSuccess={(tx) => {
                        alert(`Acompte KkiaPay validé avec succès ! Référence : ${tx.transactionId}`);
                      }}
                      className="w-full py-3"
                    />
                  )}
                </div>

                <p className="text-[11px] text-stone-400 text-center mt-3">
                  Paiement sécurisé par agrégateur KkiaPay (Mobile Money MTN / Moov / Celtiis et Carte Bancaire).
                </p>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
