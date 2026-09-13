import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

const ADMIN_JWT_SUBJECT = "local-admin";

function getSecretKey() {
  const secret = ENV.cookieSecret || "csp-sistemas-digitais-fallback-secret";
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(): Promise<string> {
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + 1000 * 60 * 60 * 24 * 30) / 1000);
  return new SignJWT({ sub: ADMIN_JWT_SUBJECT })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSecretKey());
}

export async function verifyAdminToken(cookieValue: string | undefined | null): Promise<boolean> {
  if (!cookieValue) return false;
  try {
    const { payload } = await jwtVerify(cookieValue, getSecretKey(), { algorithms: ["HS256"] });
    return payload.sub === ADMIN_JWT_SUBJECT;
  } catch {
    return false;
  }
}
