"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Moon,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

export default function NightAuditPage() {
  const [auditDate, setAuditDate] = useState("2026-12-01");
  const [running, setRunning] = useState(false);
  const [closureCompleted, setClosureCompleted] = useState(false);

  const preflightChecks = [
    {
      title: "Contrôle des Séjours Actifs",
      desc: "2 chambres occupées ce soir. Imputation des nuitées prête.",
      status: "PASS",
    },
    {
      title: "Contrôle des Commandes KDS Restaurant / Bar",
      desc: "Toutes les commandes du jour sont complétées et réglées.",
      status: "PASS",
    },
    {
      title: "Contrôle des Sessions de Caisse",
      desc: "Session de caisse principale équilibrée et clôturée.",
      status: "PASS",
    },
    {
      title: "Équilibre du Journal Comptable SYSCOHADA",
      desc: "Débit = Crédit (Total : 185 000 XOF). Aucune écriture orpheline.",
      status: "PASS",
    },
  ];

  const handleExecuteAudit = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setClosureCompleted(true);
      alert(`Night Audit validé avec succès pour le ${auditDate} ! La journée comptable est maintenant verrouillée.`);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Night Audit & Clôture Journalière
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Vérification de cohérence, imputation automatique des nuitées et verrouillage comptable par site.
          </p>
        </div>

        <Badge variant={closureCompleted ? "success" : "gold"}>
          {closureCompleted ? "Journée Verrouillée" : "Prêt pour Clôture"}
        </Badge>
      </div>

      {/* Date selector & preflight status */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Moon className="w-5 h-5 text-[#7c3c46]" /> Précontrôles d&apos;Intégrité (Preflight)
          </CardTitle>
          <CardDescription>
            Tous les indicateurs doivent être au vert avant de procéder au verrouillage de la date comptable.
          </CardDescription>
        </CardHeader>

        <div className="space-y-3 mb-6">
          {preflightChecks.map((chk, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start justify-between text-xs">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-sm">{chk.title}</div>
                  <div className="text-stone-500 mt-0.5">{chk.desc}</div>
                </div>
              </div>
              <Badge variant="success">Conforme</Badge>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-[#faf5f5] border border-[#7c3c46]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-stone-900 text-sm">Prêt pour l&apos;exécution du Night Audit</div>
            <div className="text-xs text-stone-600 mt-0.5">
              Date comptable cible : <strong>{auditDate}</strong> • Site : Hôtel Le Vignoble - Bohicon
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="gap-2 font-bold shadow-md"
            disabled={running || closureCompleted}
            onClick={handleExecuteAudit}
          >
            {running ? "Vérification en cours..." : closureCompleted ? "Journée Déjà Clôturée" : "Exécuter le Night Audit & Verrouiller"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
