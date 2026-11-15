"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  UtensilsCrossed,
  Package,
  Calendar,
  Truck,
  Users,
  CheckCircle,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import { SEED_EQUIPMENT_ITEMS } from "@/lib/db/seed";

export default function WorkspaceCateringPage() {
  const [activeTab, setActiveTab] = useState<"CATERING" | "RENTALS" | "STOCKS">("CATERING");

  const [cateringOrders, setCateringOrders] = useState([
    {
      id: "cat-001",
      orderNumber: "TRT-0001",
      clientName: "Ministère du Tourisme",
      phone: "+229 97 55 66 77",
      eventDate: "2026-12-15",
      serviceType: "PRESTATION_AVEC_PERSONNEL",
      guestCount: 50,
      menuName: "Buffet Prestige Béninois",
      totalAmountXof: 615000,
      status: "CONFIRMEE",
      assignedStaff: "Chantal Tossou + 2 serveurs",
      assignedVehicle: "Fourgonnette Isuzu BJ-4567-RB",
    },
    {
      id: "cat-002",
      orderNumber: "TRT-0002",
      clientName: "Entreprise SOGEA",
      phone: "+229 97 88 99 00",
      eventDate: "2026-12-18",
      serviceType: "LIVRAISON",
      guestCount: 25,
      menuName: "Cocktail Dînatoire Le Vignoble",
      totalAmountXof: 222500,
      status: "DEMANDE_RECUE",
      assignedStaff: "À assigner",
      assignedVehicle: "À assigner",
    },
  ]);

  const [rentals, setRentals] = useState([
    {
      id: "rent-001",
      rentalNumber: "LOC-0001",
      clientName: "Mariage Famille Dossou",
      phone: "+229 97 12 00 00",
      dates: "20/12/2026 au 22/12/2026",
      location: "Jardin des Fêtes, Bohicon",
      itemsSummary: "250x Chaises Napoléon VIP",
      rentalTotalXof: 525000,
      totalDepositXof: 500000, // Caution
      depositRetainedXof: 0,
      status: "RESERVED",
    },
    {
      id: "rent-002",
      rentalNumber: "LOC-0002",
      clientName: "Gala d'Excellence",
      phone: "+229 97 99 88 77",
      dates: "25/12/2026 au 26/12/2026",
      location: "Esplanade Le Vignoble",
      itemsSummary: "10x Tables Rondes, 100x Couverts Dorés",
      rentalTotalXof: 90000,
      totalDepositXof: 200000,
      depositRetainedXof: 45000,
      status: "RETURNED_DAMAGED",
    },
  ]);

  // Inspection modal state
  const [selectedRentalForInspection, setSelectedRentalForInspection] = useState<any>(null);
  const [inspectionType, setInspectionType] = useState<"DEPART" | "RETOUR">("DEPART");
  const [damagedCount, setDamagedCount] = useState(0);
  const [lostCount, setLostCount] = useState(0);
  const [damageFee, setDamageFee] = useState(0);
  const [comments, setComments] = useState("");

  const handleOpenInspection = (rental: any, type: "DEPART" | "RETOUR") => {
    setSelectedRentalForInspection(rental);
    setInspectionType(type);
    setDamagedCount(0);
    setLostCount(0);
    setDamageFee(0);
    setComments("");
  };

  const handleSaveInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalForInspection) return;

    if (inspectionType === "DEPART") {
      setRentals((prev) =>
        prev.map((r) =>
          r.id === selectedRentalForInspection.id ? { ...r, status: "DISPATCHED" } : r
        )
      );
      alert(`État des lieux départ validé pour ${selectedRentalForInspection.rentalNumber}. Matériel expédié.`);
    } else {
      const isDamaged = damagedCount > 0 || lostCount > 0 || damageFee > 0;
      setRentals((prev) =>
        prev.map((r) =>
          r.id === selectedRentalForInspection.id
            ? {
                ...r,
                status: isDamaged ? "RETURNED_DAMAGED" : "RETURNED_COMPLETE",
                depositRetainedXof: damageFee,
              }
            : r
        )
      );
      alert(
        `État des lieux retour validé. Retenue sur caution : ${damageFee.toLocaleString(
          "fr-FR"
        )} XOF. Caution restituée : ${(
          selectedRentalForInspection.totalDepositXof - damageFee
        ).toLocaleString("fr-FR")} XOF.`
      );
    }

    setSelectedRentalForInspection(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Service Traiteur & Matériel Événementiel
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Suivi des manifestations, plannings de préparation, états des lieux et gestion des cautions.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 bg-stone-200/60 p-1 rounded-xl">
          <Button
            variant={activeTab === "CATERING" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("CATERING")}
            className="gap-1.5"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" /> Commandes Traiteur ({cateringOrders.length})
          </Button>
          <Button
            variant={activeTab === "RENTALS" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("RENTALS")}
            className="gap-1.5"
          >
            <Package className="w-3.5 h-3.5" /> Locations Matériel ({rentals.length})
          </Button>
          <Button
            variant={activeTab === "STOCKS" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("STOCKS")}
            className="gap-1.5"
          >
            <ClipboardCheck className="w-3.5 h-3.5" /> Stocks Site
          </Button>
        </div>
      </div>

      {/* Tab 1: Traiteur Orders */}
      {activeTab === "CATERING" && (
        <div className="space-y-4">
          {cateringOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-stone-900 text-lg">{order.orderNumber}</span>
                    <Badge variant={order.status === "CONFIRMEE" ? "success" : "warning"}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-stone-800 mt-1">
                    Client : {order.clientName} ({order.phone})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-[#7c3c46]">
                    {order.totalAmountXof.toLocaleString("fr-FR")} XOF
                  </div>
                  <div className="text-xs text-stone-500">
                    {order.guestCount} personnes • {order.serviceType}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs mb-4">
                <div>
                  <span className="text-stone-500 block">Date de l&apos;événement :</span>
                  <strong className="text-stone-800">{order.eventDate}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Personnel affecté :</span>
                  <strong className="text-stone-800">{order.assignedStaff}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Véhicule logistique :</span>
                  <strong className="text-stone-800">{order.assignedVehicle}</strong>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm">
                  Modifier Personnel / Véhicule
                </Button>
                <Button variant="primary" size="sm">
                  Générer Devis PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Equipment Rentals */}
      {activeTab === "RENTALS" && (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <Card key={rental.id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-stone-900 text-lg">{rental.rentalNumber}</span>
                    <Badge
                      variant={
                        rental.status === "RESERVED"
                          ? "info"
                          : rental.status === "DISPATCHED"
                          ? "warning"
                          : rental.status === "RETURNED_COMPLETE"
                          ? "success"
                          : "danger"
                      }
                    >
                      {rental.status}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-stone-800 mt-1">
                    Client : {rental.clientName} ({rental.phone})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-stone-900">
                    Location : {rental.rentalTotalXof.toLocaleString("fr-FR")} XOF
                  </div>
                  <div className="text-xs text-amber-700 font-semibold">
                    Caution : {rental.totalDepositXof.toLocaleString("fr-FR")} XOF
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1 mb-4">
                <div><strong>Période :</strong> {rental.dates}</div>
                <div><strong>Lieu :</strong> {rental.location}</div>
                <div><strong>Matériel réservé :</strong> {rental.itemsSummary}</div>
                {rental.depositRetainedXof > 0 && (
                  <div className="text-red-600 font-bold mt-2">
                    ⚠️ Retenue sur caution pour casse / perte : {rental.depositRetainedXof.toLocaleString("fr-FR")} XOF
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                {rental.status === "RESERVED" && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleOpenInspection(rental, "DEPART")}
                  >
                    <ClipboardCheck className="w-4 h-4" /> État des lieux Départ (Remise)
                  </Button>
                )}
                {rental.status === "DISPATCHED" && (
                  <Button
                    variant="gold"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleOpenInspection(rental, "RETOUR")}
                  >
                    <ClipboardCheck className="w-4 h-4" /> État des lieux Retour (Récupération)
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 3: Equipment Inventory */}
      {activeTab === "STOCKS" && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Inventaire Matériel Disponible sur Site</CardTitle>
            <CardDescription>
              Stocks physiques et tarifs journaliers pour Hôtel Le Vignoble - Bohicon.
            </CardDescription>
          </CardHeader>

          <div className="divide-y divide-stone-200">
            {SEED_EQUIPMENT_ITEMS.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">{item.name}</div>
                  <div className="text-xs text-stone-500">
                    Catégorie : {item.category} • Remplacement en cas de perte : {item.replacementCostXof.toLocaleString("fr-FR")} XOF
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-[#7c3c46]">
                    {item.totalStock} en stock
                  </div>
                  <div className="text-xs text-stone-500">
                    {item.dailyRentalPriceXof.toLocaleString("fr-FR")} XOF / jour
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Inspection Modal */}
      {selectedRentalForInspection && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              État des Lieux : {inspectionType === "DEPART" ? "Départ (Remise)" : "Retour (Récupération)"}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Dossier : {selectedRentalForInspection.rentalNumber} — {selectedRentalForInspection.clientName}
            </p>

            <form onSubmit={handleSaveInspection} className="space-y-4">
              {inspectionType === "RETOUR" && (
                <div className="space-y-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-xs font-bold text-amber-900 mb-2">
                    Contrôle des dégradations & pertes :
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Éléments endommagés"
                      type="number"
                      min={0}
                      value={damagedCount}
                      onChange={(e) => setDamagedCount(parseInt(e.target.value, 10) || 0)}
                    />
                    <Input
                      label="Éléments manquants / perdus"
                      type="number"
                      min={0}
                      value={lostCount}
                      onChange={(e) => setLostCount(parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                  <Input
                    label="Frais évalués à retenir sur la caution (XOF)"
                    type="number"
                    min={0}
                    value={damageFee}
                    onChange={(e) => setDamageFee(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              )}

              <Input
                label="Observations & Commentaires"
                placeholder="Ex: Matériel compté et vérifié en présence du client..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedRentalForInspection(null)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Valider l&apos;état des lieux
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
