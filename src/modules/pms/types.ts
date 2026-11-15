export interface CreateReservationDto {
  propertyId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  unitId?: string;
  roomTypeId: string;
  ratePlanId?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numGuests: number;
}

export interface ReservationRecord {
  id: string;
  tenantId: string;
  propertyId: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  unitId?: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  numGuests: number;
  totalAmountXof: number;
  status: "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
  createdAt: Date;
}

export interface StayRecord {
  id: string;
  tenantId: string;
  propertyId: string;
  reservationId: string;
  unitId: string;
  guestId: string;
  folioId: string;
  actualCheckIn: Date;
  actualCheckOut?: Date;
  status: "ACTIVE" | "COMPLETED";
  createdAt: Date;
}

export interface UnitRecord {
  id: string;
  propertyId: string;
  roomTypeId: string;
  unitNumber: string;
  floor?: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "OUT_OF_ORDER";
  housekeepingStatus: "CLEAN" | "DIRTY" | "INSPECTED";
}
