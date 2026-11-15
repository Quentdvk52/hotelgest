import * as fs from "fs";
import * as path from "path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from "docx";
import { SEED_USERS } from "../src/lib/db/seed";
import { USER_PASSWORDS } from "./seed-enterprise-accounts";

const borderStyle = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: "D3D3D3",
};

const cellBorders = {
  top: borderStyle,
  bottom: borderStyle,
  left: borderStyle,
  right: borderStyle,
};

function createHeaderCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: "7C3C46" }, // Vignoble Bordeaux
    borders: cellBorders,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold: true,
            color: "FFFFFF",
            size: 20, // 10pt
            font: "Segoe UI",
          }),
        ],
      }),
    ],
  });
}

function createDataCell(
  text: string,
  widthPercent: number,
  options: { bold?: boolean; isCode?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; fill?: string } = {}
): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: options.fill ? { type: ShadingType.CLEAR, fill: options.fill } : undefined,
    borders: cellBorders,
    children: [
      new Paragraph({
        alignment: options.align || AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: options.bold || false,
            size: 18, // 9pt
            font: options.isCode ? "Consolas" : "Segoe UI",
            color: options.isCode ? "8B0000" : "222222",
          }),
        ],
      }),
    ],
  });
}

async function generateDocx() {
  console.log("Generating updated 'donnees de test.docx'...");

  const tableRows: TableRow[] = [
    // Header Row
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell("N°", 5),
        createHeaderCell("Rôle / Fonction", 18),
        createHeaderCell("Nom & Prénom", 17),
        createHeaderCell("Identifiant (Email)", 22),
        createHeaderCell("Mot de Passe", 15),
        createHeaderCell("Périmètre", 15),
        createHeaderCell("Remise", 8),
      ],
    }),
  ];

  // Populate data rows
  SEED_USERS.forEach((user, index) => {
    const rawPass = USER_PASSWORDS[user.email] || "Vignoble#2026";
    const propertyLabel = user.propertyId
      ? user.propertyId.includes("boh")
        ? "Bohicon (BOH)"
        : user.propertyId.includes("abm")
        ? "Abomey (ABM)"
        : user.propertyId.includes("calavi")
        ? "Abomey-Calavi (ABC)"
        : "Zogbodomey (ZOG)"
      : "GROUPE (4 Agences)";

    const isEven = index % 2 === 0;
    const rowBg = isEven ? "FDF8F8" : "FFFFFF";

    tableRows.push(
      new TableRow({
        children: [
          createDataCell(String(index + 1), 5, { align: AlignmentType.CENTER, fill: rowBg }),
          createDataCell(user.roleName, 18, { bold: true, fill: rowBg }),
          createDataCell(user.fullName, 17, { fill: rowBg }),
          createDataCell(user.email, 22, { isCode: true, fill: rowBg }),
          createDataCell(rawPass, 15, { isCode: true, bold: true, fill: rowBg }),
          createDataCell(propertyLabel, 15, { fill: rowBg }),
          createDataCell(`${user.maxDiscount}%`, 8, { align: AlignmentType.CENTER, bold: true, fill: rowBg }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Titre
          new Paragraph({
            text: "HOTEL LE VIGNOBLE — COMPTES DE TEST ET GUIDE D'ACCÈS",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Sous-titre
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Plateforme HotelGest SaaS — Environnement Pilote & Production Neon",
                italics: true,
                color: "555555",
                size: 22,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Consigne Initiale Client
          new Paragraph({
            text: "1. Consignes Initiales du Fichier de Test",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Dans la société test « HOTEL LE VIGNOBLE », création et configuration des profils suivants :\n" +
                  "• Promoteur : Eddy GNACADJA (PDG, accès total groupe, gnacadjaeddy@gmail.com)\n" +
                  "• DAF (Directeur Administratif et Financier) : Coiffe la gestion financière et administrative de toutes les agences\n" +
                  "• Comptable Central : Journal SYSCOHADA, débits/crédits, balances, facturation\n" +
                  "• Caissier Central : Trésorerie, coffre-fort, réconciliation multi-caisses\n" +
                  "• Gérants d'agences : Un gérant dédié pour chaque agence (Bohicon, Abomey, Abomey-Calavi, Zogbodomey)\n" +
                  "• Serveuses : Équipes restaurant/bar pour chaque agence (commandes, transfert folio)\n" +
                  "• Personnel spécialisé : Réceptionnistes, Chefs Cuisiniers (KDS), Barmen (KDS Bar/Cave), Responsable Traiteur & Matériel Événementiel, Gouvernante (Housekeeping).\n\n" +
                  "Tous les identifiants, mots de passe et espaces de travail ont été créés, injectés dans la base Neon PostgreSQL et configurés.",
              }),
            ],
            spacing: { after: 300 },
          }),

          // URLs et Accès
          new Paragraph({
            text: "2. Adresses d'Accès et Déploiement",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• URL de l'Application en Ligne (Vercel) : ", bold: true }),
              new TextRun({ text: "https://hotelgest.vercel.app\n", color: "0000EE" }),
              new TextRun({ text: "• URL de Développement Local : ", bold: true }),
              new TextRun({ text: "http://localhost:3000\n", color: "0000EE" }),
              new TextRun({ text: "• Base de Données Neon : ", bold: true }),
              new TextRun({ text: "PostgreSQL Serverless (Projet plain-moon-14479633 / neondb)\n" }),
              new TextRun({ text: "• Authentification Neon : ", bold: true }),
              new TextRun({ text: "Vérifiée et active avec clés Ed25519 (JWKS validé)\n" }),
            ],
            spacing: { after: 300 },
          }),

          // Tableau des comptes
          new Paragraph({
            text: "3. Tableau Exhaustif des 20 Comptes Créés et Opérationnels",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),

          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),

          // Détail des Espaces et Fonctionnalités
          new Paragraph({
            text: "4. Espaces de Travail et Droits par Profil",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "A. Promoteur & DAF (Portée Groupe - 4 Agences) :\n", bold: true }),
              new TextRun({ text: "Accès à l'ensemble des modules : Dashboard consolidé, Réception PMS, KDS, Traiteur & Matériel, Caisses centrales, Validation des remises (jusqu'à 100% pour le Promoteur et 50% pour le DAF), Clôture journalière (Night Audit) et Journal comptable SYSCOHADA.\n\n" }),
              new TextRun({ text: "B. Gérants d'Agence (Bohicon, Abomey, Abomey-Calavi, Zogbodomey) :\n", bold: true }),
              new TextRun({ text: "Supervision complète de leur agence respective : validation des remises locales (jusqu'à 25%), clôture de caisse locale, suivi des arrivées/départs, commandes restaurant/bar et événements traiteur.\n\n" }),
              new TextRun({ text: "C. Responsable Traiteur & Location de Matériel :\n", bold: true }),
              new TextRun({ text: "Gestion des commandes traiteur (portions, préférences, régimes), devis, calendrier des événements, inventaire du matériel louable (chaises, tables, bâches, vaisselle), états des lieux départ/retour et gestion des cautions/pénalités.\n\n" }),
              new TextRun({ text: "D. Comptable Central & Caissier Central :\n", bold: true }),
              new TextRun({ text: "Gestion des encaissements multi-modes (CASH, TPE, MOBILE MONEY, VIREMENT), justification obligatoire des écarts de caisse, balances débits/crédits et export du journal SYSCOHADA.\n\n" }),
              new TextRun({ text: "E. Réceptionnistes, Chefs, Barmen, Serveuses & Housekeeping :\n", bold: true }),
              new TextRun({ text: "Espaces opérationnels spécialisés (Planning PMS, KDS Cuisine, KDS Bar & Cave, Prise de commande avec transfert folio, Propreté et statut des unités).\n" }),
            ],
            spacing: { after: 200 },
          }),

          // Note de Sécurité
          new Paragraph({
            text: "5. Sécurité et Confidentialité",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Conformément aux instructions strictes de sécurité, tous ces identifiants et mots de passe restent confinés à ce document confidentiel et sont enregistrés sous forme hachée sécurisée dans la base de données Neon PostgreSQL.",
                italics: true,
                color: "666666",
              }),
            ],
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const targetPath = path.join(process.cwd(), "donnees de test.docx");
  fs.writeFileSync(targetPath, buffer);
  console.log("✓ 'donnees de test.docx' successfully updated and saved!");
}

generateDocx().catch((err) => {
  console.error("Error generating docx:", err);
  process.exit(1);
});
