import crypto from "crypto";
import { SEED_PROPERTIES } from "../../lib/db/seed";
import { generateQrSvgString, generateQrMatrix } from "../../lib/qr/qr-generator";

export type SpaceType =
  | "RESTAURANT"
  | "BAR"
  | "BANQUET"
  | "CONFERENCE"
  | "TERRASSE"
  | "VIP";

export interface ZoneRecord {
  id: string;
  propertyId: string;
  name: string;
  spaceType: SpaceType;
  capacity?: number;
  description?: string;
  createdAt: Date;
}

export interface DiningTableRecord {
  id: string;
  propertyId: string;
  tableNumber: string;
  spaceName: string;
  spaceType: SpaceType;
  capacity: number;
  zoneId?: string;
}

export interface RoomUnitRecord {
  id: string;
  propertyId: string;
  unitNumber: string;
  roomName: string;
  floor: string;
}

export interface QrResourceRecord {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyCity?: string;
  propertyPhone?: string;
  propertyEmail?: string;
  propertyAddress?: string;
  token: string;
  resourceType: "TABLE" | "ROOM";
  tableId?: string;
  unitId?: string;
  tableNumber?: string;
  spaceName?: string;
  spaceType?: SpaceType;
  unitNumber?: string;
  roomName?: string;
  directUrl: string;
  revoked: boolean;
  createdAt: Date;
}

// Initial predefined zones for each property
const INITIAL_ZONES: ZoneRecord[] = [
  // Bohicon (BOH)
  { id: "zone-boh-resto", propertyId: "prop-bohicon-001", name: "Restaurant Le Vignoble", spaceType: "RESTAURANT", capacity: 80, description: "Grande salle climatisée et service gastronomique", createdAt: new Date() },
  { id: "zone-boh-terrasse", propertyId: "prop-bohicon-001", name: "Terrasse Piscine & Paillotes", spaceType: "TERRASSE", capacity: 60, description: "Espace extérieur ventilé aux abords de la piscine", createdAt: new Date() },
  { id: "zone-boh-bar", propertyId: "prop-bohicon-001", name: "Bar & Cave d'Exception", spaceType: "BAR", capacity: 35, description: "Comptoir lounge et cave à vin climatisée", createdAt: new Date() },
  { id: "zone-boh-vip", propertyId: "prop-bohicon-001", name: "Espace VIP & Lounge Exécutif", spaceType: "VIP", capacity: 25, description: "Salons privés insonorisés Danxomè", createdAt: new Date() },
  { id: "zone-boh-fete", propertyId: "prop-bohicon-001", name: "Salle des Fêtes & Banquets Agadja", spaceType: "BANQUET", capacity: 250, description: "Grande salle modulable réceptions et mariages", createdAt: new Date() },
  { id: "zone-boh-conf", propertyId: "prop-bohicon-001", name: "Salle de Conférences & Séminaires", spaceType: "CONFERENCE", capacity: 120, description: "Équipée vidéo-projecteurs et sonorisation HD", createdAt: new Date() },

  // Abomey (ABM)
  { id: "zone-abm-resto", propertyId: "prop-abomey-002", name: "Restaurant Roi Béhanzin", spaceType: "RESTAURANT", capacity: 70, description: "Ambiance historique et spécialités royales", createdAt: new Date() },
  { id: "zone-abm-fete", propertyId: "prop-abomey-002", name: "Salle des Fêtes & Événements", spaceType: "BANQUET", capacity: 180, description: "Espace événementiel de prestige", createdAt: new Date() },
  { id: "zone-abm-conf", propertyId: "prop-abomey-002", name: "Salle de Séminaires Historique", spaceType: "CONFERENCE", capacity: 90, description: "Colloques et formations", createdAt: new Date() },

  // Abomey-Calavi (ABC)
  { id: "zone-abc-resto", propertyId: "prop-calavi-003", name: "Restaurant Gastronomique Calavi", spaceType: "RESTAURANT", capacity: 90, description: "Cuisine moderne et mets du terroir", createdAt: new Date() },
  { id: "zone-abc-fete", propertyId: "prop-calavi-003", name: "Grande Salle de Réception Calavi", spaceType: "BANQUET", capacity: 200, description: "Banquets d'entreprise et cérémonies", createdAt: new Date() },
  { id: "zone-abc-conf", propertyId: "prop-calavi-003", name: "Espace Conférences & Affaires UAC", spaceType: "CONFERENCE", capacity: 150, description: "Séminaires universitaires et corporatifs", createdAt: new Date() },

  // Zogbodomey (ZOG)
  { id: "zone-zog-resto", propertyId: "prop-zogbo-004", name: "Restaurant Terroir & Saveurs", spaceType: "RESTAURANT", capacity: 60, description: "Spécialités locales du Zou", createdAt: new Date() },
  { id: "zone-zog-paillote", propertyId: "prop-zogbo-004", name: "Jardin Événementiel & Paillotes", spaceType: "TERRASSE", capacity: 120, description: "Plein air sous ombrage naturel", createdAt: new Date() },
];

// Initial multi-space tables across Groupe Le Vignoble
const INITIAL_TABLES: DiningTableRecord[] = [
  // Bohicon
  { id: "tbl-boh-01", propertyId: "prop-bohicon-001", tableNumber: "Table 01", spaceName: "Restaurant Le Vignoble", spaceType: "RESTAURANT", capacity: 4, zoneId: "zone-boh-resto" },
  { id: "tbl-boh-02", propertyId: "prop-bohicon-001", tableNumber: "Table 02", spaceName: "Restaurant Le Vignoble", spaceType: "RESTAURANT", capacity: 4, zoneId: "zone-boh-resto" },
  { id: "tbl-boh-03", propertyId: "prop-bohicon-001", tableNumber: "Table 03", spaceName: "Terrasse Piscine & Paillotes", spaceType: "TERRASSE", capacity: 6, zoneId: "zone-boh-terrasse" },
  { id: "tbl-boh-bar-01", propertyId: "prop-bohicon-001", tableNumber: "Comptoir Bar 1", spaceName: "Bar & Cave d'Exception", spaceType: "BAR", capacity: 2, zoneId: "zone-boh-bar" },
  { id: "tbl-boh-fete-01", propertyId: "prop-bohicon-001", tableNumber: "Table Royale 01", spaceName: "Salle des Fêtes & Banquets Agadja", spaceType: "BANQUET", capacity: 10, zoneId: "zone-boh-fete" },
  { id: "tbl-boh-conf-01", propertyId: "prop-bohicon-001", tableNumber: "Tribune Conférence A", spaceName: "Salle de Conférences & Séminaires", spaceType: "CONFERENCE", capacity: 12, zoneId: "zone-boh-conf" },
  { id: "tbl-boh-vip-01", propertyId: "prop-bohicon-001", tableNumber: "Salon Privé Danxomè", spaceName: "Espace VIP & Lounge Exécutif", spaceType: "VIP", capacity: 8, zoneId: "zone-boh-vip" },

  // Abomey
  { id: "tbl-abm-01", propertyId: "prop-abomey-002", tableNumber: "Table 01", spaceName: "Restaurant Roi Béhanzin", spaceType: "RESTAURANT", capacity: 4, zoneId: "zone-abm-resto" },
  { id: "tbl-abm-fete-01", propertyId: "prop-abomey-002", tableNumber: "Table Prestige 01", spaceName: "Salle des Fêtes & Événements", spaceType: "BANQUET", capacity: 10, zoneId: "zone-abm-fete" },
  { id: "tbl-abm-conf-01", propertyId: "prop-abomey-002", tableNumber: "Plénière 01", spaceName: "Salle de Séminaires Historique", spaceType: "CONFERENCE", capacity: 14, zoneId: "zone-abm-conf" },

  // Abomey-Calavi
  { id: "tbl-abc-01", propertyId: "prop-calavi-003", tableNumber: "Table 01", spaceName: "Restaurant Gastronomique Calavi", spaceType: "RESTAURANT", capacity: 4, zoneId: "zone-abc-resto" },
  { id: "tbl-abc-fete-01", propertyId: "prop-calavi-003", tableNumber: "Table Gala 01", spaceName: "Grande Salle de Réception Calavi", spaceType: "BANQUET", capacity: 12, zoneId: "zone-abc-fete" },
  { id: "tbl-abc-conf-01", propertyId: "prop-calavi-003", tableNumber: "Salle Conseil", spaceName: "Espace Conférences & Affaires UAC", spaceType: "CONFERENCE", capacity: 16, zoneId: "zone-abc-conf" },

  // Zogbodomey
  { id: "tbl-zog-01", propertyId: "prop-zogbo-004", tableNumber: "Table 01", spaceName: "Restaurant Terroir & Saveurs", spaceType: "RESTAURANT", capacity: 4, zoneId: "zone-zog-resto" },
  { id: "tbl-zog-paillote-01", propertyId: "prop-zogbo-004", tableNumber: "Paillote Centrale", spaceName: "Jardin Événementiel & Paillotes", spaceType: "TERRASSE", capacity: 8, zoneId: "zone-zog-paillote" },
];

// Initial rooms across all 4 properties of Groupe Le Vignoble
const INITIAL_ROOMS: RoomUnitRecord[] = [
  // Bohicon
  { id: "unit-101", propertyId: "prop-bohicon-001", unitNumber: "101", roomName: "Suite Royale Le Vignoble", floor: "1er étage" },
  { id: "unit-102", propertyId: "prop-bohicon-001", unitNumber: "102", roomName: "Suite Supérieure Exécutive", floor: "1er étage" },
  { id: "unit-103", propertyId: "prop-bohicon-001", unitNumber: "103", roomName: "Chambre Standard Confort", floor: "1er étage" },
  { id: "unit-201", propertyId: "prop-bohicon-001", unitNumber: "201", roomName: "Chambre Supérieure Balcon", floor: "2ème étage" },
  { id: "unit-301", propertyId: "prop-bohicon-001", unitNumber: "301", roomName: "Pavillon Familial Jardin", floor: "Rez-de-jardin" },

  // Abomey
  { id: "unit-abm-101", propertyId: "prop-abomey-002", unitNumber: "101", roomName: "Chambre Confort Patrimoine", floor: "1er étage" },
  { id: "unit-abm-201", propertyId: "prop-abomey-002", unitNumber: "201", roomName: "Suite Historique Abomey", floor: "2ème étage" },

  // Abomey-Calavi
  { id: "unit-abc-101", propertyId: "prop-calavi-003", unitNumber: "101", roomName: "Suite Affaires & Congrès", floor: "1er étage" },
  { id: "unit-abc-201", propertyId: "prop-calavi-003", unitNumber: "201", roomName: "Chambre Exécutive Calavi", floor: "2ème étage" },

  // Zogbodomey
  { id: "unit-zog-101", propertyId: "prop-zogbo-004", unitNumber: "101", roomName: "Bungalow Prestige Nature", floor: "Rez-de-chaussée" },
  { id: "unit-zog-102", propertyId: "prop-zogbo-004", unitNumber: "102", roomName: "Chambre Détente & Terroir", floor: "Rez-de-chaussée" },
];

class QrService {
  private resources: QrResourceRecord[] = [];
  private diningTables: DiningTableRecord[] = [];
  private roomUnits: RoomUnitRecord[] = [];
  private zones: ZoneRecord[] = [];

  constructor() {
    this.resetState();
  }

  public resetState() {
    this.resources = [];
    this.zones = [...INITIAL_ZONES];
    this.diningTables = [...INITIAL_TABLES];
    this.roomUnits = [...INITIAL_ROOMS];

    // Pre-generate standard QRs for ALL dining tables across all spaces
    this.diningTables.forEach((t) => {
      this.createTableQrResource(t);
    });

    // Pre-generate room QRs for ALL rooms across all properties
    this.roomUnits.forEach((u) => {
      this.createRoomQrResource(u);
    });
  }

  public getPropertyDetails(propertyId: string) {
    const prop = SEED_PROPERTIES.find((p) => p.id === propertyId) || SEED_PROPERTIES[0];
    return {
      name: prop.name,
      city: prop.city,
      phone: prop.phone,
      email: prop.email,
      address: prop.address,
    };
  }

  /**
   * Deterministic token generation: Stable across all serverless restarts,
   * lambdas and cold starts.
   */
  public getDeterministicToken(resourceType: "table" | "room", id: string): string {
    const cleanId = id.replace(/-/g, "_");
    const hash = crypto
      .createHash("sha256")
      .update(`hotelgest_vignoble_${resourceType}_${id}`)
      .digest("hex")
      .slice(0, 16);
    return `hg_${resourceType}_${cleanId}_${hash}`;
  }

  public createTableQrResource(table: DiningTableRecord): QrResourceRecord {
    // Check if an active token already exists for this table
    const existing = this.resources.find((r) => r.tableId === table.id && !r.revoked);
    if (existing) return existing;

    const token = this.getDeterministicToken("table", table.id);
    const prop = this.getPropertyDetails(table.propertyId);

    const resource: QrResourceRecord = {
      id: `qr-table-${table.id}`,
      propertyId: table.propertyId,
      propertyName: prop.name,
      propertyCity: prop.city,
      propertyPhone: prop.phone,
      propertyEmail: prop.email,
      propertyAddress: prop.address,
      token,
      resourceType: "TABLE",
      tableId: table.id,
      tableNumber: table.tableNumber,
      spaceName: table.spaceName,
      spaceType: table.spaceType,
      directUrl: `/order/${token}`,
      revoked: false,
      createdAt: new Date(),
    };
    this.resources.push(resource);
    return resource;
  }

  public createRoomQrResource(unit: RoomUnitRecord): QrResourceRecord {
    const existing = this.resources.find((r) => r.unitId === unit.id && !r.revoked);
    if (existing) return existing;

    const token = this.getDeterministicToken("room", unit.id);
    const prop = this.getPropertyDetails(unit.propertyId);

    const resource: QrResourceRecord = {
      id: `qr-room-${unit.id}`,
      propertyId: unit.propertyId,
      propertyName: prop.name,
      propertyCity: prop.city,
      propertyPhone: prop.phone,
      propertyEmail: prop.email,
      propertyAddress: prop.address,
      token,
      resourceType: "ROOM",
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      roomName: unit.roomName,
      directUrl: `/order/${token}`,
      revoked: false,
      createdAt: new Date(),
    };
    this.resources.push(resource);
    return resource;
  }

  public createQrResource(
    propertyId: string,
    resourceType: "TABLE" | "ROOM",
    targetId?: string
  ): QrResourceRecord {
    if (resourceType === "TABLE") {
      let table = this.diningTables.find((t) => t.id === targetId);
      if (!table) {
        table = {
          id: targetId || `tbl-${Date.now().toString(36)}`,
          propertyId,
          tableNumber: targetId === "tbl-01" ? "Table 1" : targetId || "Table",
          spaceName: "Restaurant Le Vignoble",
          spaceType: "RESTAURANT",
          capacity: 4,
        };
        this.diningTables.push(table);
      }
      return this.createTableQrResource(table);
    } else {
      let room = this.roomUnits.find((u) => u.id === targetId);
      if (!room) {
        room = {
          id: targetId || `unit-${Date.now().toString(36)}`,
          propertyId,
          unitNumber: targetId || "101",
          roomName: "Chambre Standard",
          floor: "1er étage",
        };
        this.roomUnits.push(room);
      }
      return this.createRoomQrResource(room);
    }
  }

  // --- ZONES MANAGEMENT ---
  public listZones(propertyId?: string): ZoneRecord[] {
    if (!propertyId || propertyId === "ALL") return this.zones;
    return this.zones.filter((z) => z.propertyId === propertyId);
  }

  public createZone(
    propertyId: string,
    name: string,
    spaceType: SpaceType = "RESTAURANT",
    capacity: number = 40,
    description: string = ""
  ): ZoneRecord {
    const id = `zone-${propertyId.replace("prop-", "")}-${Date.now().toString(36)}`;
    const newZone: ZoneRecord = {
      id,
      propertyId,
      name,
      spaceType,
      capacity,
      description,
      createdAt: new Date(),
    };
    this.zones.push(newZone);
    return newZone;
  }

  public deleteZone(zoneId: string): boolean {
    const idx = this.zones.findIndex((z) => z.id === zoneId);
    if (idx >= 0) {
      this.zones.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- TABLES MANAGEMENT ---
  public createTableWithQr(
    propertyId: string,
    tableNumber: string,
    spaceName: string,
    spaceType: SpaceType = "RESTAURANT",
    capacity: number = 4,
    zoneId?: string
  ): { table: DiningTableRecord; qr: QrResourceRecord } {
    const tableId = `tbl-${propertyId.replace("prop-", "")}-${Date.now().toString(36)}`;
    const table: DiningTableRecord = {
      id: tableId,
      propertyId,
      tableNumber,
      spaceName,
      spaceType,
      capacity,
      zoneId,
    };
    this.diningTables.push(table);
    const qr = this.createTableQrResource(table);
    return { table, qr };
  }

  public deleteTable(tableId: string): boolean {
    const idx = this.diningTables.findIndex((t) => t.id === tableId);
    if (idx >= 0) {
      this.diningTables.splice(idx, 1);
      // Also revoke or remove corresponding QR
      const qr = this.resources.find((r) => r.tableId === tableId);
      if (qr) qr.revoked = true;
      return true;
    }
    return false;
  }

  // --- ROOMS MANAGEMENT ---
  public createRoomWithQr(
    propertyId: string,
    unitNumber: string,
    roomName: string,
    floor: string = "RDC"
  ): { room: RoomUnitRecord; qr: QrResourceRecord } {
    const unitId = `unit-${propertyId.replace("prop-", "")}-${unitNumber.toLowerCase().replace(/\s+/g, "-")}`;
    const room: RoomUnitRecord = {
      id: unitId,
      propertyId,
      unitNumber,
      roomName,
      floor,
    };
    this.roomUnits.push(room);
    const qr = this.createRoomQrResource(room);
    return { room, qr };
  }

  public listQrResources(propertyId?: string, resourceType?: "TABLE" | "ROOM"): QrResourceRecord[] {
    return this.resources.filter((r) => {
      if (r.revoked) return false;
      if (propertyId && propertyId !== "ALL" && r.propertyId !== propertyId) return false;
      if (resourceType && r.resourceType !== resourceType) return false;
      return true;
    });
  }

  public getQrForTable(tableId: string): QrResourceRecord | undefined {
    return this.resources.find((r) => r.tableId === tableId && !r.revoked);
  }

  public getQrForRoom(unitId: string): QrResourceRecord | undefined {
    return this.resources.find((r) => r.unitId === unitId && !r.revoked);
  }

  public listDiningTables(propertyId?: string): DiningTableRecord[] {
    if (!propertyId || propertyId === "ALL") return this.diningTables;
    return this.diningTables.filter((t) => t.propertyId === propertyId);
  }

  public listRoomUnits(propertyId?: string): RoomUnitRecord[] {
    if (!propertyId || propertyId === "ALL") return this.roomUnits;
    return this.roomUnits.filter((u) => u.propertyId === propertyId);
  }

  /**
   * Resilient Token Resolution:
   * 1. Check in-memory resources
   * 2. Fallback pattern matching for ROOM tokens (e.g. hg_room_unit_101_664d22d61a15dea4)
   * 3. Fallback pattern matching for TABLE tokens (e.g. hg_table_tbl_boh_01_...)
   */
  public resolveToken(token: string): QrResourceRecord | null {
    if (!token) return null;

    // 1. Exact match in memory
    const resource = this.resources.find((r) => r.token === token);
    if (resource) {
      if (resource.revoked) return null;
      return resource;
    }

    // 2. Fallback matching for ROOM tokens: e.g. "hg_room_unit_101_664d22d61a15dea4"
    if (token.startsWith("hg_room_")) {
      const matchedRoom = this.roomUnits.find((u) => {
        const cleanId = u.id.replace(/-/g, "_");
        return token.includes(`hg_room_${cleanId}`) || token.includes(cleanId);
      });

      if (matchedRoom) {
        const prop = this.getPropertyDetails(matchedRoom.propertyId);
        const dynamicResource: QrResourceRecord = {
          id: `qr-room-${matchedRoom.id}`,
          propertyId: matchedRoom.propertyId,
          propertyName: prop.name,
          propertyCity: prop.city,
          propertyPhone: prop.phone,
          propertyEmail: prop.email,
          propertyAddress: prop.address,
          token,
          resourceType: "ROOM",
          unitId: matchedRoom.id,
          unitNumber: matchedRoom.unitNumber,
          roomName: matchedRoom.roomName,
          directUrl: `/order/${token}`,
          revoked: false,
          createdAt: new Date(),
        };
        this.resources.push(dynamicResource);
        return dynamicResource;
      }
    }

    // 3. Fallback matching for TABLE tokens: e.g. "hg_table_tbl_boh_01_..."
    if (token.startsWith("hg_table_")) {
      const matchedTable = this.diningTables.find((t) => {
        const cleanId = t.id.replace(/-/g, "_");
        return token.includes(`hg_table_${cleanId}`) || token.includes(cleanId);
      });

      if (matchedTable) {
        const prop = this.getPropertyDetails(matchedTable.propertyId);
        const dynamicResource: QrResourceRecord = {
          id: `qr-table-${matchedTable.id}`,
          propertyId: matchedTable.propertyId,
          propertyName: prop.name,
          propertyCity: prop.city,
          propertyPhone: prop.phone,
          propertyEmail: prop.email,
          propertyAddress: prop.address,
          token,
          resourceType: "TABLE",
          tableId: matchedTable.id,
          tableNumber: matchedTable.tableNumber,
          spaceName: matchedTable.spaceName,
          spaceType: matchedTable.spaceType,
          directUrl: `/order/${token}`,
          revoked: false,
          createdAt: new Date(),
        };
        this.resources.push(dynamicResource);
        return dynamicResource;
      }
    }

    return null;
  }

  public revokeToken(token: string): boolean {
    const resource = this.resources.find((r) => r.token === token);
    if (resource) {
      resource.revoked = true;
      return true;
    }
    return false;
  }

  public generateQrSvg(token: string, size = 260): string {
    const fullUrl = typeof window !== "undefined"
      ? `${window.location.origin}/order/${token}`
      : `https://hotelgestion.vercel.app/order/${token}`;
    return generateQrSvgString(fullUrl, { size });
  }

  /**
   * Generates the complete 8 cm x 14 cm vector SVG stand ready for print
   */
  public generateStandSvg(data: {
    propertyName: string;
    locationName: string; // e.g. "Restaurant" or "Suite Royale Le Vignoble"
    numberLabel: string;   // e.g. "Table 01" or "Chambre 101"
    token: string;
    phone?: string;
    email?: string;
  }): string {
    const fullUrl = typeof window !== "undefined"
      ? `${window.location.origin}/order/${data.token}`
      : `https://hotelgestion.vercel.app/order/${data.token}`;

    const matrix = generateQrMatrix(fullUrl);
    const matrixSize = matrix.length;
    const margin = 4;
    const viewBoxSize = matrixSize + margin * 2;

    let pathData = "";
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c]) {
          pathData += `M${c + margin},${r + margin}h1v1h-1z `;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1400" width="80mm" height="140mm" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, serif;">
  <!-- Background with delicate gradient and concentric borders -->
  <defs>
    <linearGradient id="standBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fdfbf7"/>
      <stop offset="100%" stop-color="#f8f4ec"/>
    </linearGradient>
    <linearGradient id="goldBorder" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#b8860b"/>
      <stop offset="35%" stop-color="#d4af37"/>
      <stop offset="65%" stop-color="#f5e1a4"/>
      <stop offset="100%" stop-color="#aa771c"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3c46"/>
      <stop offset="100%" stop-color="#4a151e"/>
    </linearGradient>
  </defs>

  <!-- Base Plate (80mm x 140mm) -->
  <rect x="0" y="0" width="800" height="1400" fill="url(#standBg)"/>

  <!-- Outer Double-Bezel Gold Border -->
  <rect x="18" y="18" width="764" height="1364" rx="24" fill="none" stroke="url(#goldBorder)" stroke-width="8"/>
  <rect x="32" y="32" width="736" height="1336" rx="16" fill="none" stroke="#d4af37" stroke-width="2" stroke-opacity="0.6"/>

  <!-- Corner Heraldic Ornaments -->
  <circle cx="48" cy="48" r="6" fill="#d4af37"/>
  <circle cx="752" cy="48" r="6" fill="#d4af37"/>
  <circle cx="48" cy="1352" r="6" fill="#d4af37"/>
  <circle cx="752" cy="1352" r="6" fill="#d4af37"/>

  <!-- 1. TOP LOGO & MEDALLION -->
  <g transform="translate(400, 115)">
    <circle cx="0" cy="0" r="48" fill="url(#badgeGrad)" stroke="#d4af37" stroke-width="4"/>
    <circle cx="0" cy="0" r="41" fill="none" stroke="#f5e1a4" stroke-width="1.5" stroke-dasharray="4,2"/>
    <text x="0" y="14" font-family="serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">V</text>
  </g>

  <!-- 2. AGENCY / PROPERTY NAME -->
  <text x="400" y="200" font-family="serif" font-size="28" font-weight="900" letter-spacing="4" fill="#181512" text-anchor="middle">HÔTEL LE VIGNOBLE</text>
  <text x="400" y="235" font-family="-apple-system, sans-serif" font-size="24" font-weight="700" fill="#7c3c46" text-anchor="middle">${data.propertyName}</text>

  <!-- Thin decorative gold line -->
  <line x1="260" y1="260" x2="540" y2="260" stroke="#d4af37" stroke-width="2"/>
  <polygon points="400,256 405,260 400,264 395,260" fill="#d4af37"/>

  <!-- 3. LOCATION & 4. NUMBER -->
  <rect x="200" y="280" width="400" height="42" rx="21" fill="#f5ede0" stroke="#d4af37" stroke-width="1.5"/>
  <text x="400" y="309" font-family="-apple-system, sans-serif" font-size="21" font-weight="700" fill="#5a3d12" text-anchor="middle">${data.locationName}</text>

  <text x="400" y="380" font-family="-apple-system, sans-serif" font-size="42" font-weight="900" letter-spacing="1" fill="#181512" text-anchor="middle">${data.numberLabel}</text>

  <!-- 5. GRAND FORMAT QR CODE -->
  <g transform="translate(150, 410)">
    <rect x="-10" y="-10" width="520" height="520" rx="20" fill="#ffffff" stroke="#e8ded1" stroke-width="4"/>
    <rect x="-2" y="-2" width="504" height="504" rx="14" fill="none" stroke="#d4af37" stroke-width="2"/>
    <svg x="10" y="10" width="480" height="480" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" shape-rendering="crispEdges">
      <path d="${pathData}" fill="#181512"/>
    </svg>
  </g>

  <!-- Scan Instruction -->
  <text x="400" y="975" font-family="-apple-system, sans-serif" font-size="20" font-weight="800" fill="#181512" text-anchor="middle">Scannez pour commander</text>
  <text x="400" y="1005" font-family="-apple-system, sans-serif" font-size="16" font-weight="500" fill="#78716c" text-anchor="middle">Boissons fraîches • Cuisine &amp; Repas • Cave à Vin</text>

  <!-- Separator -->
  <line x1="160" y1="1045" x2="640" y2="1045" stroke="#e7decb" stroke-width="1.5"/>

  <!-- 6. CONTACTS DE L'AGENCE -->
  <g transform="translate(400, 1085)" text-anchor="middle">
    <text x="0" y="0" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="#44403c">Réception &amp; Room-Service 24h/24</text>
    <text x="0" y="32" font-family="-apple-system, sans-serif" font-size="18" font-weight="800" fill="#7c3c46">Tél / WhatsApp : ${data.phone || "+229 97 00 11 22"}</text>
    <text x="0" y="62" font-family="-apple-system, sans-serif" font-size="15" font-weight="500" fill="#78716c">${data.email || "contact@hotel-levignoble.bj"}</text>
  </g>

  <!-- 7. BOTTOM MESSAGE: "Merci pour votre Fidélité" -->
  <rect x="120" y="1225" width="560" height="60" rx="30" fill="url(#badgeGrad)" stroke="#d4af37" stroke-width="2"/>
  <text x="400" y="1263" font-family="serif" font-size="22" font-weight="700" font-style="italic" fill="#ffffff" letter-spacing="1" text-anchor="middle">✦ Merci pour votre Fidélité ✦</text>

  <!-- Subtle scale indication at bottom edge -->
  <text x="400" y="1362" font-family="monospace" font-size="11" fill="#a8a29e" text-anchor="middle">FORMAT OFFICIEL 8 cm × 14 cm • HÔTEL LE VIGNOBLE</text>
</svg>`;
  }
}

export const qrService = new QrService();
