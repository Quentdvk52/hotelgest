import crypto from "crypto";
import { envConfig } from "../../lib/config";

export function signCreatorToken(email: string): string {
  const payload = {
    email,
    role: "PLATFORM_CREATOR",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
  };
  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", envConfig.JWT_SECRET)
    .update(b64)
    .digest("base64url");
  return `${b64}.${sig}`;
}

export function verifyCreatorToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return false;
    const expected = crypto
      .createHmac("sha256", envConfig.JWT_SECRET)
      .update(b64)
      .digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return false;
    }
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf-8"));
    return payload.role === "PLATFORM_CREATOR" && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
