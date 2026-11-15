"use client";

import React, { useState } from "react";
import { SEED_UNITS, SEED_ROOM_TYPES } from "@/lib/db/seed";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Hotel,
  UserPlus,
  LogIn,
  LogOut,
  Bed,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function ReceptionPmsPage() {
  const [units, setUnits] = useState(
    SEED_UNITS.map((u, i) => ({
      ...u,
      status: i === 0 || i === 3 ? "OCCUPIED" : "AVAILABLE",
      guestName: i === 0 ? "M. Dossou Mathieu" : i === 3 ? "Mme Touré Awa" : undefined,
      checkInDate: "2026-12-01",
      checkOutDate: "2026-12-05",
      folioId: i === 0 ? "fol-001" : i === 3 ? "fol-002" : undefined,
    }))
  );

  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const handleOpenCheckIn = (unit: any) => {
    setSelectedUnit(unit);
    setShowCheckInModal(true);
  };

  const handlePerformCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !guestName) return;

    setUnits((prev) =>
      prev.map((u) =>
        u.id === selectedUnit.id
          ? {
              ...u,
              status: "OCCUPIED",
              guestName,
              folioId: `fol-${Date.now().toString().slice(-4)}`,
            }
          : u
      )
    );

    setShowCheckInModal(false);
    setGuestName("");
    setGuestPhone("");
    alert(`Check-in réussi ! Folio ouvert pour ${guestName} en chambre ${selectedUnit.unitNumber}.`);
  };

  const handlePerformCheckOut = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;

    if (confirm(`Confirmer le départ (check-out) pour la chambre ${unit.unitNumber} (${unit.guestName}) ?`)) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === unitId
            ? {
                ...u,
                status: "AVAILABLE",
                housekeepingStatus: "DIRTY",
                guestName: undefined,
                folioId: undefined,
              }
            : u
        )
      );
      alert(`Check-out validé pour la chambre ${unit.unitNumber}. La chambre est marquée À NETTOYER pour le Housekeeping.`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Réception & Gestion des Chambres</h1>
          <p className="text-xs text-stone-500 mt-1">
            Attribution des unités, accueil des voyageurs, check-in, check-out et état du ménage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">2 Occupées</Badge>
          <Badge variant="default">4 Disponibles</Badge>
        </div>
      </div>

      {/* Room Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => {
          const roomType = SEED_ROOM_TYPES.find((rt) => rt.id === unit.roomTypeId);
          const isOccupied = unit.status === "OCCUPIED";

          return (
            <Card
              key={unit.id}
              className={`p-6 border-2 transition-all ${
                isOccupied
                  ? "border-[#7c3c46]/30 bg-gradient-to-br from-white to-[#faf5f5]"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-2xl font-black text-stone-900">Chambre {unit.unitNumber}</span>
                  <div className="text-xs font-semibold text-stone-500 mt-0.5">
                    Étage {unit.floor} • {roomType?.name}
                  </div>
                </div>
                <Badge variant={isOccupied ? "danger" : "success"}>
                  {isOccupied ? "Occupée" : "Disponible"}
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 mb-6 text-xs space-y-2">
                {isOccupied ? (
                  <>
                    <div className="flex justify-between font-semibold">
                      <span className="text-stone-500">Client :</span>
                      <span className="text-stone-900">{unit.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Folio actif :</span>
                      <span className="font-mono text-[#7c3c46] font-bold">{unit.folioId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Séjour :</span>
                      <span>Jusqu&apos;au {unit.checkOutDate}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Tarif standard :</span>
                      <span className="font-bold text-stone-800">
                        {roomType?.basePriceXof.toLocaleString("fr-FR")} XOF / nuit
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Housekeeping :</span>
                      <span className="text-emerald-700 font-semibold">Propre & Inspectée</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {isOccupied ? (
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => handlePerformCheckOut(unit.id)}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Check-out & Facture
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => handleOpenCheckIn(unit)}
                  >
                    <LogIn className="w-3.5 h-3.5" /> Enregistrer Arrivée (Check-in)
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Check-in — Chambre {selectedUnit.unitNumber}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Saisissez les informations du voyageur pour ouvrir son séjour et son folio.
            </p>

            <form onSubmit={handlePerformCheckIn} className="space-y-4">
              <Input
                label="Nom complet du voyageur"
                placeholder="Ex: M. Jean Agossou"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />

              <Input
                label="Téléphone"
                placeholder="+229 97 00 00 00"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
              />

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCheckInModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Confirmer l&apos;arrivée
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
