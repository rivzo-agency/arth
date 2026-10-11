import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type AdminUser = {
  displayName: string;
  email: string;
};

export const ADMIN_COOKIE = "antriksh_admin_session";

type SessionPayload = AdminUser & {
  expiresAt: number;
};

function configuredSecret() {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function verifyAdminCredentials(email: string, password: string): AdminUser | null {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedEmail || !expectedPassword || !configuredSecret()) return null;
  if (!safeEqual(email.trim().toLowerCase(), expectedEmail) || !safeEqual(password, expectedPassword)) return null;

  return {
    email: expectedEmail,
    displayName: process.env.ADMIN_NAME?.trim() || "ANTRIKSH Admin",
  };
}

export function createAdminSession(user: AdminUser, remember: boolean) {
  const secret = configuredSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters.");
  const expiresAt = Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000;
  const encodedPayload = Buffer.from(JSON.stringify({ ...user, expiresAt } satisfies SessionPayload)).toString("base64url");
  return {
    token: `${encodedPayload}.${sign(encodedPayload, secret)}`,
    expiresAt,
  };
}

function verifySessionToken(token: string): AdminUser | null {
  const secret = configuredSecret();
  if (!secret) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload, secret))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.email || !payload.displayName || payload.expiresAt <= Date.now()) return null;
    return { email: payload.email, displayName: payload.displayName };
  } catch {
    return null;
  }
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}
