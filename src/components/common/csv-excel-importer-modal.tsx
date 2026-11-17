"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Layers,
  Sparkles,
  RefreshCw,
  Info,
} from "lucide-react";
import { SEED_PROPERTIES } from "@/lib/db/seed";

export type ImportType =
  | "CLIENTS"
  | "WINES"
  | "MEALS"
  | "ROOMS"
  | "RENTALS"
  | "CATERING"
  | "STOCKS";

interface CsvExcelImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  importType: ImportType;
  onImport: (items: any[]) => void;
  defaultPropertyId?: string;
}

interface TemplateConfig {
  title: string;
  subtitle: string;
  badge: string;
  filename: string;
  requiredFields: string[];
  columns: { key: string; label: string; example: any; description: string }[];
}

const TEMPLATE_CONFIGS: Record<ImportType, TemplateConfig> = {
  CLIENTS: {
    title: "Importation du Fichier Clients",
    subtitle: "Chargez vos clients, entreprises partenaires, délégations et habitués par lot.",
    badge: "Fichier Clients",
    filename: "modele_clients_hotelgest",
    requiredFields: ["Nom_Complet", "Telephone"],
    columns: [
      { key: "Nom_Complet", label: "Nom_Complet", example: "Société Civile Immobilière Danxomè", description: "Nom complet du client ou raison sociale" },
      { key: "Categorie", label: "Categorie", example: "CORPORATE", description: "PARTICULIER, VIP_PRESTIGE, CORPORATE, DELEGATION, TOUR_OPERATOR, HABITUE" },
      { key: "Telephone", label: "Telephone", example: "+229 97 01 02 03", description: "Numéro de téléphone ou WhatsApp" },
      { key: "Email", label: "Email", example: "direction@danxome.bj", description: "Adresse e-mail valide" },
      { key: "Site", label: "Site", example: "Bohicon", description: "Bohicon, Abomey, Abomey-Calavi ou Zogbodomey" },
      { key: "Ville", label: "Ville", example: "Bohicon", description: "Ville de résidence ou siège" },
      { key: "IFU", label: "IFU", example: "3202412345678", description: "Numéro IFU (Bénin) pour normalisation fiscale" },
      { key: "RCCM", label: "RCCM", example: "RB/COT/24 B 1234", description: "Numéro RCCM si entreprise" },
      { key: "Preferences", label: "Preferences", example: "Table terrasse piscine, vin Saint-Émilion", description: "Préférences particulières" },
      { key: "Total_Depenses_XOF", label: "Total_Depenses_XOF", example: 1250000, description: "Historique de chiffre d'affaires (chiffre)" },
      { key: "Statut", label: "Statut", example: "ACTIF", description: "ACTIF, VIP, PROSPECT, ARCHIVE" },
    ],
  },
  WINES: {
    title: "Importation Cave à Vin & Spiritueux",
    subtitle: "Importez en masse vos vins, champagnes, spiritueux et grands crus.",
    badge: "Cave & Vins",
    filename: "modele_cave_vins_hotelgest",
    requiredFields: ["Nom", "Prix_XOF"],
    columns: [
      { key: "Nom", label: "Nom", example: "Château Margaux Grand Cru", description: "Nom commercial complet de la bouteille" },
      { key: "Categorie", label: "Categorie", example: "ROUGE", description: "ROUGE, BLANC, ROSE, CHAMPAGNE, LIQUEUR_DIGESTIF, BIERE_BAR" },
      { key: "Origine", label: "Origine", example: "Bordeaux / France", description: "Région viticole ou pays d'origine" },
      { key: "Millesime", label: "Millesime", example: "2018", description: "Année du millésime" },
      { key: "Prix_XOF", label: "Prix_XOF", example: 185000, description: "Prix de vente unitaire en XOF" },
      { key: "Stock_Bouteilles", label: "Stock_Bouteilles", example: 24, description: "Nombre de bouteilles en cave" },
      { key: "Seuil_Alerte", label: "Seuil_Alerte", example: 6, description: "Seuil d'alerte de réapprovisionnement" },
      { key: "Accords_Mets", label: "Accords_Mets", example: "Viandes braisées, fromages affinés", description: "Conseils d'accords mets & vins" },
      { key: "Photo_URL", label: "Photo_URL", example: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80", description: "Lien de la photo du produit" },
    ],
  },
  MEALS: {
    title: "Importation Carte & Plats Restaurant",
    subtitle: "Chargez vos spécialités béninoises, grillades et plats gastronomiques.",
    badge: "Restauration",
    filename: "modele_plats_restaurant_hotelgest",
    requiredFields: ["Nom", "Prix_XOF"],
    columns: [
      { key: "Nom", label: "Nom", example: "Pintade Royale Braisée au Feu de Bois", description: "Nom complet du plat gastronomique" },
      { key: "Categorie", label: "Categorie", example: "GRILLADES", description: "PLAT_TRADITIONNEL, GRILLADES, POISSONS_CRUSTACES, ACCOMPAGNEMENTS, DESSERTS" },
      { key: "Prix_XOF", label: "Prix_XOF", example: 8500, description: "Prix de vente en XOF" },
      { key: "Temps_Prep_Minutes", label: "Temps_Prep_Minutes", example: 25, description: "Temps de préparation en cuisine en minutes" },
      { key: "Accompagnements", label: "Accompagnements", example: "Alloco, Amiwo, Piment vert frais", description: "Accompagnements inclus séparés par des virgules" },
      { key: "Description", label: "Description", example: "Marinée aux épices secrètes du Danxomè, servie bien chaude", description: "Description savoureuse pour le menu" },
      { key: "Photo_URL", label: "Photo_URL", example: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80", description: "Photo haute qualité du mets" },
    ],
  },
  ROOMS: {
    title: "Importation Chambres & Suites",
    subtitle: "Ajoutez ou mettez à jour les chambres d'hôtel de vos établissements.",
    badge: "Hébergement",
    filename: "modele_chambres_hotelgest",
    requiredFields: ["Numero", "Nom", "Prix_Nuit_XOF"],
    columns: [
      { key: "Numero", label: "Numero", example: "205", description: "Numéro de porte de la chambre" },
      { key: "Nom", label: "Nom", example: "Suite Exécutive Balcon", description: "Nom de baptême de la suite" },
      { key: "Site", label: "Site", example: "Bohicon", description: "Bohicon, Abomey, Abomey-Calavi, Zogbodomey" },
      { key: "Type", label: "Type", example: "SUPERIEURE", description: "STANDARD, SUPERIEURE, SUITE_ROYALE, PAVILLON_FAMILIAL" },
      { key: "Prix_Nuit_XOF", label: "Prix_Nuit_XOF", example: 45000, description: "Tarif de base de la nuitée en XOF" },
      { key: "Capacite", label: "Capacite", example: 2, description: "Nombre maximum d'occupants" },
      { key: "Equipements", label: "Equipements", example: "Climatisation, Wi-Fi HD, Téléviseur 4K, Minibar, Balcon", description: "Équipements inclus" },
      { key: "Statut", label: "Statut", example: "DISPONIBLE", description: "DISPONIBLE, OCCUPEE, MAINTENANCE" },
      { key: "Photo_URL", label: "Photo_URL", example: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", description: "Photo de la chambre" },
    ],
  },
  RENTALS: {
    title: "Importation Location Matériel & Véhicules",
    subtitle: "Chargez vos voitures VIP, salles de fêtes, chapiteaux et matériel événementiel.",
    badge: "Location Événements",
    filename: "modele_materiel_location_hotelgest",
    requiredFields: ["Nom", "Prix_Jour_XOF"],
    columns: [
      { key: "Nom", label: "Nom", example: "Toyota Prado TXL VIP Climatisation Intégrale", description: "Désignation de l'équipement ou de la salle" },
      { key: "Type", label: "Type", example: "VOITURES", description: "VOITURES, SALLE_FETES, SALLE_REUNION, SALLE_ATELIER, CHAISES_TABLES, CHAFING_DISH, BACHES_HANGARS" },
      { key: "Prix_Jour_XOF", label: "Prix_Jour_XOF", example: 85000, description: "Tarif de location journalier en XOF" },
      { key: "Caution_XOF", label: "Caution_XOF", example: 100000, description: "Montant du dépôt de garantie en XOF" },
      { key: "Quantite_Totale", label: "Quantite_Totale", example: 2, description: "Quantité en parc" },
      { key: "Caracteristiques", label: "Caracteristiques", example: "Chauffeur professionnel inclus, carburant à la charge du client", description: "Spécifications techniques" },
      { key: "Photo_URL", label: "Photo_URL", example: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", description: "Photo de l'équipement" },
    ],
  },
  CATERING: {
    title: "Importation Forfaits Service Traiteur",
    subtitle: "Configurez vos menus de banquets, réceptions, mariages et pauses-café.",
    badge: "Service Traiteur",
    filename: "modele_traiteur_hotelgest",
    requiredFields: ["Nom_Forfait", "Prix_Par_Personne_XOF"],
    columns: [
      { key: "Nom_Forfait", label: "Nom_Forfait", example: "Banquet Royal des Souverains d'Agadja", description: "Nom du forfait traiteur" },
      { key: "Prix_Par_Personne_XOF", label: "Prix_Par_Personne_XOF", example: 18500, description: "Tarif unitaire par convive en XOF" },
      { key: "Min_Invites", label: "Min_Invites", example: 50, description: "Nombre minimum d'invités requis" },
      { key: "Inclusions", label: "Inclusions", example: "Cocktail d'accueil, Buffet 4 entrées, 3 plats chauds, Gâteau prestige", description: "Prestations incluses" },
      { key: "Niveau_Service", label: "Niveau_Service", example: "Maître d'hôtel, serveurs en gants blancs, chafing dishes dorés", description: "Description du service" },
      { key: "Photo_URL", label: "Photo_URL", example: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80", description: "Photo du buffet ou dressage" },
    ],
  },
  STOCKS: {
    title: "Importation Articles de Stock & Économat",
    subtitle: "Importez les articles d'économat, vivres de cuisine, boissons et produits d'entretien.",
    badge: "Stocks & Économat",
    filename: "modele_stocks_hotelgest",
    requiredFields: ["Designation", "Cout_Unitaire_XOF"],
    columns: [
      { key: "SKU", label: "SKU", example: "STK-CUIS-042", description: "Code référence article unique" },
      { key: "Designation", label: "Designation", example: "Riz Parfumé Supérieur Sac 50Kg", description: "Désignation de la marchandise" },
      { key: "Categorie", label: "Categorie", example: "VIVRES_CUISINE", description: "CAVE_VINS, BOISSONS_BAR, VIVRES_CUISINE, LINGERIE_CHAMBRES, PRODUITS_ENTRETIEN" },
      { key: "Site", label: "Site", example: "Bohicon", description: "Bohicon, Abomey, Abomey-Calavi, Zogbodomey" },
      { key: "Unite", label: "Unite", example: "Sac", description: "Sac, Kg, Bouteille, Carton, Litre, Pièce" },
      { key: "Quantite_Actuelle", label: "Quantite_Actuelle", example: 35, description: "Quantité en stock physique" },
      { key: "Seuil_Alerte", label: "Seuil_Alerte", example: 10, description: "Seuil d'alerte de réapprovisionnement" },
      { key: "Seuil_Securite", label: "Seuil_Securite", example: 5, description: "Seuil critique de rupture" },
      { key: "Cout_Unitaire_XOF", label: "Cout_Unitaire_XOF", example: 26000, description: "Prix d'achat unitaire en XOF" },
      { key: "Emplacement", label: "Emplacement", example: "Économat Central Bohicon", description: "Zone de stockage physique" },
      { key: "Fournisseur", label: "Fournisseur", example: "Grossiste Central Zou", description: "Nom du fournisseur principal" },
    ],
  },
};

export function CsvExcelImporterModal({
  isOpen,
  onClose,
  importType,
  onImport,
  defaultPropertyId,
}: CsvExcelImporterModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const config = TEMPLATE_CONFIGS[importType];

  if (!isOpen) return null;

  // Resolve Property Name
  const resolveProperty = (rawSite?: string): { id: string; name: string } => {
    if (!rawSite) {
      const def = SEED_PROPERTIES.find((p) => p.id === defaultPropertyId) || SEED_PROPERTIES[0];
      return { id: def.id, name: def.name };
    }
    const clean = rawSite.toLowerCase().trim();
    if (clean.includes("abomey-calavi") || clean.includes("calavi")) {
      const p = SEED_PROPERTIES.find((x) => x.code === "ABC")!;
      return { id: p.id, name: p.name };
    }
    if (clean.includes("abomey")) {
      const p = SEED_PROPERTIES.find((x) => x.code === "ABM")!;
      return { id: p.id, name: p.name };
    }
    if (clean.includes("zogbo")) {
      const p = SEED_PROPERTIES.find((x) => x.code === "ZOG")!;
      return { id: p.id, name: p.name };
    }
    const p = SEED_PROPERTIES.find((x) => x.code === "BOH")!;
    return { id: p.id, name: p.name };
  };

  // 1. Download official CSV or Excel template
  const handleDownloadTemplate = (format: "csv" | "xlsx") => {
    const headers = config.columns.map((c) => c.label);
    const sampleRow1 = config.columns.map((c) => c.example);
    const data = [headers, sampleRow1];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto-fit column widths
    ws["!cols"] = headers.map((h, i) => ({
      wch: Math.max(h.length, String(sampleRow1[i] || "").length, 14) + 3,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modèle");

    if (format === "xlsx") {
      XLSX.writeFile(wb, `${config.filename}.xlsx`);
    } else {
      XLSX.writeFile(wb, `${config.filename}.csv`, { bookType: "csv" });
    }
  };

  // Normalize column keys (fuzzy match: lowercase, remove accents, spaces, underscores)
  const normalizeKey = (key: string): string => {
    return key
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

  // 2. Parse uploaded file (XLSX, XLS, CSV)
  const processFile = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const dataBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(dataBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("Le fichier est vide ou illisible.");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (rawRows.length === 0) {
        throw new Error("Aucune ligne de données détectée dans la feuille.");
      }

      // Map rows based on template definition
      const normalizedConfigCols: Record<string, string> = {};
      config.columns.forEach((c) => {
        normalizedConfigCols[normalizeKey(c.label)] = c.key;
        normalizedConfigCols[normalizeKey(c.key)] = c.key;
      });

      // Special synonyms
      normalizedConfigCols["nom"] = "Nom";
      normalizedConfigCols["name"] = "Nom";
      normalizedConfigCols["nomcomplet"] = "Nom_Complet";
      normalizedConfigCols["designation"] = "Nom";
      normalizedConfigCols["libelle"] = "Nom";
      normalizedConfigCols["prix"] = "Prix_XOF";
      normalizedConfigCols["price"] = "Prix_XOF";
      normalizedConfigCols["prixxof"] = "Prix_XOF";
      normalizedConfigCols["telephone"] = "Telephone";
      normalizedConfigCols["phone"] = "Telephone";
      normalizedConfigCols["tel"] = "Telephone";
      normalizedConfigCols["whatsapp"] = "Telephone";
      normalizedConfigCols["email"] = "Email";
      normalizedConfigCols["courriel"] = "Email";
      normalizedConfigCols["categorie"] = "Categorie";
      normalizedConfigCols["category"] = "Categorie";
      normalizedConfigCols["site"] = "Site";
      normalizedConfigCols["agence"] = "Site";
      normalizedConfigCols["ville"] = "Ville";
      normalizedConfigCols["city"] = "Ville";
      normalizedConfigCols["stock"] = "Stock_Bouteilles";
      normalizedConfigCols["quantite"] = "Quantite_Totale";
      normalizedConfigCols["quantiteactuelle"] = "Quantite_Actuelle";
      normalizedConfigCols["ifu"] = "IFU";
      normalizedConfigCols["rccm"] = "RCCM";
      normalizedConfigCols["numero"] = "Numero";
      normalizedConfigCols["numerodeporte"] = "Numero";
      normalizedConfigCols["prixnuit"] = "Prix_Nuit_XOF";
      normalizedConfigCols["prixnuitxof"] = "Prix_Nuit_XOF";
      normalizedConfigCols["prixjour"] = "Prix_Jour_XOF";
      normalizedConfigCols["prixjourxof"] = "Prix_Jour_XOF";
      normalizedConfigCols["coutunitaire"] = "Cout_Unitaire_XOF";
      normalizedConfigCols["coutunitairexof"] = "Cout_Unitaire_XOF";
      normalizedConfigCols["photo"] = "Photo_URL";
      normalizedConfigCols["photourl"] = "Photo_URL";
      normalizedConfigCols["image"] = "Photo_URL";
      normalizedConfigCols["imageurl"] = "Photo_URL";

      const cleanedRows = rawRows.map((rawRow, idx) => {
        const item: Record<string, any> = { _originalIndex: idx + 1 };

        Object.keys(rawRow).forEach((rawKey) => {
          const normKey = normalizeKey(rawKey);
          const targetKey = normalizedConfigCols[normKey];
          if (targetKey) {
            item[targetKey] = rawRow[rawKey];
          } else {
            item[rawKey] = rawRow[rawKey];
          }
        });

        // Smart defaults based on import type
        if (importType === "CLIENTS") {
          const prop = resolveProperty(item["Site"] || item["site"]);
          return {
            fullName: String(item["Nom_Complet"] || item["Nom"] || `Client Importé #${idx + 1}`).trim(),
            category: (item["Categorie"] || "PARTICULIER").toUpperCase(),
            phone: String(item["Telephone"] || "").trim(),
            email: String(item["Email"] || "").toLowerCase().trim(),
            propertyId: prop.id,
            propertyName: prop.name,
            city: String(item["Ville"] || prop.name.split("-")[1]?.trim() || "Bénin").trim(),
            country: String(item["Pays"] || "Bénin").trim(),
            taxId: item["IFU"] ? String(item["IFU"]).trim() : undefined,
            rccm: item["RCCM"] ? String(item["RCCM"]).trim() : undefined,
            preferences: item["Preferences"] || undefined,
            totalSpendXof: Number(item["Total_Depenses_XOF"]) || 0,
            visitsCount: Number(item["Visites"]) || 1,
            status: item["Statut"] || "ACTIF",
            notes: item["Notes"] || `Importé le ${new Date().toLocaleDateString("fr-FR")}`,
          };
        } else if (importType === "WINES") {
          return {
            name: String(item["Nom"] || `Cru Importé #${idx + 1}`).trim(),
            category: (item["Categorie"] || "ROUGE").toUpperCase(),
            origin: String(item["Origine"] || "France / Terroir"),
            millesime: String(item["Millesime"] || "2020"),
            priceXof: Number(item["Prix_XOF"]) || 25000,
            stockBottles: Number(item["Stock_Bouteilles"]) || 12,
            minStockAlert: Number(item["Seuil_Alerte"]) || 5,
            pairings: String(item["Accords_Mets"] || "Viandes braisées, fromages"),
            imageUrl: String(
              item["Photo_URL"] ||
                "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80"
            ),
          };
        } else if (importType === "MEALS") {
          const rawAcc = item["Accompagnements"];
          const accompaniments = Array.isArray(rawAcc)
            ? rawAcc
            : typeof rawAcc === "string" && rawAcc.trim()
            ? rawAcc.split(/[,;]/).map((s) => s.trim())
            : ["Alloco", "Piment vert frais"];

          return {
            name: String(item["Nom"] || `Mets Gastronomique #${idx + 1}`).trim(),
            category: (item["Categorie"] || "PLAT_TRADITIONNEL").toUpperCase(),
            priceXof: Number(item["Prix_XOF"]) || 6500,
            prepTimeMinutes: Number(item["Temps_Prep_Minutes"]) || 20,
            accompaniments,
            description: String(item["Description"] || "Spécialité du Chef Le Vignoble préparée à la commande"),
            imageUrl: String(
              item["Photo_URL"] ||
                "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
            ),
          };
        } else if (importType === "ROOMS") {
          const prop = resolveProperty(item["Site"] || item["site"]);
          const rawEquip = item["Equipements"];
          const amenities = Array.isArray(rawEquip)
            ? rawEquip
            : typeof rawEquip === "string" && rawEquip.trim()
            ? rawEquip.split(/[,;]/).map((s) => s.trim())
            : ["Climatisation", "Wi-Fi Dédié", "Téléviseur 4K"];

          return {
            number: String(item["Numero"] || `${idx + 101}`).trim(),
            name: String(item["Nom"] || "Suite Confortable"),
            propertyId: prop.id,
            type: (item["Type"] || "SUPERIEURE").toUpperCase(),
            basePriceXof: Number(item["Prix_Nuit_XOF"]) || 35000,
            capacity: Number(item["Capacite"]) || 2,
            amenities,
            status: item["Statut"] || "DISPONIBLE",
            imageUrl: String(
              item["Photo_URL"] ||
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
            ),
          };
        } else if (importType === "RENTALS") {
          return {
            name: String(item["Nom"] || `Matériel Location #${idx + 1}`).trim(),
            type: (item["Type"] || "VOITURES").toUpperCase(),
            dailyPriceXof: Number(item["Prix_Jour_XOF"]) || 45000,
            depositXof: Number(item["Caution_XOF"]) || 50000,
            totalQuantity: Number(item["Quantite_Totale"]) || 1,
            availableQuantity: Number(item["Quantite_Totale"]) || 1,
            specs: String(item["Caracteristiques"] || "Équipement contrôlé et vérifié aux normes Le Vignoble"),
            imageUrl: String(
              item["Photo_URL"] ||
                "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
            ),
          };
        } else if (importType === "CATERING") {
          const rawInc = item["Inclusions"];
          const inclusions = Array.isArray(rawInc)
            ? rawInc
            : typeof rawInc === "string" && rawInc.trim()
            ? rawInc.split(/[,;]/).map((s) => s.trim())
            : ["Cocktail d'accueil", "Entrée", "Plat principal", "Dessert"];

          return {
            name: String(item["Nom_Forfait"] || item["Nom"] || `Forfait Traiteur #${idx + 1}`).trim(),
            pricePerPersonXof: Number(item["Prix_Par_Personne_XOF"] || item["Prix_XOF"]) || 15000,
            minGuests: Number(item["Min_Invites"]) || 30,
            inclusions,
            serviceLevel: String(
              item["Niveau_Service"] || "Personnel en tenue, chauffe-plats et nappage inclus"
            ),
            imageUrl: String(
              item["Photo_URL"] ||
                "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80"
            ),
          };
        } else if (importType === "STOCKS") {
          const prop = resolveProperty(item["Site"] || item["site"]);
          return {
            sku: String(item["SKU"] || `STK-${Date.now().toString().slice(-4)}-${idx + 1}`),
            name: String(item["Designation"] || item["Nom"] || `Article Stock #${idx + 1}`).trim(),
            category: (item["Categorie"] || "VIVRES_CUISINE").toUpperCase(),
            propertyId: prop.id,
            unitMeasure: String(item["Unite"] || "Unité"),
            currentQuantity: Number(item["Quantite_Actuelle"] || item["Stock"]) || 20,
            alertThreshold: Number(item["Seuil_Alerte"]) || 8,
            securityThreshold: Number(item["Seuil_Securite"]) || 3,
            unitCostXof: Number(item["Cout_Unitaire_XOF"] || item["Prix_XOF"]) || 3500,
            storageLocation: String(item["Emplacement"] || `Économat ${prop.name.split("-")[1] || "Principal"}`),
            supplierName: String(item["Fournisseur"] || "Grossiste Agréé"),
          };
        }

        return item;
      });

      setParsedRows(cleanedRows);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors du traitement du fichier.");
      setParsedRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows);
    onClose();
    // Reset state
    setParsedRows([]);
    setFileName("");
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-gradient-to-b from-[#1c1815] via-[#141210] to-[#0e0d0c] border border-[#d4af37]/40 rounded-3xl p-6 text-white max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
                {config.badge}
              </span>
              <span className="text-xs text-stone-400">Import CSV & Excel Universel</span>
            </div>
            <h2 className="text-xl font-black font-serif text-white tracking-wide">
              {config.title}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">{config.subtitle}</p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* Step 1: Download Template */}
          <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
                <Download className="w-4 h-4 text-[#d4af37]" />
                Étape 1 : Télécharger le modèle officiel pré-rempli
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                Utilisez notre modèle avec les colonnes exactes et des exemples réalistes pour éviter les erreurs.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadTemplate("xlsx")}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Modèle Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadTemplate("csv")}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
              >
                <FileText className="w-4 h-4 text-[#d4af37]" />
                <span>Modèle CSV</span>
              </button>
            </div>
          </div>

          {/* Step 2: Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-[#d4af37] bg-[#d4af37]/10"
                : "border-stone-700 hover:border-[#d4af37]/60 bg-stone-900/50 hover:bg-stone-900"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center mx-auto mb-3 shadow-lg">
              {isProcessing ? (
                <RefreshCw className="w-7 h-7 animate-spin" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>

            <h3 className="font-bold text-sm text-stone-200 mb-1">
              Glissez-déposez votre fichier ici, ou{" "}
              <span className="text-[#d4af37] underline decoration-[#d4af37]/40 underline-offset-4">
                cliquez pour parcourir
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              Prend en charge les formats Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) et Tableur (<strong>.csv</strong>)
            </p>

            {fileName && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-xs text-[#d4af37] font-semibold">
                <FileSpreadsheet className="w-4 h-4" />
                <span>{fileName}</span>
              </div>
            )}
          </div>

          {/* Error Feedback */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 3: Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Aperçu des données détectées ({parsedRows.length} lignes valides)
                </h4>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Prêt pour injection directe
                </span>
              </div>

              <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-950/70">
                <div className="max-h-60 overflow-x-auto overflow-y-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-900/90 text-stone-400 font-semibold sticky top-0 border-b border-stone-800">
                      <tr>
                        <th className="px-3.5 py-2.5">#</th>
                        {Object.keys(parsedRows[0]).slice(0, 6).map((k) => (
                          <th key={k} className="px-3.5 py-2.5 capitalize">
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 text-stone-300">
                      {parsedRows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="hover:bg-stone-900/40">
                          <td className="px-3.5 py-2 text-stone-500 font-mono">{i + 1}</td>
                          {Object.keys(row).slice(0, 6).map((k) => (
                            <td key={k} className="px-3.5 py-2 truncate max-w-[200px]">
                              {Array.isArray(row[k])
                                ? row[k].join(", ")
                                : typeof row[k] === "number"
                                ? row[k].toLocaleString("fr-FR")
                                : String(row[k] || "-")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 10 && (
                  <div className="p-2.5 text-center text-[11px] text-stone-500 border-t border-stone-800 bg-stone-900/30">
                    + {parsedRows.length - 10} autres lignes prêtes à être importées
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guide des colonnes */}
          <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-stone-300 font-bold">
              <Info className="w-4 h-4 text-[#d4af37]" />
              <span>Champs attendus pour {config.badge} :</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-[11px] text-stone-400">
              {config.columns.map((col) => (
                <div key={col.key} className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
                  <span className="font-bold text-stone-200">{col.label}</span>
                  <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{col.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleConfirmImport}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all ${
              parsedRows.length > 0
                ? "bg-gradient-to-r from-[#d4af37] to-amber-500 text-black hover:brightness-110 active:scale-95 cursor-pointer"
                : "bg-stone-800 text-stone-600 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Valider l&apos;importation ({parsedRows.length} lignes)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
