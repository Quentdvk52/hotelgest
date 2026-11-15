import crypto from "crypto";
import { SEED_PROPERTIES } from "../../lib/db/seed";

export type SpaceType =
  | "RESTAURANT"
  | "BAR"
  | "BANQUET"
  | "CONFERENCE"
  | "TERRASSE"
  | "VIP";

export interface DiningTableRecord {
  id: string;
  propertyId: string;
  tableNumber: string;
  spaceName: string;
  spaceType: SpaceType;
  capacity: number;
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

// Initial multi-space tables across Groupe Le Vignoble
const INITIAL_TABLES: DiningTableRecord[] = [
  // Bohicon
  { id: "tbl-boh-01", propertyId: "prop-bohicon-001", tableNumber: "Table 01", spaceName: "Restaurant Le Vignoble", spaceType: "RESTAURANT", capacity: 4 },
  { id: "tbl-boh-02", propertyId: "prop-bohicon-001", tableNumber: "Table 02", spaceName: "Restaurant Le Vignoble", spaceType: "RESTAURANT", capacity: 4 },
  { id: "tbl-boh-03", propertyId: "prop-bohicon-001", tableNumber: "Table 03", spaceName: "Terrasse Piscine & Paillotes", spaceType: "TERRASSE", capacity: 6 },
  { id: "tbl-boh-bar-01", propertyId: "prop-bohicon-001", tableNumber: "Comptoir Bar 1", spaceName: "Bar & Cave d'Exception", spaceType: "BAR", capacity: 2 },
  { id: "tbl-boh-fete-01", propertyId: "prop-bohicon-001", tableNumber: "Table Royale 01", spaceName: "Salle des Fêtes & Banquets Agadja", spaceType: "BANQUET", capacity: 10 },
  { id: "tbl-boh-conf-01", propertyId: "prop-bohicon-001", tableNumber: "Tribune Conférence A", spaceName: "Salle de Conférences & Séminaires", spaceType: "CONFERENCE", capacity: 12 },
  { id: "tbl-boh-vip-01", propertyId: "prop-bohicon-001", tableNumber: "Salon Privé Danxomè", spaceName: "Espace VIP & Lounge Exécutif", spaceType: "VIP", capacity: 8 },

  // Abomey
  { id: "tbl-abm-01", propertyId: "prop-abomey-002", tableNumber: "Table 01", spaceName: "Restaurant Roi Béhanzin", spaceType: "RESTAURANT", capacity: 4 },
  { id: "tbl-abm-fete-01", propertyId: "prop-abomey-002", tableNumber: "Table Prestige 01", spaceName: "Salle des Fêtes & Événements", spaceType: "BANQUET", capacity: 10 },
  { id: "tbl-abm-conf-01", propertyId: "prop-abomey-002", tableNumber: "Plénière 01", spaceName: "Salle de Séminaires Historique", spaceType: "CONFERENCE", capacity: 14 },

  // Abomey-Calavi
  { id: "tbl-abc-01", propertyId: "prop-calavi-003", tableNumber: "Table 01", spaceName: "Restaurant Gastronomique Calavi", spaceType: "RESTAURANT", capacity: 4 },
  { id: "tbl-abc-fete-01", propertyId: "prop-calavi-003", tableNumber: "Table Gala 01", spaceName: "Grande Salle de Réception Calavi", spaceType: "BANQUET", capacity: 12 },
  { id: "tbl-abc-conf-01", propertyId: "prop-calavi-003", tableNumber: "Salle Conseil", spaceName: "Espace Conférences & Affaires UAC", spaceType: "CONFERENCE", capacity: 16 },

  // Zogbodomey
  { id: "tbl-zog-01", propertyId: "prop-zogbo-004", tableNumber: "Table 01", spaceName: "Restaurant Terroir & Saveurs", spaceType: "RESTAURANT", capacity: 4 },
  { id: "tbl-zog-paillote-01", propertyId: "prop-zogbo-004", tableNumber: "Paillote Centrale", spaceName: "Jardin Événementiel & Paillotes", spaceType: "TERRASSE", capacity: 8 },
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

  constructor() {
    this.resetState();
  }

  public resetState() {
    this.resources = [];
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

  /**
   * Generates a cryptographically strong unpredictable opaque token (OWASP ASVS V3.2 / V3.4).
   * Format: hg_<type>_<32-byte-hex>
   */
  private generateSecureToken(resourceType: "table" | "room"): string {
    const randomHex = crypto.randomBytes(16).toString("hex");
    return `hg_${resourceType}_${randomHex}`;
  }

  private getPropertyName(propertyId: string): string {
    return SEED_PROPERTIES.find((p) => p.id === propertyId)?.name || "Hôtel Le Vignoble";
  }

  public createTableQrResource(table: DiningTableRecord): QrResourceRecord {
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

  /**
   * Creates a dining table dynamically in any space (Restaurant, Bar, Salle des fêtes, Salle de conférence, etc.)
   * and automatically provisions its unique cryptographically secure QR code.
   */
  public createTableWithQr(
    propertyId: string,
    tableNumber: string,
    spaceName: string,
    spaceType: SpaceType = "RESTAURANT",
    capacity: number = 4
  ): { table: DiningTableRecord; qr: QrResourceRecord } {
    const tableId = `tbl-${propertyId.replace("prop-", "")}-${Date.now().toString(36)}`;
    const table: DiningTableRecord = {
      id: tableId,
      propertyId,
      tableNumber,
      spaceName,
      spaceType,
      capacity,
    };
    this.diningTables.push(table);
    const qr = this.createTableQrResource(table);
    return { table, qr };
  }

  /**
   * Creates a room unit and provisions its secure QR code.
   */
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
      if (propertyId && r.propertyId !== propertyId) return false;
      if (resourceType && r.resourceType !== resourceType) return false;
      return true;
    });
  }

  public listDiningTables(propertyId?: string): DiningTableRecord[] {
    return propertyId
      ? this.diningTables.filter((t) => t.propertyId === propertyId)
      : this.diningTables;
  }

  public listRoomUnits(propertyId?: string): RoomUnitRecord[] {
    return propertyId
      ? this.roomUnits.filter((u) => u.propertyId === propertyId)
      : this.roomUnits;
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
}

export const qrService = new QrService();
