import { describe, it, expect, beforeEach } from "vitest";
import { cateringService } from "../modules/catering-equipment/catering-service";
import { equipmentService } from "../modules/catering-equipment/equipment-service";
import { TenantContext } from "../lib/types/common";

describe("Module Service Traiteur & Location de Matériel Événementiel", () => {
  const context: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-dir-boh",
    roles: ["PROPERTY_MANAGER"],
    permissions: [
      "catering:orders:create",
      "catering:orders:manage",
      "equipment:rentals:create",
      "equipment:rentals:manage",
      "equipment:inspections:perform",
      "folios:charges:add",
    ],
  };

  beforeEach(() => {
    cateringService.resetState();
    equipmentService.resetState();
  });

  describe("Service Traiteur", () => {
    it("creates a catering quote/order with portions, delivery fee, and service type", async () => {
      const order = await cateringService.createCateringOrder(context, {
        propertyId: "prop-bohicon-001",
        clientName: "Ministère du Tourisme / Conférence",
        clientPhone: "+229 97 55 66 77",
        clientEmail: "tourisme@gouv.bj",
        eventDate: "2026-12-15",
        eventTime: "12:30",
        deliveryLocation: "Palais des Congrès, Bohicon",
        serviceType: "PRESTATION_AVEC_PERSONNEL",
        guestCount: 50,
        dietaryNotes: "10 repas sans fruits de mer",
        specialInstructions: "Mise en place à 11h30 précises",
        menuId: "cat-menu-01", // Buffet Prestige Béninois (12 000 XOF/pers)
        items: [
          { name: "Buffet Prestige Béninois", quantityPortions: 50, unitPriceXof: 12000 },
        ],
        deliveryFeeXof: 15000,
      });

      expect(order.id).toBeDefined();
      expect(order.orderNumber).toContain("TRT-");
      expect(order.subtotalXof).toBe(600000); // 50 * 12 000
      expect(order.deliveryFeeXof).toBe(15000);
      expect(order.totalAmountXof).toBe(615000);
      expect(order.status).toBe("DEMANDE_RECUE");
    });

    it("advances catering workflow and assigns staff and delivery vehicle", async () => {
      const order = await cateringService.createCateringOrder(context, {
        propertyId: "prop-bohicon-001",
        clientName: "Entreprise SOGEA",
        clientPhone: "+229 97 88 99 00",
        eventDate: "2026-12-18",
        eventTime: "19:00",
        deliveryLocation: "Siège Entreprise",
        serviceType: "LIVRAISON",
        guestCount: 20,
        items: [{ name: "Cocktail Dînatoire", quantityPortions: 20, unitPriceXof: 8500 }],
      });

      // Update status to CONFIRMEE with staff & vehicle
      const confirmed = await cateringService.updateCateringStatus(context, order.id, {
        status: "CONFIRMEE",
        assignedStaff: "Chantal Tossou (Responsable service) + 2 serveurs",
        assignedVehicle: "Fourgonnette Isuzu Le Vignoble (Immat BJ-4567-RB)",
      });

      expect(confirmed.status).toBe("CONFIRMEE");
      expect(confirmed.assignedStaff).toContain("Chantal");
      expect(confirmed.assignedVehicle).toContain("Isuzu");
    });
  });

  describe("Location de Matériel Événementiel", () => {
    it("checks real-time equipment availability and strictly prevents overbooking (Review Focus #1)", async () => {
      // Bohicon has 300 Chaises Napoléon in total stock
      const availableBefore = await equipmentService.getAvailableQuantity(
        "prop-bohicon-001",
        "eq-chaise-nap",
        "2026-12-20",
        "2026-12-22"
      );
      expect(availableBefore).toBe(300);

      // Book 250 chaises for Dec 20 to Dec 22
      await equipmentService.createRental(context, {
        propertyId: "prop-bohicon-001",
        clientName: "Mariage Famille Dossou",
        clientPhone: "+229 97 12 00 00",
        startDate: "2026-12-20",
        endDate: "2026-12-22",
        eventLocation: "Jardin des Fêtes, Bohicon",
        items: [
          { itemId: "eq-chaise-nap", quantity: 250 }, // 250 units booked
        ],
      });

      // Remaining stock on that date is now 50
      const availableAfter = await equipmentService.getAvailableQuantity(
        "prop-bohicon-001",
        "eq-chaise-nap",
        "2026-12-20",
        "2026-12-22"
      );
      expect(availableAfter).toBe(50);

      // Attempting to book 60 chaises on the same dates -> MUST FAIL WITH INSUFFICIENT STOCK
      await expect(
        equipmentService.createRental(context, {
          propertyId: "prop-bohicon-001",
          clientName: "Autre Client",
          clientPhone: "+229 97 33 00 00",
          startDate: "2026-12-21",
          endDate: "2026-12-23",
          eventLocation: "Salle des fêtes",
          items: [{ itemId: "eq-chaise-nap", quantity: 60 }],
        })
      ).rejects.toThrow("EQUIPMENT_STOCK_EXCEEDED");
    });

    it("manages departure and return inspections, damaged equipment, and caution retention (Review Focus #2)", async () => {
      // Rental of 10 Tables Rondes + 100 Couverts Dorés
      // Tables caution = 10 * 10 000 = 100 000 XOF
      // Couverts caution = 100 * 1 000 = 100 000 XOF
      // Total caution = 200 000 XOF
      const rental = await equipmentService.createRental(context, {
        propertyId: "prop-bohicon-001",
        clientName: "Gala d'Excellence",
        clientPhone: "+229 97 99 88 77",
        startDate: "2026-12-25",
        endDate: "2026-12-26",
        eventLocation: "Hôtel Le Vignoble Esplanade",
        items: [
          { itemId: "eq-table-ronde", quantity: 10 },
          { itemId: "eq-couverts-dor", quantity: 100 },
        ],
      });

      expect(rental.totalDepositXof).toBe(200000);

      // 1. État des lieux au départ (Remise du matériel)
      const departureInspection = await equipmentService.performInspection(context, {
        rentalId: rental.id,
        type: "DEPART",
        comments: "Tout le matériel remis en parfait état et compté avec le client.",
        damagedCount: 0,
        lostCount: 0,
      });
      expect(departureInspection.type).toBe("DEPART");

      // Rental status is now DISPATCHED
      const updatedRental = equipmentService.getRentalById(rental.id);
      expect(updatedRental?.status).toBe("DISPATCHED");

      // 2. État des lieux au retour (Récupération du matériel avec 5 couverts perdus et 1 table endommagée)
      // Replacement cost couvert = 6 000 XOF each -> 5 * 6 000 = 30 000 XOF
      // Damage fee table = 15 000 XOF
      // Total retained from deposit = 45 000 XOF
      // Deposit refund = 200 000 - 45 000 = 155 000 XOF
      const returnInspection = await equipmentService.performInspection(context, {
        rentalId: rental.id,
        type: "RETOUR",
        damagedCount: 1,
        lostCount: 5,
        damageFeeAssessedXof: 45000,
        comments: "5 couverts manquants non retrouvés, 1 table ronde avec pied tordu.",
      });

      expect(returnInspection.type).toBe("RETOUR");
      expect(returnInspection.damageFeeAssessedXof).toBe(45000);

      const finalizedRental = equipmentService.getRentalById(rental.id);
      expect(finalizedRental?.status).toBe("RETURNED_DAMAGED");
      expect(finalizedRental?.depositRetainedXof).toBe(45000);
      expect(finalizedRental?.depositRefundedXof).toBe(155000);
    });
  });
});
