import { describe, it, expect, beforeEach } from "vitest";
import {
  clientsService,
  ClientRecord,
  ClientCategory,
  CLIENT_CATEGORY_LABELS,
} from "../modules/clients/clients-service";

describe("Clients Service & Multi-Site Management", () => {
  beforeEach(() => {
    // Reset to initial state
    clientsService.reset();
  });

  describe("listClients & Multi-Site Confinement", () => {
    it("should list all clients when no filters or ALL is specified", () => {
      const allClients = clientsService.listClients();
      expect(allClients.length).toBeGreaterThanOrEqual(10);
    });

    it("should strictly confine clients list to Manager's property (Bohicon)", () => {
      const bohiconClients = clientsService.listClients({ propertyId: "prop-bohicon-001" });
      expect(bohiconClients.length).toBeGreaterThan(0);
      bohiconClients.forEach((c) => {
        expect(c.propertyId).toBe("prop-bohicon-001");
      });
    });

    it("should strictly confine clients list to Manager's property (Abomey)", () => {
      const abomeyClients = clientsService.listClients({ propertyId: "prop-abomey-002" });
      expect(abomeyClients.length).toBeGreaterThan(0);
      abomeyClients.forEach((c) => {
        expect(c.propertyId).toBe("prop-abomey-002");
      });
    });

    it("should allow Promoter to view all properties using ALL", () => {
      const allClients = clientsService.listClients({ propertyId: "ALL" });
      const propertyIds = new Set(allClients.map((c) => c.propertyId));
      expect(propertyIds.size).toBeGreaterThan(1);
    });

    it("should filter clients by category correctly", () => {
      const vipClients = clientsService.listClients({ category: "VIP_PRESTIGE" });
      expect(vipClients.length).toBeGreaterThan(0);
      vipClients.forEach((c) => {
        expect(c.category).toBe("VIP_PRESTIGE");
      });

      const corporateClients = clientsService.listClients({ category: "CORPORATE" });
      expect(corporateClients.length).toBeGreaterThan(0);
      corporateClients.forEach((c) => {
        expect(c.category).toBe("CORPORATE");
      });
    });

    it("should filter clients by search query (name, phone, IFU)", () => {
      const searchByName = clientsService.listClients({ search: "Dossou" });
      expect(searchByName.length).toBeGreaterThan(0);
      expect(searchByName[0].fullName.toLowerCase()).toContain("dossou");

      const searchByIfu = clientsService.listClients({ search: "3201800123456" });
      expect(searchByIfu.length).toBeGreaterThan(0);
      expect(searchByIfu[0].taxId).toBe("3201800123456");
    });
  });

  describe("CRUD Operations", () => {
    it("should add a new client with complete fiscal details (IFU / RCCM)", () => {
      const newClient = clientsService.addClient({
        fullName: "Société Bénin Transit Maritime",
        category: "CORPORATE",
        phone: "+229 97 12 34 56",
        email: "contact@benintransit.bj",
        propertyId: "prop-bohicon-001",
        city: "Bohicon",
        country: "Bénin",
        taxId: "0202499988877",
        rccm: "RB/COT/24 B 9999",
        companyContactPerson: "M. Marcellin KPATOUKPA",
        preferences: "Facturation groupée fin de mois",
        totalSpendXof: 350000,
        visitsCount: 4,
        status: "ACTIF",
        notes: "Client grand compte",
      });

      expect(newClient.id).toBeDefined();
      expect(newClient.propertyName).toBe("Hôtel Le Vignoble - Bohicon");
      expect(newClient.taxId).toBe("0202499988877");

      const fetched = clientsService.getClientById(newClient.id);
      expect(fetched).toBeDefined();
      expect(fetched?.fullName).toBe("Société Bénin Transit Maritime");
    });

    it("should update an existing client", () => {
      const initial = clientsService.listClients()[0];
      const updated = clientsService.updateClient(initial.id, {
        notes: "Préférence suite présidentielle et service champagne",
        totalSpendXof: initial.totalSpendXof + 100000,
      });

      expect(updated?.notes).toBe("Préférence suite présidentielle et service champagne");
      expect(updated?.totalSpendXof).toBe(initial.totalSpendXof + 100000);
    });

    it("should delete a client", () => {
      const initial = clientsService.listClients()[0];
      const success = clientsService.deleteClient(initial.id);
      expect(success).toBe(true);

      const fetched = clientsService.getClientById(initial.id);
      expect(fetched).toBeUndefined();
    });
  });

  describe("Bulk Import (CSV / Excel)", () => {
    it("should import multiple clients and handle duplicate detection", () => {
      const countBefore = clientsService.listClients().length;

      const importBatch = [
        {
          fullName: "Ministère du Tourisme et de la Culture",
          category: "DELEGATION" as ClientCategory,
          phone: "+229 21 30 11 22",
          email: "protocole@tourisme.gouv.bj",
          propertyId: "prop-abomey-002",
          city: "Abomey",
          country: "Bénin",
          taxId: "0202400011223",
          companyContactPerson: "Chef du Protocole",
          preferences: "Protocole VIP officiel",
        },
        {
          fullName: "Agence Voyage & Découverte Zou",
          category: "TOUR_OPERATOR" as ClientCategory,
          phone: "+229 95 44 33 22",
          email: "circuits@decouverte-zou.bj",
          propertyId: "prop-bohicon-001",
          city: "Bohicon",
          country: "Bénin",
        },
      ];

      const result = clientsService.addClientsBulk(importBatch);
      expect(result.added.length).toBe(2);
      expect(result.duplicates).toBe(0);

      const countAfter = clientsService.listClients().length;
      expect(countAfter).toBe(countBefore + 2);

      // Attempting to re-import the exact same batch should detect duplicates by phone
      const reimportResult = clientsService.addClientsBulk(importBatch);
      expect(reimportResult.added.length).toBe(0);
      expect(reimportResult.duplicates).toBe(2);
    });

    it("should assign correct propertyName if not provided in raw row", () => {
      const result = clientsService.addClientsBulk([
        {
          fullName: "Client Sans Nom Agence Explicite",
          category: "PARTICULIER" as ClientCategory,
          phone: "+229 99 88 77 66",
          email: "sansnom@test.bj",
          propertyId: "prop-calavi-003",
        },
      ]);

      expect(result.added.length).toBe(1);
      expect(result.added[0].propertyName).toBe("Hôtel Le Vignoble - Abomey-Calavi");
    });
  });

  describe("KPIs & Statistics Calculation", () => {
    it("should return comprehensive stats for all properties", () => {
      const stats = clientsService.getStats("ALL");
      expect(stats.total).toBeGreaterThanOrEqual(10);
      expect(stats.vips).toBeGreaterThan(0);
      expect(stats.corporate).toBeGreaterThan(0);
      expect(stats.totalSpendXof).toBeGreaterThan(0);
    });

    it("should calculate stats specifically for a single property", () => {
      const bohiconStats = clientsService.getStats("prop-bohicon-001");
      const allStats = clientsService.getStats("ALL");

      expect(bohiconStats.total).toBeLessThanOrEqual(allStats.total);
      expect(bohiconStats.totalSpendXof).toBeLessThanOrEqual(allStats.totalSpendXof);
    });
  });

  describe("Category Labels Integrity", () => {
    it("should have valid human-readable labels for all 7 categories", () => {
      const categories: ClientCategory[] = [
        "PARTICULIER",
        "VIP_PRESTIGE",
        "CORPORATE",
        "DELEGATION",
        "TOUR_OPERATOR",
        "EVENEMENTIEL",
        "HABITUE",
      ];

      categories.forEach((cat) => {
        const info = CLIENT_CATEGORY_LABELS[cat];
        expect(info).toBeDefined();
        expect(info.label).toBeDefined();
        expect(info.badgeClass).toBeDefined();
      });
    });
  });
});
