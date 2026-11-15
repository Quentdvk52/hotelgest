import { SEED_DINING_TABLES, SEED_UNITS } from "../../lib/db/seed";

export interface QrResourceRecord {
  id: string;
  propertyId: string;
  token: string;
  resourceType: "TABLE" | "ROOM";
  tableId?: string;
  unitId?: string;
  tableNumber?: string;
  unitNumber?: string;
  revoked: boolean;
  createdAt: Date;
}

class QrService {
  private resources: QrResourceRecord[] = [];

  constructor() {
    this.resetState();
  }

  public resetState() {
    this.resources = [];
    // Pre-generate standard QRs for Bohicon tables
    SEED_DINING_TABLES.forEach((t) => {
      this.createQrResource(t.propertyId, "TABLE", t.id);
    });
    // Pre-generate room QRs
    SEED_UNITS.forEach((u) => {
      this.createQrResource(u.propertyId, "ROOM", u.id);
    });
  }

  public createQrResource(
    propertyId: string,
    resourceType: "TABLE" | "ROOM",
    targetId: string
  ): QrResourceRecord {
    // Generate secure opaque 32-char alphanumeric token
    const token = `hg_${resourceType.toLowerCase()}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 12)}`;

    let tableNumber: string | undefined;
    let unitNumber: string | undefined;

    if (resourceType === "TABLE") {
      tableNumber = SEED_DINING_TABLES.find((t) => t.id === targetId)?.tableNumber;
    } else {
      unitNumber = SEED_UNITS.find((u) => u.id === targetId)?.unitNumber;
    }

    const resource: QrResourceRecord = {
      id: `qr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      propertyId,
      token,
      resourceType,
      tableId: resourceType === "TABLE" ? targetId : undefined,
      unitId: resourceType === "ROOM" ? targetId : undefined,
      tableNumber,
      unitNumber,
      revoked: false,
      createdAt: new Date(),
    };

    this.resources.push(resource);
    return resource;
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
