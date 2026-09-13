import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("applications", () => {
  it("returns the public demo catalog", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.applications.list();
    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result.some((application) => application.slug === "gestao-inteligente")).toBe(true);
    expect(result.every((application) => application.status === "available")).toBe(true);
  });

  it("resolves a detail page by slug", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.applications.bySlug({ slug: "dashboard-analytics" });
    expect(result?.name).toBe("Dashboard Analytics");
    expect(result?.features).toContain("Métricas personalizáveis");
  });

  it("rejects malformed contact messages before persistence", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.contact.submit({ name: "A", email: "not-an-email", message: "curta" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
