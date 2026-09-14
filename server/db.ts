import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { applications, contactMessages, InsertApplication, InsertContactMessage, InsertSettings, InsertUser, settings, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import {
  localCreateApplication,
  localCreateContactMessage,
  localDeleteApplication,
  localGetApplicationBySlug,
  localGetSettings,
  localListAllApplications,
  localListApplications,
  localUpdateApplication,
  localUpdateSettings,
} from "./localStore";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

const demoApplications: InsertApplication[] = [
  {
    slug: "gestao-inteligente",
    name: "Gestão Inteligente",
    category: "Gestão",
    shortDescription: "Organize rotinas, prioridades e indicadores em um único lugar.",
    fullDescription: "Uma visão clara da operação para transformar tarefas espalhadas em uma rotina organizada, com decisões mais rápidas e acompanhamento simples.",
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82",
    appUrl: "https://example.com/gestao-inteligente",
    buttonLabel: "ABRIR APLICATIVO",
    status: "available",
    featured: true,
    displayOrder: 1,
    features: JSON.stringify(["Painel de prioridades", "Indicadores essenciais", "Rotinas por equipe"]),
    benefits: JSON.stringify(["Mais visibilidade", "Menos retrabalho", "Decisões mais rápidas"]),
  },
  {
    slug: "controle-de-operacoes",
    name: "Controle de Operações",
    category: "Operações",
    shortDescription: "Acompanhe atividades e fluxos com uma operação mais previsível.",
    fullDescription: "Feito para equipes que precisam de contexto, ritmo e rastreabilidade sem criar camadas de complexidade no dia a dia.",
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=82",
    appUrl: "https://example.com/controle-de-operacoes",
    buttonLabel: "TESTAR APLICATIVO",
    status: "available",
    featured: true,
    displayOrder: 2,
    features: JSON.stringify(["Fluxos visuais", "Histórico de atividades", "Acompanhamento em tempo real"]),
    benefits: JSON.stringify(["Mais controle", "Comunicação clara", "Operação consistente"]),
  },
  {
    slug: "dashboard-analytics",
    name: "Dashboard Analytics",
    category: "Tecnologia",
    shortDescription: "Encontre sinais importantes em dados que ajudam o negócio a avançar.",
    fullDescription: "Dashboards objetivos para sair do excesso de planilhas e enxergar tendências, alertas e oportunidades com mais confiança.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=82",
    appUrl: "https://example.com/dashboard-analytics",
    buttonLabel: "EXPERIMENTAR",
    status: "available",
    featured: true,
    displayOrder: 3,
    features: JSON.stringify(["Visões por período", "Métricas personalizáveis", "Leituras rápidas"]),
    benefits: JSON.stringify(["Clareza para decidir", "Acompanhamento contínuo", "Cultura orientada a dados"]),
  },
  {
    slug: "gestao-agricola",
    name: "Gestão Agrícola",
    category: "Agronegócio",
    shortDescription: "Uma base organizada para acompanhar o campo, recursos e resultados.",
    fullDescription: "Exemplo demonstrativo de uma solução para conectar planejamento, execução e acompanhamento de operações agrícolas.",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=82",
    appUrl: "https://example.com/gestao-agricola",
    buttonLabel: "ABRIR APLICATIVO",
    status: "available",
    featured: false,
    displayOrder: 4,
    features: JSON.stringify(["Talhões e atividades", "Registro de recursos", "Visão de safras"]),
    benefits: JSON.stringify(["Planejamento simples", "Mais previsibilidade", "Informação no momento certo"]),
  },
  {
    slug: "controle-de-frota",
    name: "Controle de Frota",
    category: "Logística",
    shortDescription: "Tenha uma visão prática dos veículos, rotas e próximos movimentos.",
    fullDescription: "Uma experiência demonstrativa para centralizar informações de frota e apoiar uma operação logística mais eficiente.",
    imageUrl: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1200&q=82",
    appUrl: "https://example.com/controle-de-frota",
    buttonLabel: "TESTAR AGORA",
    status: "available",
    featured: false,
    displayOrder: 5,
    features: JSON.stringify(["Visão de veículos", "Rotas e status", "Alertas operacionais"]),
    benefits: JSON.stringify(["Menos paradas", "Mais organização", "Acompanhamento fácil"]),
  },
];

export async function ensureDemoApplications() {
  const db = await getDb();
  if (!db) return;
  const current = await db.select({ id: applications.id }).from(applications).limit(1);
  if (current.length === 0) await db.insert(applications).values(demoApplications);
}

export async function listApplications() {
  const db = await getDb();
  if (!db) return localListApplications();
  await ensureDemoApplications();
  return db.select().from(applications).where(eq(applications.status, "available")).orderBy(asc(applications.displayOrder), desc(applications.createdAt));
}

export async function listAllApplications() {
  const db = await getDb();
  if (!db) return localListAllApplications();
  await ensureDemoApplications();
  return db.select().from(applications).orderBy(asc(applications.displayOrder), desc(applications.createdAt));
}

export async function getApplicationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return localGetApplicationBySlug(slug);
  await ensureDemoApplications();
  const result = await db.select().from(applications).where(eq(applications.slug, slug)).limit(1);
  return result[0];
}

export async function createApplication(input: InsertApplication) {
  const db = await getDb();
  if (!db) return localCreateApplication(input);
  const result = await db.insert(applications).values(input);
  return result;
}

export async function updateApplication(id: number, input: Partial<InsertApplication>) {
  const db = await getDb();
  if (!db) return localUpdateApplication(id, input);
  return db.update(applications).set({ ...input, updatedAt: new Date() }).where(eq(applications.id, id));
}

export async function deleteApplication(id: number) {
  const db = await getDb();
  if (!db) return localDeleteApplication(id);
  return db.delete(applications).where(eq(applications.id, id));
}

export async function createContactMessage(input: InsertContactMessage) {
  const db = await getDb();
  if (!db) return localCreateContactMessage(input);
  return db.insert(contactMessages).values(input);
}

export async function getSettings() {
  const db = await getDb();
  if (!db) return localGetSettings();
  const result = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  return result[0] ?? { id: 1, whatsappNumber: null, contactEmail: null, updatedAt: new Date() };
}

export async function updateSettings(input: Partial<InsertSettings>) {
  const db = await getDb();
  if (!db) return localUpdateSettings(input);
  await db.insert(settings).values({ id: 1, ...input }).onDuplicateKeyUpdate({ set: { ...input, updatedAt: new Date() } });
  return getSettings();
}
