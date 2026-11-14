import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "billflow-secure-session-secret-2026";

export const ALLOWED_USER = {
  email: process.env.ADMIN_EMAIL || "akhiln6@gmail.com",
  password: process.env.ADMIN_PASSWORD || "123456",
  name: "Akhil",
};

export function createSessionToken(email: string): string {
  const payload = {
    email: email.toLowerCase().trim(),
    createdAt: Date.now(),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(
  token: string | undefined | null
): { email: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [data, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(data)
    .digest("base64url");

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    // 30 days session validity
    if (Date.now() - payload.createdAt > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }
    return { email: payload.email };
  } catch {
    return null;
  }
}

