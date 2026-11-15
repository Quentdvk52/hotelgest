"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle,
  TrendingUp,
  PieChart,
} from "lucide-react";

export default function ReportsSyscohadaPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadCsv = () => {
    setDownloading(true);
    window.location.href = "/api/accounting/export?propertyId=prop-bohicon-001&format=csv";
    setTimeout(() => setDownloading(false), 1500);
  };

  const syscohadaSample = [
    {
      date: "2026-12-01",
      journal: "BQ",
      account: "531",
      label: "Mobile Money (MTN MoMo)",
      piece: "FOL-001",
      debit: 35000,
      credit: 0,
    },
    {
      date: "2026-12-01",
      journal: "VT",
      account: "7061",
      label: "Prestations hébergement (Ch. 101)",
      piece: "FOL-001",
      debit: 0,
      credit: 35000,
    },
    {
      date: "2026-12-01",
      journal: "BQ",
      account: "521",
      label: "Banques locales Bénin (Virement)",
      piece: "TRT-001",
      debit: 150000,
      credit: 0,
    },
    {
      date: "2026-12-01",
      journal: "VT",
      account: "7064",
      label: "Prestations traiteur & matériel",
      piece: "TRT-001",
      debit: 0,
      credit: 150000,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Rapports & Exports SYSCOHADA</h1>
          <p className="text-xs text-stone-500 mt-1">
            Sous-livre opérationnel et écritures équilibrées prêtes pour le cabinet comptable au Bénin.
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          className="gap-2 shadow-sm font-bold"
          onClick={handleDownloadCsv}
          disabled={downloading}
        >
          <Download className="w-4 h-4" />
          {downloading ? "Génération du CSV..." : "Télécharger Journal SYSCOHADA (CSV)"}
        </Button>
      </div>

      {/* SYSCOHADA Journal Preview */}
      <Card className="p-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Journal des Ventes & Règlements (SYSCOHADA Révisé)</CardTitle>
              <CardDescription>
                Comptes de Classe 7 (Produits) et Classe 5 (Trésorerie) équilibrés au Franc CFA.
              </CardDescription>
            </div>
            <Badge variant="success">Équilibre Débit = Crédit Garanti</Badge>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase font-semibold tracking-wider">
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Jrn</th>
                <th className="py-3 px-2">Compte</th>
                <th className="py-3 px-2">Libellé de l&apos;Écriture</th>
                <th className="py-3 px-2">Pièce</th>
                <th className="py-3 px-2 text-right">Débit (XOF)</th>
                <th className="py-3 px-2 text-right">Crédit (XOF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {syscohadaSample.map((row, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3 px-2 font-sans">{row.date}</td>
                  <td className="py-3 px-2 font-bold text-[#7c3c46]">{row.journal}</td>
                  <td className="py-3 px-2 font-bold text-stone-900">{row.account}</td>
                  <td className="py-3 px-2 font-sans text-stone-700">{row.label}</td>
                  <td className="py-3 px-2 text-stone-500">{row.piece}</td>
                  <td className="py-3 px-2 text-right font-bold text-stone-900">
                    {row.debit > 0 ? row.debit.toLocaleString("fr-FR") : "-"}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-[#7c3c46]">
                    {row.credit > 0 ? row.credit.toLocaleString("fr-FR") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-900 font-bold text-sm bg-stone-50">
                <td colSpan={5} className="py-3 px-2 font-sans">
                  Totaux Généraux Équilibrés :
                </td>
                <td className="py-3 px-2 text-right font-mono text-stone-900">185 000 XOF</td>
                <td className="py-3 px-2 text-right font-mono text-[#7c3c46]">185 000 XOF</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
