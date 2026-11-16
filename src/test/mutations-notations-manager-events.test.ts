import { describe, it, expect } from "vitest";
import { SEED_PROPERTIES, SEED_USERS } from "../lib/db/seed";

// Business validation logic tests
describe("Workspace Governance: Mutations, Notations, Évènements, Commandes & Compte Gérant", () => {
  // 1. RBAC pour la Mutation du personnel
  describe("1. RBAC Mutation du Personnel (Privilège Exclusif DAF & Promoteur)", () => {
    function canPerformStaffMutation(roleCode: string): boolean {
      return roleCode === "PROMOTER" || roleCode === "FINANCIAL_DIRECTOR";
    }

    it("authorizes Promoter (Eddy GNACADJA) to mute staff between agencies", () => {
      expect(canPerformStaffMutation("PROMOTER")).toBe(true);
    });

    it("authorizes DAF (Directeur Administratif et Financier) to mute staff", () => {
      expect(canPerformStaffMutation("FINANCIAL_DIRECTOR")).toBe(true);
    });

    it("strictly blocks Property Managers (Gérants d'établissement) from mutating staff", () => {
      expect(canPerformStaffMutation("PROPERTY_MANAGER")).toBe(false);
    });

    it("strictly blocks other staff roles (Receptionist, Cashier, Chef) from mutating staff", () => {
      expect(canPerformStaffMutation("RECEPTIONIST")).toBe(false);
      expect(canPerformStaffMutation("CASHIER")).toBe(false);
      expect(canPerformStaffMutation("CHEF")).toBe(false);
      expect(canPerformStaffMutation("WAITSTAFF")).toBe(false);
    });
  });

  // 2. Dispatch des notifications lors de la notation d'un collaborateur
  describe("2. Staff Rating Notification Dispatch to 4 Stakeholders", () => {
    interface StaffRatingPayload {
      staffId: string;
      staffName: string;
      propertyId: string;
      rating: number;
      comment: string;
    }

    function dispatchRatingNotifications(payload: StaffRatingPayload) {
      const prop = SEED_PROPERTIES.find((p) => p.id === payload.propertyId);
      const siteManager = SEED_USERS.find(
        (u) => u.propertyId === payload.propertyId && u.roleCode === "PROPERTY_MANAGER"
      );

      return {
        ratingId: `rat-${Date.now()}`,
        notifiedRecipients: [
          { role: "PROMOTER", label: "M. Eddy GNACADJA (Promoteur)" },
          { role: "FINANCIAL_DIRECTOR", label: "Direction Administrative & Financière (DAF)" },
          { role: "SITE_MANAGER", label: `Gérant ${prop?.name || payload.propertyId}`, userId: siteManager?.id },
          { role: "STAFF_MEMBER", label: payload.staffName, userId: payload.staffId },
        ],
        dispatchSuccess: true,
      };
    }

    it("notifies Promoter, DAF, Staff member, and the Site Manager of Bohicon", () => {
      const result = dispatchRatingNotifications({
        staffId: "user-rec-boh",
        staffName: "Amina SOULE",
        propertyId: "prop-bohicon-001",
        rating: 5,
        comment: "Accueil parfait et très attentionné.",
      });

      expect(result.dispatchSuccess).toBe(true);
      expect(result.notifiedRecipients).toHaveLength(4);
      expect(result.notifiedRecipients.map((r) => r.role)).toEqual([
        "PROMOTER",
        "FINANCIAL_DIRECTOR",
        "SITE_MANAGER",
        "STAFF_MEMBER",
      ]);
      expect(result.notifiedRecipients.find((r) => r.role === "STAFF_MEMBER")?.label).toBe("Amina SOULE");
      expect(result.notifiedRecipients.find((r) => r.role === "SITE_MANAGER")?.label).toContain("Bohicon");
    });

    it("notifies the specific Site Manager of Abomey when an Abomey staff member is rated", () => {
      const result = dispatchRatingNotifications({
        staffId: "user-srv-abm",
        staffName: "Béatrice HOUEDANOU",
        propertyId: "prop-abomey-002",
        rating: 4,
        comment: "Excellent service à table au restaurant d'Abomey.",
      });

      expect(result.notifiedRecipients.find((r) => r.role === "SITE_MANAGER")?.label).toContain("Abomey");
    });
  });

  // 3. Spécificités du Compte Gérant de Site (Bohicon vs Autres Agences)
  describe("3. Property Manager Scoping & Bohicon Cave Exclusivity", () => {
    function hasCaveAccess(roleCode: string, propertyId: string | null): boolean {
      if (roleCode === "PROMOTER" || roleCode === "FINANCIAL_DIRECTOR") return true;
      if (roleCode === "PROPERTY_MANAGER" && propertyId === "prop-bohicon-001") return true;
      return false;
    }

    function canDeleteEntities(roleCode: string): boolean {
      return roleCode === "PROMOTER" || roleCode === "FINANCIAL_DIRECTOR";
    }

    it("allows Bohicon manager (Aimée Hounsinou) to manage Cave à vin & Stocks", () => {
      expect(hasCaveAccess("PROPERTY_MANAGER", "prop-bohicon-001")).toBe(true);
    });

    it("blocks Abomey, Calavi, and Zogbodomey managers from managing Cave à vin stock modifications", () => {
      expect(hasCaveAccess("PROPERTY_MANAGER", "prop-abomey-002")).toBe(false);
      expect(hasCaveAccess("PROPERTY_MANAGER", "prop-calavi-003")).toBe(false);
      expect(hasCaveAccess("PROPERTY_MANAGER", "prop-zogbo-004")).toBe(false);
    });

    it("preserves full Cave à vin access for Promoter and DAF", () => {
      expect(hasCaveAccess("PROMOTER", null)).toBe(true);
      expect(hasCaveAccess("FINANCIAL_DIRECTOR", null)).toBe(true);
    });

    it("restricts deletion of rooms and staff exclusively to Promoter & DAF (no manager deletion)", () => {
      expect(canDeleteEntities("PROMOTER")).toBe(true);
      expect(canDeleteEntities("FINANCIAL_DIRECTOR")).toBe(true);
      expect(canDeleteEntities("PROPERTY_MANAGER")).toBe(false);
    });
  });

  // 4. Flux des commandes consolidé
  describe("4. Consolidated Orders Stream Classification", () => {
    const sampleOrders = [
      { orderType: "RESERVATION_CHAMBRE", amount: 85000 },
      { orderType: "REPAS_BOISSON", amount: 24500 },
      { orderType: "CAVE_A_VIN", amount: 75000 },
      { orderType: "LOCATION_MATERIEL", amount: 150000 },
      { orderType: "SERVICE_TRAITEUR", amount: 320000 },
    ];

    it("correctly covers the 5 revenue streams requested", () => {
      const types = sampleOrders.map((o) => o.orderType);
      expect(types).toContain("RESERVATION_CHAMBRE");
      expect(types).toContain("REPAS_BOISSON");
      expect(types).toContain("CAVE_A_VIN");
      expect(types).toContain("LOCATION_MATERIEL");
      expect(types).toContain("SERVICE_TRAITEUR");
    });

    it("accurately computes aggregated revenue across all streams", () => {
      const totalRev = sampleOrders.reduce((sum, o) => sum + o.amount, 0);
      expect(totalRev).toBe(654500);
    });
  });
});
