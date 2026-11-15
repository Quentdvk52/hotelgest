import { describe, it, expect } from "vitest";
import { formatMoney, parseMoneyToCents, centsToDecimalString } from "../lib/types/common";
import { envConfig } from "../lib/config";

describe("Configuration & Money Utilities", () => {
  it("formats XOF amounts correctly without decimal places", () => {
    // 100 000 XOF should be formatted clearly
    const formatted = formatMoney(100000, "XOF");
    expect(formatted).toContain("100");
    expect(formatted).toContain("XOF");
  });

  it("converts decimal money to integer cents and vice versa safely", () => {
    expect(parseMoneyToCents("150.50")).toBe(15050);
    expect(centsToDecimalString(15050)).toBe("150.50");
    expect(parseMoneyToCents("1000")).toBe(100000);
    expect(centsToDecimalString(100000)).toBe("1000.00");
  });

  it("validates core environment configuration defaults", () => {
    expect(envConfig.DEFAULT_CURRENCY).toBe("XOF");
    expect(envConfig.DEFAULT_LOCALE).toBe("fr");
    expect(envConfig.CHARIOW_PLANS.MONTHLY_XOF).toBe(100000);
    expect(envConfig.CHARIOW_PLANS.SEMIANNUAL_XOF).toBe(540000);
    expect(envConfig.CHARIOW_PLANS.ANNUAL_XOF).toBe(840000);
  });
});
