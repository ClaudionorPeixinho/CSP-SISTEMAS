import { ADMIN_COOKIE_NAME } from "@shared/const";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import type { User } from "../../drizzle/schema";
import { verifyAdminToken } from "./adminAuth";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function buildLocalAdminUser(): User {
  const now = new Date();
  return {
    id: -1,
    openId: "local-admin",
    name: "Administrador",
    email: null,
    loginMethod: "password",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  } as User;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (!user) {
    const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
    const isAdmin = await verifyAdminToken(cookies[ADMIN_COOKIE_NAME]);
    if (isAdmin) user = buildLocalAdminUser();
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
