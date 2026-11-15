"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, CheckCircle, XCircle, Clock } from "lucide-react";
import { SEED_USERS } from "@/lib/db/seed";

export default function GovernanceDiscountsPage() {
  const [requests, setRequests] = useState([
    {
      id: "disc-001",
      target: "FOLIO:fol-001 (Chambre 101)",
      client: "M. Dossou Mathieu",
      discountType: "PERCENT",
      discountValue: 15,
      reason: "Geste commercial suite panne climatisation temporaire",
      requester: "Gaston Dossou (Réceptionniste)",
      status: "PENDING",
      createdAt: "Il y a 30 min",
    },
    {
      id: "disc-002",
      target: "CATERING:TRT-0001 (Buffet 50 pers.)",
      client: "Ministère du Tourisme",
      discountType: "PERCENT",
      discountValue: 10,
      reason: "Partenariat institutionnel récurrent",
      requester: "Aimée Hounsinou (Directeur de Site)",
      status: "APPROVED",
      createdAt: "Hier",
    },
  ]);

  const handleReview = (id: string, decision: "APPROVED" | "REJECTED") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: decision } : r))
    );
    alert(`Demande de remise ${decision === "APPROVED" ? "VALIDÉE" : "REFUSÉE"} avec succès.`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Circuit d&apos;Approbation des Remises</h1>
          <p className="text-xs text-stone-500 mt-1">
            Gouvernance stricte : vérification des seuils par rôle et traçabilité des gestes commerciaux.
          </p>
        </div>
      </div>

      {/* Threshold Matrix Card */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" /> Plafonds d&apos;Approbation Autorisés par Rôle
          </CardTitle>
          <CardDescription>
            Aucun employé ne peut approuver au-delà de son plafond configuré.
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 uppercase font-bold block mb-1">Promoteur (Groupe)</span>
            <div className="text-xl font-black text-emerald-600">Jusqu&apos;à 100%</div>
            <div className="text-[11px] text-stone-400 mt-1">Autorité suprême sur tous sites</div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 uppercase font-bold block mb-1">Directeur de Site</span>
            <div className="text-xl font-black text-stone-800">Jusqu&apos;à 25%</div>
            <div className="text-[11px] text-stone-400 mt-1">Sur son établissement actif uniquement</div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 uppercase font-bold block mb-1">Réceptionniste</span>
            <div className="text-xl font-black text-stone-800">Jusqu&apos;à 5%</div>
            <div className="text-[11px] text-stone-400 mt-1">Au-delà : approbation obligatoire</div>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-900">Demandes de Remise Récentes</h3>

        {requests.map((req) => (
          <Card key={req.id} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-stone-900">{req.client}</span>
                  <Badge variant={req.status === "PENDING" ? "warning" : req.status === "APPROVED" ? "success" : "danger"}>
                    {req.status}
                  </Badge>
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  Cible : <strong>{req.target}</strong> • Demandeur : {req.requester}
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-[#7c3c46]">{req.discountValue}%</span>
                <span className="text-xs text-stone-500 block">Remise demandée</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 mb-4">
              <strong>Motif justifié :</strong> &ldquo;{req.reason}&rdquo;
            </div>

            {req.status === "PENDING" && (
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-red-600 hover:bg-red-50"
                  onClick={() => handleReview(req.id, "REJECTED")}
                >
                  <XCircle className="w-4 h-4" /> Refuser
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleReview(req.id, "APPROVED")}
                >
                  <CheckCircle className="w-4 h-4" /> Approuver la remise
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
