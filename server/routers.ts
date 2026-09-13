import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ADMIN_COOKIE_NAME, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { signAdminToken } from "./_core/adminAuth";
import { getAdminCookieOptions, getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { localStorePut } from "./localUpload";
import { localGetVisitCount, localRecordVisit } from "./localStore";
import { storagePut } from "./storage";
import { createApplication, createContactMessage, deleteApplication, getApplicationBySlug, listAllApplications, listApplications, updateApplication } from "./db";

const applicationFields = {
  slug: z.string().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2).max(160),
  category: z.string().min(2).max(80),
  shortDescription: z.string().min(10).max(320),
  fullDescription: z.string().min(10).max(2000),
  imageUrl: z.string().url(),
  imageKey: z.string().max(512).optional().nullable(),
  appUrl: z.string().url(),
  buttonLabel: z.string().min(2).max(80),
  status: z.enum(["available", "paused"]),
  featured: z.boolean(),
  displayOrder: z.number().int().min(0),
  features: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
};

const createApplicationInput = z.object(applicationFields);
const updateApplicationInput = z.object({ id: z.number().int(), data: z.object(applicationFields).partial() });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    adminLogin: publicProcedure.input(z.object({ password: z.string().min(1) })).mutation(async ({ input, ctx }) => {
      if (!ENV.adminPassword) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Defina ADMIN_PASSWORD no arquivo .env do servidor." });
      }
      if (input.password !== ENV.adminPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha incorreta." });
      }
      const token = await signAdminToken();
      const cookieOptions = getAdminCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      const adminCookieOptions = getAdminCookieOptions(ctx.req);
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...adminCookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  applications: router({
    list: publicProcedure.query(() => listApplications()),
    listAll: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return listAllApplications();
    }),
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(({ input }) => getApplicationBySlug(input.slug)),
    create: adminProcedure.input(createApplicationInput).mutation(({ input }) => createApplication(input)),
    update: adminProcedure.input(updateApplicationInput).mutation(({ input }) => updateApplication(input.id, input.data)),
    remove: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteApplication(input.id)),
    uploadImage: adminProcedure.input(z.object({ fileName: z.string().min(1).max(180), dataUrl: z.string().startsWith("data:image/").max(12_000_000) })).mutation(async ({ input, ctx }) => {
      const match = input.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Imagem inválida." });
      const buffer = Buffer.from(match[2], "base64");
      if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
        const stored = localStorePut(input.fileName, buffer);
        // imageUrl is validated as an absolute URL, so turn the local /uploads/...
        // path into one using this request's own host (works for localhost and LAN IPs alike).
        const origin = `${ctx.req.protocol}://${ctx.req.get("host")}`;
        return { key: stored.key, url: `${origin}${stored.url}` };
      }
      const extension = input.fileName.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
      const key = `application-images/${ctx.user.id}-${Date.now()}.${extension}`;
      const stored = await storagePut(key, buffer, match[1]);
      return stored;
    }),
  }),
  stats: router({
    get: publicProcedure.query(() => ({ totalVisits: localGetVisitCount() })),
    recordVisit: publicProcedure.mutation(() => ({ totalVisits: localRecordVisit() })),
  }),
  contact: router({
    submit: publicProcedure.input(z.object({
      name: z.string().min(2).max(160),
      company: z.string().max(160).optional(),
      email: z.string().email().max(320),
      phone: z.string().max(40).optional(),
      message: z.string().min(10).max(3000),
    })).mutation(({ input }) => createContactMessage(input)),
  }),
});

export type AppRouter = typeof appRouter;
