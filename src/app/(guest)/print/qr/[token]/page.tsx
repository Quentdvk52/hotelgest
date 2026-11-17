"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Printer, Download, ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { qrService } from "@/modules/pos/qr-service";
import { SEED_PROPERTIES } from "@/lib/db/seed";

export default function StandPrintPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/pos/qr/${token}`);
        const json = await res.json();
        if (json.success) {
          setResource(json.data.resource);
          setProperty(json.data.property);
        } else {
          setError(json.error || "QR Code non reconnu");
        }
      } catch (err: any) {
        setError(err.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    if (!resource) return;
    const isTable = resource.resourceType === "TABLE";
    const locationName = isTable ? (resource.spaceName || "Restaurant") : (resource.roomName || "Chambre");
    const numberLabel = isTable ? (resource.tableNumber || "Table") : `Chambre ${resource.unitNumber || "101"}`;

    const svgContent = qrService.generateStandSvg({
      propertyName: property?.name || resource.propertyName || "Hôtel Le Vignoble",
      locationName,
      numberLabel,
      token: resource.token,
      phone: property?.phone || resource.propertyPhone,
      email: property?.email || resource.propertyEmail,
    });

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Chevalet-${numberLabel.replace(/\s+/g, "_")}-8x14cm.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-amber-200">Génération du chevalet 8 cm × 14 cm...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <p className="text-sm text-red-400 font-bold mb-4">{error || "Introuvable"}</p>
          <Link href="/dashboard?view=qrcodes" className="text-xs text-amber-300 underline">
            Retour au plan de site
          </Link>
        </div>
      </div>
    );
  }

  const isTable = resource.resourceType === "TABLE";
  const locationName = isTable ? (resource.spaceName || "Restaurant") : (resource.roomName || "Chambre");
  const numberLabel = isTable ? (resource.tableNumber || "Table") : `Chambre ${resource.unitNumber || "101"}`;
  const propertyName = property?.name || resource.propertyName || "Hôtel Le Vignoble";
  const propertyPhone = property?.phone || resource.propertyPhone || "+229 97 00 11 22";
  const propertyEmail = property?.email || resource.propertyEmail || "contact@hotel-levignoble.bj";

  return (
    <div className="min-h-screen bg-stone-950 text-white p-4 sm:p-8 flex flex-col items-center">
      {/* Top Action Bar (Hidden in print) */}
      <div className="no-print w-full max-w-xl mb-6 flex flex-wrap items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 p-3 rounded-2xl backdrop-blur">
        <Link
          href="/dashboard?view=qrcodes"
          className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white font-medium px-2 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Plan de site</span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={`/order/${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Tester menu</span>
          </a>

          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Télécharger SVG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 text-black text-xs font-bold hover:brightness-110 shadow-lg"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer (8×14 cm)</span>
          </button>
        </div>
      </div>

      {/* The Printable Stand (Exact 80mm x 140mm) */}
      <div
        id="stand-card-container"
        className="print-only-stand bg-[#fdfbf7] text-stone-900 rounded-[14px] shadow-2xl relative overflow-hidden flex flex-col justify-between"
        style={{
          width: "320px",
          height: "560px", // 8cm x 14cm proportion (ratio 8:14 = 0.5714)
          padding: "16px 14px",
          border: "4px solid #d4af37",
          boxSizing: "border-box",
        }}
      >
        {/* Inner concentric thin border */}
        <div className="absolute inset-1.5 rounded-[10px] border border-[#d4af37]/60 pointer-events-none" />

        {/* 1. Logo & Property Name */}
        <div className="text-center z-10 pt-1">
          {/* Official Royal Crest */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#7c3c46] to-[#4a151e] border-2 border-[#d4af37] flex items-center justify-center mx-auto mb-1.5 shadow-md">
            <span className="text-white font-serif font-black text-lg">V</span>
          </div>

          <h2 className="text-[12px] font-black font-serif uppercase tracking-[0.2em] text-[#181512] leading-tight">
            HÔTEL LE VIGNOBLE
          </h2>
          <p className="text-[11px] font-bold text-[#7c3c46] mt-0.5 leading-none">
            {propertyName}
          </p>
        </div>

        {/* 2. Emplacement & 3. Numéro */}
        <div className="text-center z-10 my-1">
          <div className="inline-block px-3 py-0.5 rounded-full bg-[#f4ede1] border border-[#d4af37]/60 text-[10px] font-bold text-[#5a3d12] uppercase tracking-wide">
            {locationName}
          </div>
          <div className="text-lg font-black text-[#181512] tracking-tight mt-0.5">
            {numberLabel}
          </div>
        </div>

        {/* 4. Grand Format QR Code au Milieu */}
        <div className="text-center z-10 flex flex-col items-center">
          <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-inner flex items-center justify-center">
            <div
              className="w-40 h-40 flex items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: qrService.generateQrSvg(resource.token, 160),
              }}
            />
          </div>
          <p className="text-[10px] font-extrabold text-[#181512] mt-1.5 uppercase tracking-wide">
            Scannez pour commander
          </p>
          <p className="text-[8.5px] text-stone-500 font-medium">
            Boissons fraîches • Cuisine &amp; Repas • Cave à Vin
          </p>
        </div>

        {/* 5. Contacts de l'Agence */}
        <div className="text-center z-10 pt-1 border-t border-stone-200/80 text-[8.5px] text-stone-600 leading-tight">
          <p className="font-bold text-stone-800">Réception &amp; Room-Service 24h/24</p>
          <p className="font-extrabold text-[#7c3c46] text-[9.5px] mt-0.5">
            Tél / WhatsApp : {propertyPhone}
          </p>
          <p className="text-stone-500 mt-0.5">{propertyEmail}</p>
        </div>

        {/* 6. Message en bas: "Merci pour votre Fidélité" */}
        <div className="text-center z-10 pb-0.5">
          <div className="py-1 px-3 rounded-full bg-gradient-to-r from-[#7c3c46] via-[#631c28] to-[#7c3c46] border border-[#d4af37]/80 shadow-sm">
            <span className="text-[10px] font-bold font-serif text-white tracking-wider italic">
              ✦ Merci pour votre Fidélité ✦
            </span>
          </div>
        </div>
      </div>

      {/* Global Print Media Query Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm 140mm;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only-stand {
            width: 80mm !important;
            height: 140mm !important;
            max-width: 80mm !important;
            max-height: 140mm !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
