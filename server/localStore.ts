// Local file-based persistence used when no DATABASE_URL is configured, so the
// admin panel works fully (create/edit/delete) without any cloud database.
import fs from "fs";
import path from "path";
import type { Application, ContactMessage, InsertApplication, InsertContactMessage } from "../drizzle/schema";

const DATA_DIR = path.resolve(import.meta.dirname, "..", "data");
const APPLICATIONS_FILE = path.join(DATA_DIR, "applications.json");
const CONTACT_FILE = path.join(DATA_DIR, "contact-messages.json");
const VISITS_FILE = path.join(DATA_DIR, "visits.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  ensureDataDir();
  if (!fs.existsSync(file)) return fallback;
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return raw.trim() ? JSON.parse(raw, reviveDates) : fallback;
  } catch {
    return fallback;
  }
}

function reviveDates(key: string, value: unknown) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return value;
}

function writeJson(file: string, data: unknown) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

const demoApplications: Application[] = [
  {
    id: 1,
    slug: "gestao-inteligente",
    name: "Gestão Inteligente",
    category: "Gestão",
    shortDescription: "Organize rotinas, prioridades e indicadores em um único lugar.",
    fullDescription: "Uma visão clara da operação para transformar tarefas espalhadas em uma rotina organizada, com decisões mais rápidas e acompanhamento simples.",
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82",
    imageKey: null,
    appUrl: "https://example.com/gestao-inteligente",
    buttonLabel: "ABRIR APLICATIVO",
    status: "available",
    featured: true,
    displayOrder: 1,
    features: JSON.stringify(["Painel de prioridades", "Indicadores essenciais", "Rotinas por equipe"]),
    benefits: JSON.stringify(["Mais visibilidade", "Menos retrabalho", "Decisões mais rápidas"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    slug: "controle-de-operacoes",
    name: "Controle de Operações",
    category: "Operações",
    shortDescription: "Acompanhe atividades e fluxos com uma operação mais previsível.",
    fullDescription: "Feito para equipes que precisam de contexto, ritmo e rastreabilidade sem criar camadas de complexidade no dia a dia.",
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=82",
    imageKey: null,
    appUrl: "https://example.com/controle-de-operacoes",
    buttonLabel: "TESTAR APLICATIVO",
    status: "available",
    featured: true,
    displayOrder: 2,
    features: JSON.stringify(["Fluxos visuais", "Histórico de atividades", "Acompanhamento em tempo real"]),
    benefits: JSON.stringify(["Mais controle", "Comunicação clara", "Operação consistente"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    slug: "dashboard-analytics",
    name: "Dashboard Analytics",
    category: "Tecnologia",
    shortDescription: "Encontre sinais importantes em dados que ajudam o negócio a avançar.",
    fullDescription: "Dashboards objetivos para sair do excesso de planilhas e enxergar tendências, alertas e oportunidades com mais confiança.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=82",
    imageKey: null,
    appUrl: "https://example.com/dashboard-analytics",
    buttonLabel: "EXPERIMENTAR",
    status: "available",
    featured: true,
    displayOrder: 3,
    features: JSON.stringify(["Visões por período", "Métricas personalizáveis", "Leituras rápidas"]),
    benefits: JSON.stringify(["Clareza para decidir", "Acompanhamento contínuo", "Cultura orientada a dados"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    slug: "gestao-agricola",
    name: "Gestão Agrícola",
    category: "Agronegócio",
    shortDescription: "Uma base organizada para acompanhar o campo, recursos e resultados.",
    fullDescription: "Exemplo demonstrativo de uma solução para conectar planejamento, execução e acompanhamento de operações agrícolas.",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=82",
    imageKey: null,
    appUrl: "https://example.com/gestao-agricola",
    buttonLabel: "ABRIR APLICATIVO",
    status: "available",
    featured: false,
    displayOrder: 4,
    features: JSON.stringify(["Talhões e atividades", "Registro de recursos", "Visão de safras"]),
    benefits: JSON.stringify(["Planejamento simples", "Mais previsibilidade", "Informação no momento certo"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    slug: "controle-de-frota",
    name: "Controle de Frota",
    category: "Logística",
    shortDescription: "Tenha uma visão prática dos veículos, rotas e próximos movimentos.",
    fullDescription: "Uma experiência demonstrativa para centralizar informações de frota e apoiar uma operação logística mais eficiente.",
    imageUrl: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1200&q=82",
    imageKey: null,
    appUrl: "https://example.com/controle-de-frota",
    buttonLabel: "TESTAR AGORA",
    status: "available",
    featured: false,
    displayOrder: 5,
    features: JSON.stringify(["Visão de veículos", "Rotas e status", "Alertas operacionais"]),
    benefits: JSON.stringify(["Menos paradas", "Mais organização", "Acompanhamento fácil"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function loadApplications(): Application[] {
  return readJson<Application[]>(APPLICATIONS_FILE, demoApplications);
}

function saveApplications(apps: Application[]) {
  writeJson(APPLICATIONS_FILE, apps);
}

function nextId(apps: Application[]) {
  return apps.reduce((max, app) => Math.max(max, app.id), 0) + 1;
}

export function localListApplications(): Application[] {
  return loadApplications()
    .filter((app) => app.status === "available")
    .sort((a, b) => a.displayOrder - b.displayOrder || +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function localListAllApplications(): Application[] {
  return loadApplications().sort((a, b) => a.displayOrder - b.displayOrder || +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function localGetApplicationBySlug(slug: string): Application | undefined {
  return loadApplications().find((app) => app.slug === slug);
}

export function localCreateApplication(input: InsertApplication): Application {
  const apps = loadApplications();
  if (apps.some((app) => app.slug === input.slug)) {
    throw new Error("Já existe um aplicativo com este slug.");
  }
  const now = new Date();
  const created: Application = {
    id: nextId(apps),
    slug: input.slug!,
    name: input.name!,
    category: input.category!,
    shortDescription: input.shortDescription!,
    fullDescription: input.fullDescription!,
    imageUrl: input.imageUrl!,
    imageKey: input.imageKey ?? null,
    appUrl: input.appUrl!,
    buttonLabel: input.buttonLabel ?? "ABRIR APLICATIVO",
    status: input.status ?? "available",
    featured: input.featured ?? false,
    displayOrder: input.displayOrder ?? 0,
    features: input.features ?? null,
    benefits: input.benefits ?? null,
    createdAt: now,
    updatedAt: now,
  };
  apps.push(created);
  saveApplications(apps);
  return created;
}

export function localUpdateApplication(id: number, input: Partial<InsertApplication>): Application {
  const apps = loadApplications();
  const index = apps.findIndex((app) => app.id === id);
  if (index === -1) throw new Error("Aplicativo não encontrado.");
  if (input.slug && apps.some((app) => app.slug === input.slug && app.id !== id)) {
    throw new Error("Já existe um aplicativo com este slug.");
  }
  const updated: Application = { ...apps[index], ...input, updatedAt: new Date() } as Application;
  apps[index] = updated;
  saveApplications(apps);
  return updated;
}

export function localDeleteApplication(id: number) {
  const apps = loadApplications();
  const next = apps.filter((app) => app.id !== id);
  saveApplications(next);
}

export function localCreateContactMessage(input: InsertContactMessage): ContactMessage {
  const messages = readJson<ContactMessage[]>(CONTACT_FILE, []);
  const created: ContactMessage = {
    id: messages.reduce((max, m) => Math.max(max, m.id), 0) + 1,
    name: input.name!,
    company: input.company ?? null,
    email: input.email!,
    phone: input.phone ?? null,
    message: input.message!,
    createdAt: new Date(),
  };
  messages.push(created);
  writeJson(CONTACT_FILE, messages);
  return created;
}

export function localRecordVisit(): number {
  const stats = readJson<{ totalVisits: number }>(VISITS_FILE, { totalVisits: 0 });
  stats.totalVisits += 1;
  writeJson(VISITS_FILE, stats);
  return stats.totalVisits;
}

export function localGetVisitCount(): number {
  return readJson<{ totalVisits: number }>(VISITS_FILE, { totalVisits: 0 }).totalVisits;
}
