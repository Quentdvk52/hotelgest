import { describe, it, expect, beforeEach } from "vitest";
import { pmsService } from "../modules/pms/pms-service";
import { TenantContext } from "../lib/types/common";

describe("PMS Service — Reservations, Availability & Check-in/out", () => {
  const context: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-rec-boh",
    roles: ["RECEPTIONIST"],
    permissions: ["pms:reservations:create", "pms:checkin:perform", "pms:checkout:perform"],
  };

  beforeEach(() => {
    pmsService.resetState();
  });

  it("checks availability and returns available units for given dates", async () => {
    const available = await pmsService.getAvailableUnits("prop-bohicon-001", "2026-12-01", "2026-12-05");
    expect(available.length).toBeGreaterThan(0);
    expect(available.map((u) => u.unitNumber)).toContain("101");
  });

  it("creates a confirmed reservation and updates availability", async () => {
    const reservation = await pmsService.createReservation(context, {
      propertyId: "prop-bohicon-001",
      guestName: "Koffi Mensah",
      guestPhone: "+229 97 12 34 56",
      guestEmail: "koffi@example.com",
      unitId: "unit-101",
      roomTypeId: "rt-std-boh",
      checkInDate: "2026-12-01",
      checkOutDate: "2026-12-05",
      numGuests: 2,
    });

    expect(reservation.id).toBeDefined();
    expect(reservation.status).toBe("CONFIRMED");
    expect(reservation.totalAmountXof).toBe(25000 * 4); // 4 nights at 25 000 XOF
  });

  it("strictly prevents overlapping reservations on the same unit (Review Focus #1)", async () => {
    // First booking: Dec 1 to Dec 5 on unit 101
    await pmsService.createReservation(context, {
      propertyId: "prop-bohicon-001",
      guestName: "Client A",
      guestPhone: "+229 97 11 11 11",
      unitId: "unit-101",
      roomTypeId: "rt-std-boh",
      checkInDate: "2026-12-01",
      checkOutDate: "2026-12-05",
      numGuests: 1,
    });

    // Second booking: Dec 3 to Dec 7 on same unit 101 -> MUST FAIL
    await expect(
      pmsService.createReservation(context, {
        propertyId: "prop-bohicon-001",
        guestName: "Client B",
        guestPhone: "+229 97 22 22 22",
        unitId: "unit-101",
        roomTypeId: "rt-std-boh",
        checkInDate: "2026-12-03",
        checkOutDate: "2026-12-07",
        numGuests: 1,
      })
    ).rejects.toThrow("OVERBOOKING_PREVENTED");
  });

  it("performs check-in and check-out with automatic folio opening", async () => {
    const res = await pmsService.createReservation(context, {
      propertyId: "prop-bohicon-001",
      guestName: "Awa Touré",
      guestPhone: "+229 97 33 33 33",
      unitId: "unit-201",
      roomTypeId: "rt-dlx-boh",
      checkInDate: "2026-12-10",
      checkOutDate: "2026-12-12",
      numGuests: 1,
    });

    // Check-in
    const stay = await pmsService.performCheckIn(context, res.id, "unit-201");
    expect(stay.status).toBe("ACTIVE");
    expect(stay.folioId).toBeDefined();

    // Verify room is marked OCCUPIED
    const room = pmsService.getUnitById("unit-201");
    expect(room?.status).toBe("OCCUPIED");

    // Check-out
    const checkOut = await pmsService.performCheckOut(context, stay.id);
    expect(checkOut.stay.status).toBe("COMPLETED");

    // Room is marked DIRTY for Housekeeping
    const roomAfter = pmsService.getUnitById("unit-201");
    expect(roomAfter?.status).toBe("AVAILABLE");
    expect(roomAfter?.housekeepingStatus).toBe("DIRTY");
  });
});
