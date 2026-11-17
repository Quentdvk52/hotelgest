import crypto from "crypto";
import { SEED_PROPERTIES } from "../../lib/db/seed";
import { generateQrSvgString } from "../../lib/qr/qr-generator";

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

  private getPropertyName(propertyId: string): string {
    return SEED_PROPERTIES.find((p) => p.id === propertyId)?.name || "Hôtel Le Vignoble";
  }

  public createTableQrResource(table: DiningTableRecord): QrResourceRecord {
    // Check if an active token already exists for this table
    const existing = this.resources.find((r) => r.tableId === table.id && !r.revoked);
    if (existing) return existing;

    const token = `hg_table_${table.id.replace(/-/g, "_")}_${crypto.randomBytes(8).toString("hex")}`;
    const resource: QrResourceRecord = {
      id: `qr-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      propertyId: table.propertyId,
      propertyName: this.getPropertyName(table.propertyId),
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
    // Check if an active token already exists for this room
    const existing = this.resources.find((r) => r.unitId === unit.id && !r.revoked);
    if (existing) return existing;

    const token = `hg_room_${unit.id.replace(/-/g, "_")}_${crypto.randomBytes(8).toString("hex")}`;
    const resource: QrResourceRecord = {
      id: `qr-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      propertyId: unit.propertyId,
      propertyName: this.getPropertyName(unit.propertyId),
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

  public resolveToken(token: string): QrResourceRecord | null {
    const resource = this.resources.find((r) => r.token === token);
    if (!resource || resource.revoked) {
      return null;
    }
    return resource;
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
}

export const qrService = new QrService();
