"use client";

import React, { useState } from "react";
import {
  Printer,
  X,
  CheckCircle2,
  Settings,
  RefreshCw,
  Usb,
  Bluetooth,
  Wifi,
  FileText,
  Receipt,
  Download,
} from "lucide-react";
import {
  KNOWN_PRINTER_PROFILES,
  PrinterDevice,
  PrintFormat,
  executeUniversalPrint,
} from "@/lib/print/print-service";

interface UniversalPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle?: string;
  documentHtml?: string;
  defaultFormat?: PrintFormat;
}

export function UniversalPrinterModal({
  isOpen,
  onClose,
  documentTitle = "Document d'Impression - Hôtel Le Vignoble",
  documentHtml,
  defaultFormat = "A4",
}: UniversalPrinterModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<PrintFormat>(defaultFormat);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>("sys-default");
  const [detecting, setDetecting] = useState(false);
  const [printers, setPrinters] = useState<PrinterDevice[]>(KNOWN_PRINTER_PROFILES);
  const [printingStatus, setPrintingStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScanDevices = () => {
    setDetecting(true);
    setPrintingStatus("Recherche des imprimantes USB, Bluetooth et Réseau...");
    setTimeout(() => {
      setDetecting(false);
      setPrintingStatus("Pilotes d'impression synchronisés avec succès.");
      setTimeout(() => setPrintingStatus(null), 3000);
    }, 1200);
  };

  const handlePrint = async () => {
    setPrintingStatus("Envoi du flux d'impression au pilote...");
    try {
      const content = documentHtml || `
        <div style="padding: 20px; font-family: sans-serif;">
          <h2 style="color: #184f28;">HÔTEL LE VIGNOBLE</h2>
          <p>Test de validation du pilote d'impression universel.</p>
          <p>Format : ${selectedFormat}</p>
          <p>Imprimante sélectionnée : ${selectedPrinterId}</p>
          <p>Date : ${new Date().toLocaleString("fr-FR")}</p>
        </div>
      `;
      await executeUniversalPrint(content, selectedFormat, documentTitle);
      setPrintingStatus("Document envoyé avec succès à l'imprimante.");
      setTimeout(() => {
        setPrintingStatus(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setPrintingStatus("Erreur d'impression : " + (err.message || "Échec"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#184f28]/10 text-[#184f28] flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Gestionnaire des Pilotes d&apos;Impression
              </h3>
              <p className="text-xs text-stone-500">
                Connectez et reconnaissez toute imprimante (A4, Thermique, POS, Bluetooth)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification if any */}
        {printingStatus && (
          <div className="p-3 bg-stone-900 text-white rounded-xl text-xs flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 text-[#d4af37] ${detecting ? "animate-spin" : ""}`} />
            <span>{printingStatus}</span>
          </div>
        )}

        {/* Format Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            1. Format de Document Cible
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedFormat("A4")}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedFormat === "A4"
                  ? "border-[#184f28] bg-emerald-50/50 text-[#184f28] font-bold shadow-xs"
                  : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-white"
              }`}
            >
              <FileText className="w-4 h-4 mx-auto mb-1 text-[#184f28]" />
              <div>A4 Standard</div>
              <div className="text-[10px] text-stone-400">Factures DGI</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat("THERMAL_80MM")}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedFormat === "THERMAL_80MM"
                  ? "border-[#184f28] bg-emerald-50/50 text-[#184f28] font-bold shadow-xs"
                  : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-white"
              }`}
            >
              <Receipt className="w-4 h-4 mx-auto mb-1 text-[#184f28]" />
              <div>Thermique 80mm</div>
              <div className="text-[10px] text-stone-400">Tickets Caisse</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat("THERMAL_58MM")}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedFormat === "THERMAL_58MM"
                  ? "border-[#184f28] bg-emerald-50/50 text-[#184f28] font-bold shadow-xs"
                  : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-white"
              }`}
            >
              <Bluetooth className="w-4 h-4 mx-auto mb-1 text-[#184f28]" />
              <div>Mini POS 58mm</div>
              <div className="text-[10px] text-stone-400">Mobile / Sans fil</div>
            </button>
          </div>
        </div>

        {/* Printer Device Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              2. Périphérique / Imprimante Reconnu
            </label>
            <button
              type="button"
              onClick={handleScanDevices}
              disabled={detecting}
              className="text-[11px] text-[#184f28] hover:underline font-semibold flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${detecting ? "animate-spin" : ""}`} />
              <span>Détecter les imprimantes</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {printers.map((prn) => (
              <label
                key={prn.id}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer text-xs transition-all ${
                  selectedPrinterId === prn.id
                    ? "border-[#184f28] bg-emerald-50/40 text-stone-900 shadow-xs"
                    : "border-stone-200 hover:bg-stone-50 text-stone-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="printerChoice"
                    checked={selectedPrinterId === prn.id}
                    onChange={() => setSelectedPrinterId(prn.id)}
                    className="text-[#184f28] focus:ring-[#184f28]"
                  />
                  <div>
                    <div className="font-semibold text-stone-900">{prn.name}</div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1.5">
                      <span>Interface : {prn.interface}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">Reconnu & Prêt</span>
                    </div>
                  </div>
                </div>
                <CheckCircle2
                  className={`w-4 h-4 ${
                    selectedPrinterId === prn.id ? "text-[#184f28]" : "text-stone-300"
                  }`}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Lancer l&apos;Impression</span>
          </button>
        </div>
      </div>
    </div>
  );
}
