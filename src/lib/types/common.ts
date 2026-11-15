export type CurrencyCode = "XOF" | "EUR" | "USD";

export interface MoneyAmount {
  amount: number; // in sub-units (cents) or base units if zero-decimal currency
  currency: CurrencyCode;
}

export interface TenantContext {
  tenantId: string;
  organizationId: string;
  propertyId: string; // active site (e.g. Bohicon, Abomey, etc.)
  userId: string;
  roles: string[];
  permissions: string[];
}

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Format money cleanly according to currency rules.
 * For XOF (Franc CFA), it is formatted as "100 000 XOF" for clear, unambiguous reporting.
 */
export function formatMoney(amount: number, currency: CurrencyCode = "XOF"): string {
  const numberStr = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: currency === "XOF" ? 0 : 2,
    minimumFractionDigits: currency === "XOF" ? 0 : 2,
  })
    .format(amount)
    .replace(/[\u00a0\u202f]/g, " ");

  return `${numberStr} ${currency}`;
}

/**
 * Converts a string decimal representation (e.g. "150.50") to integer cents (15050).
 */
export function parseMoneyToCents(decimalStr: string): number {
  const parsed = parseFloat(decimalStr);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * Converts integer cents (15050) to exact 2-decimal string ("150.50").
 */
export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}
