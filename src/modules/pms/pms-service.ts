import { TenantContext } from "../../lib/types/common";
import { checkPermission } from "../../lib/auth/rbac";
import { createAuditLogEntry } from "../../lib/audit/logger";
import { SEED_UNITS, SEED_ROOM_TYPES } from "../../lib/db/seed";
import { CreateReservationDto, ReservationRecord, StayRecord, UnitRecord } from "./types";

class PmsService {
  private units: UnitRecord[] = [];
  private reservations: ReservationRecord[] = [];
  private stays: StayRecord[] = [];

  constructor() {
    this.resetState();
  }

  public resetState() {
    this.units = SEED_UNITS.map((u) => ({
      ...u,
      status: "AVAILABLE",
      housekeepingStatus: "CLEAN",
    }));
    this.reservations = [];
    this.stays = [];
  }

  public getUnitsByProperty(propertyId: string): UnitRecord[] {
    return this.units.filter((u) => u.propertyId === propertyId);
  }

  public getUnitById(unitId: string): UnitRecord | undefined {
    return this.units.find((u) => u.id === unitId);
  }

  public getReservationsByProperty(propertyId: string): ReservationRecord[] {
    return this.reservations.filter((r) => r.propertyId === propertyId);
  }

  public getStaysByProperty(propertyId: string): StayRecord[] {
    return this.stays.filter((s) => s.propertyId === propertyId);
  }

  public async getAvailableUnits(
    propertyId: string,
    checkInDate: string,
    checkOutDate: string,
    roomTypeId?: string
  ): Promise<UnitRecord[]> {
    const candidateUnits = this.units.filter((u) => {
      if (u.propertyId !== propertyId) return false;
      if (roomTypeId && u.roomTypeId !== roomTypeId) return false;
      return u.status !== "MAINTENANCE" && u.status !== "OUT_OF_ORDER";
    });

    const bookedUnitIds = new Set(
      this.reservations
        .filter((r) => {
          if (r.propertyId !== propertyId) return false;
          if (r.status === "CANCELLED" || r.status === "CHECKED_OUT") return false;
          // Check date overlap: (checkInDate < r.checkOutDate) && (checkOutDate > r.checkInDate)
          return checkInDate < r.checkOutDate && checkOutDate > r.checkInDate;
        })
        .map((r) => r.unitId)
        .filter((id): id is string => Boolean(id))
    );

    return candidateUnits.filter((u) => !bookedUnitIds.has(u.id));
  }

  public async createReservation(
    context: TenantContext,
    dto: CreateReservationDto
  ): Promise<ReservationRecord> {
    if (!checkPermission(context, "pms:reservations:create", dto.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit de création de réservation insuffisant.");
    }

    const roomType = SEED_ROOM_TYPES.find((rt) => rt.id === dto.roomTypeId);
    if (!roomType) {
      throw new Error("NOT_FOUND: Catégorie de chambre introuvable.");
    }

    // Overlap verification if unitId specified
    if (dto.unitId) {
      const hasOverlap = this.reservations.some((r) => {
        if (r.unitId !== dto.unitId) return false;
        if (r.status === "CANCELLED" || r.status === "CHECKED_OUT") return false;
        return dto.checkInDate < r.checkOutDate && dto.checkOutDate > r.checkInDate;
      });

      if (hasOverlap) {
        throw new Error(
          "OVERBOOKING_PREVENTED: La chambre est déjà réservée ou occupée sur cette période."
        );
      }
    }

    const nights = Math.max(
      1,
      Math.round(
        (new Date(dto.checkOutDate).getTime() - new Date(dto.checkInDate).getTime()) /
          (1000 * 3600 * 24)
      )
    );

    const totalAmount = nights * roomType.basePriceXof;

    const reservation: ReservationRecord = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId: context.tenantId,
      propertyId: dto.propertyId,
      guestId: `guest-${Date.now()}`,
      guestName: dto.guestName,
      guestPhone: dto.guestPhone,
      guestEmail: dto.guestEmail,
      unitId: dto.unitId,
      roomTypeId: dto.roomTypeId,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      numGuests: dto.numGuests,
      totalAmountXof: totalAmount,
      status: "CONFIRMED",
      createdAt: new Date(),
    };

    this.reservations.push(reservation);

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: dto.propertyId,
      userId: context.userId,
      action: "RESERVATION_CREATE",
      entityType: "RESERVATION",
      entityId: reservation.id,
      details: {
        guestName: dto.guestName,
        checkInDate: dto.checkInDate,
        checkOutDate: dto.checkOutDate,
        totalAmountXof: totalAmount,
      },
    });

    return reservation;
  }

  public async performCheckIn(
    context: TenantContext,
    reservationId: string,
    unitId: string
  ): Promise<StayRecord> {
    const reservation = this.reservations.find((r) => r.id === reservationId);
    if (!reservation) {
      throw new Error("NOT_FOUND: Réservation introuvable.");
    }

    if (!checkPermission(context, "pms:checkin:perform", reservation.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit de check-in insuffisant.");
    }

    const unit = this.units.find((u) => u.id === unitId);
    if (!unit) {
      throw new Error("NOT_FOUND: Chambre introuvable.");
    }

    unit.status = "OCCUPIED";
    reservation.status = "CHECKED_IN";
    reservation.unitId = unitId;

    const folioId = `fol-${reservation.id}`;
    const stay: StayRecord = {
      id: `stay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId: context.tenantId,
      propertyId: reservation.propertyId,
      reservationId: reservation.id,
      unitId: unit.id,
      guestId: reservation.guestId,
      folioId: folioId,
      actualCheckIn: new Date(),
      status: "ACTIVE",
      createdAt: new Date(),
    };

    this.stays.push(stay);

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: reservation.propertyId,
      userId: context.userId,
      action: "STAY_CHECKIN",
      entityType: "STAY",
      entityId: stay.id,
      details: { reservationId, unitNumber: unit.unitNumber, guestName: reservation.guestName },
    });

    return stay;
  }

  public async performCheckOut(
    context: TenantContext,
    stayId: string
  ): Promise<{ stay: StayRecord; unit: UnitRecord }> {
    const stay = this.stays.find((s) => s.id === stayId);
    if (!stay) {
      throw new Error("NOT_FOUND: Séjour actif introuvable.");
    }

    if (!checkPermission(context, "pms:checkout:perform", stay.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit de check-out insuffisant.");
    }

    stay.status = "COMPLETED";
    stay.actualCheckOut = new Date();

    const reservation = this.reservations.find((r) => r.id === stay.reservationId);
    if (reservation) {
      reservation.status = "CHECKED_OUT";
    }

    const unit = this.units.find((u) => u.id === stay.unitId);
    if (unit) {
      unit.status = "AVAILABLE";
      unit.housekeepingStatus = "DIRTY"; // Ready for cleaning
    }

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: stay.propertyId,
      userId: context.userId,
      action: "STAY_CHECKOUT",
      entityType: "STAY",
      entityId: stay.id,
      details: { unitId: stay.unitId },
    });

    return { stay, unit: unit! };
  }
}

export const pmsService = new PmsService();
