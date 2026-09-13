import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Layers3,
  Menu,
  MessageCircle,
  MoveUpRight,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const categories = ["Todos", "Agronegócio", "Gestão", "Logística", "Produtividade", "Tecnologia", "Financeiro", "Operações"];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${light ? "text-white" : "text-slate-950"}`} aria-label="CSP Sistemas Digitais">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[13px] font-black tracking-[-0.03em] shadow-lg ${light ? "bg-white text-slate-950" : "bg-slate-950 text-white"}`}>CSP</div>
      <div className="leading-none"><div className="text-[17px] font-black tracking-[-0.05em]">CSP</div><div className={`mt-1 text-[8px] font-bold uppercase tracking-[0.18em] ${light ? "text-slate-300" : "text-slate-500"}`}>sistemas digitais</div></div>
    </div>
  );
}

function SectionEyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <div className={`mb-4 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ${light ? "text-emerald-300" : "text-emerald-600"}`}><span className="h-px w-7 bg-current" />{children}</div>;
}

function AppCard({ app, featured = false }: { app: any; featured?: boolean }) {
  return (
    <article className={`group overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.32)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-35px_rgba(15,23,42,0.42)] ${featured ? "lg:grid lg:grid-cols-[1.08fr_0.92fr]" : ""}`}>
      <div className={`relative overflow-hidden bg-slate-100 ${featured ? "min-h-[250px] lg:min-h-[310px]" : "h-48"}`}>
        <img src={app.imageUrl} alt={app.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/55 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-white backdrop-blur-md"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" /> teste disponível</div>
        {featured && <div className="absolute bottom-5 left-5 rounded-full bg-emerald-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-slate-950">destaque</div>}
      </div>
      <div className={`flex flex-col ${featured ? "justify-center p-7 lg:p-9" : "p-6"}`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-emerald-600">{app.category}</span>
          <span className="text-[11px] text-slate-400">01 / 05</span>
        </div>
        <h3 className={`${featured ? "text-2xl lg:text-3xl" : "text-xl"} font-black tracking-[-0.04em] text-slate-950`}>{app.name}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">{app.shortDescription}</p>
        <div className="mt-6 flex items-center gap-3">
          <Link href={`/aplicativo/${app.slug}`} className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-emerald-600">ver detalhes <ArrowRight className="ml-2 h-4 w-4" /></Link>
          <a href={app.appUrl} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${app.name}`} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"><ExternalLink className="h-4 w-4" /></a>
        </div>
      </div>
    </article>
  );
}

function WelcomeModal({ onExplore, onDismiss }: { onExplore: () => void; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-2xl sm:p-9">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400 text-slate-950"><Sparkles className="h-6 w-6" /></div>
        <h2 id="welcome-title" className="mt-6 text-2xl font-black tracking-[-0.05em] text-slate-950">Seja bem-vindo(a)! 👋</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Conheça a CSP Sistemas Digitais. Explore nossos aplicativos e teste gratuitamente as ferramentas disponíveis — é rápido e sem compromisso.</p>
        <button onClick={onExplore} className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-emerald-600">explorar aplicativos <ArrowRight className="ml-2 h-4 w-4" /></button>
        <button onClick={onDismiss} className="mt-4 text-xs font-bold text-slate-400 hover:text-emerald-600">agora não</button>
      </div>
    </div>
  );
}

function InstallBanner({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-6 sm:w-full sm:max-w-sm">
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white"><Download className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black text-slate-950">Instalar aplicativo</div>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">Adicione a CSP à sua tela inicial e acesse como um app, sem precisar abrir o navegador.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={onInstall} className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-slate-950 px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-emerald-600">instalar</button>
            <button onClick={onDismiss} className="inline-flex h-9 items-center justify-center rounded-full px-3 text-[11px] font-bold text-slate-400 hover:text-slate-600">agora não</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [contact, setContact] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [showWelcome, setShowWelcome] = useState(false);
  const { data: apps = [], isLoading } = trpc.applications.list.useQuery();
  const { data: statsData } = trpc.stats.get.useQuery();
  const utils = trpc.useUtils();
  const recordVisit = trpc.stats.recordVisit.useMutation({
    onSuccess: (data) => utils.stats.get.setData(undefined, data),
  });
  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => { setContact({ name: "", company: "", email: "", phone: "", message: "" }); toast.success("Mensagem enviada", { description: "Obrigado pelo contato. Retornaremos em breve." }); },
    onError: (error) => toast.error("Não foi possível enviar", { description: error.message }),
  });

  const hasRecordedVisit = useRef(false);
  useEffect(() => {
    if (hasRecordedVisit.current) return;
    hasRecordedVisit.current = true;
    recordVisit.mutate();
    try {
      if (!localStorage.getItem("csp-welcomed")) setShowWelcome(true);
    } catch {
      // localStorage unavailable (private mode, etc.) — skip the welcome modal.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissWelcome = () => {
    try { localStorage.setItem("csp-welcomed", "1"); } catch {}
    setShowWelcome(false);
  };

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
      try {
        if (!localStorage.getItem("csp-install-dismissed")) setShowInstallBanner(true);
      } catch {
        setShowInstallBanner(true);
      }
    };
    const onAppInstalled = () => { setShowInstallBanner(false); setInstallPrompt(null); };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const dismissInstall = () => {
    try { localStorage.setItem("csp-install-dismissed", "1"); } catch {}
    setShowInstallBanner(false);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    try { await installPrompt.userChoice; } catch {}
    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  const featured = useMemo(() => apps.filter((app: any) => app.featured).slice(0, 2), [apps]);
  const filtered = useMemo(() => apps.filter((app: any) => {
    const matchesSearch = `${app.name} ${app.shortDescription}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "Todos" || app.category === category;
    return matchesSearch && matchesCategory;
  }), [apps, category, search]);

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-950">
      {showWelcome && <WelcomeModal onExplore={() => { dismissWelcome(); scrollTo("aplicativos"); }} onDismiss={dismissWelcome} />}
      {showInstallBanner && <InstallBanner onInstall={handleInstall} onDismiss={dismissInstall} />}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/85 backdrop-blur-xl">
        <div className="container flex h-[76px] items-center justify-between">
          <button onClick={() => scrollTo("inicio")} aria-label="Voltar ao início"><Logo /></button>
          <nav className={`${menuOpen ? "absolute left-4 right-4 top-[84px] flex" : "hidden"} flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            {["Início", "Aplicativos", "Soluções para Agro", "Soluções", "Sobre", "Contato"].map((item) => <button key={item} onClick={() => scrollTo(item === "Início" ? "inicio" : item === "Aplicativos" ? "aplicativos" : item === "Soluções para Agro" ? "agro" : item === "Soluções" ? "solucoes" : item === "Sobre" ? "sobre" : "contato")} className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 md:px-0 md:py-0">{item}</button>)}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => scrollTo("contato")} className="hidden rounded-full bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-emerald-600 sm:inline-flex">Conheça nossas soluções <ArrowRight className="ml-2 h-4 w-4" /></button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 md:hidden" aria-label="Abrir menu">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
      </header>

      <main id="inicio">
        <section className="relative isolate overflow-hidden pt-[76px]">
          <div className="hero-grid absolute inset-0 -z-10" />
          <div className="container grid min-h-[670px] items-center gap-16 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-white/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 shadow-sm"><span className="pulse-dot" /> CSP sistemas digitais <Sparkles className="h-3.5 w-3.5" /></div>
              <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.065em] text-slate-950 sm:text-6xl lg:text-[78px]">Soluções digitais para um negócio <span className="text-emerald-600">mais inteligente.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Aplicativos desenvolvidos para simplificar processos, aumentar a produtividade e transformar a maneira como você trabalha.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row"><button onClick={() => scrollTo("aplicativos")} className="inline-flex h-13 items-center justify-center rounded-full bg-emerald-500 px-7 text-xs font-black uppercase tracking-[0.13em] text-slate-950 transition hover:bg-emerald-400">explorar aplicativos <ArrowRight className="ml-2 h-4 w-4" /></button><button onClick={() => scrollTo("solucoes")} className="inline-flex h-13 items-center justify-center rounded-full border border-slate-300 bg-white/60 px-7 text-xs font-black uppercase tracking-[0.13em] text-slate-700 transition hover:border-slate-950 hover:bg-white">conheça nossas soluções</button></div>
              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-slate-200 pt-6"><div><div className="text-2xl font-black tracking-[-0.05em]">05<span className="text-emerald-500">+</span></div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">soluções demonstrativas</div></div><div className="h-8 w-px bg-slate-200" /><div><div className="text-2xl font-black tracking-[-0.05em]">24<span className="text-emerald-500">/7</span></div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">acesso para experimentar</div></div><div className="h-8 w-px bg-slate-200" /><div><div className="text-2xl font-black tracking-[-0.05em]">∞</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">possibilidades</div></div><div className="h-8 w-px bg-slate-200" /><div><div className="text-2xl font-black tracking-[-0.05em]">{(statsData?.totalVisits ?? 0).toLocaleString("pt-BR")}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">visitas ao site</div></div></div>
            </div>
            <div className="relative mx-auto w-full max-w-[530px]">
              <div className="hero-orbit absolute -inset-8 rounded-[44px] border border-emerald-300/40" /><div className="hero-orbit hero-orbit-2 absolute -inset-16 rounded-[54px] border border-blue-300/30" />
              <div className="relative overflow-hidden rounded-[36px] bg-slate-950 p-3 shadow-[0_40px_90px_-30px_rgba(15,23,42,0.6)]"><div className="relative min-h-[420px] overflow-hidden rounded-[27px] bg-gradient-to-br from-[#103c48] via-[#0b5362] to-[#0d263f] p-8 text-white sm:min-h-[480px]"><div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" /><div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" /><div className="relative flex items-start justify-between"><div><div className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">workspace / 01</div><div className="mt-3 text-2xl font-bold tracking-[-0.05em]">Visão geral</div></div><div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10"><BarChart3 className="h-5 w-5 text-emerald-300" /></div></div><div className="relative mt-16 flex items-end gap-3"><div className="h-28 w-9 rounded-t-full bg-emerald-300/35 sm:h-36" /><div className="h-40 w-9 rounded-t-full bg-emerald-300/55 sm:h-52" /><div className="h-24 w-9 rounded-t-full bg-white/20 sm:h-32" /><div className="h-52 w-9 rounded-t-full bg-emerald-300 sm:h-64" /><div className="h-36 w-9 rounded-t-full bg-blue-200/70 sm:h-48" /><div className="h-44 w-9 rounded-t-full bg-white/35 sm:h-56" /></div><div className="relative mt-7 h-px bg-white/20" /><div className="relative mt-7 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">eficiência</div><div className="mt-2 text-2xl font-black">+32<span className="text-emerald-300">%</span></div></div><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">projetos ativos</div><div className="mt-2 text-2xl font-black">18</div></div></div><div className="absolute bottom-7 right-7 rounded-full border border-emerald-200/30 bg-emerald-300 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-950">feito para avançar</div></div></div>
              <div className="absolute -bottom-8 -left-6 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:flex sm:items-center sm:gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><Check className="h-5 w-5" /></div><div><div className="text-sm font-bold">Acesso disponível</div><div className="mt-1 text-xs text-slate-400">Experimente agora</div></div></div>
            </div>
          </div>
        </section>

        <section id="aplicativos" className="scroll-mt-24 bg-white py-24 lg:py-32"><div className="container"><div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><SectionEyebrow>portfólio em movimento</SectionEyebrow><h2 className="max-w-xl text-4xl font-black tracking-[-0.06em] sm:text-5xl">Aplicativos disponíveis<span className="text-emerald-500">.</span></h2><p className="mt-4 max-w-lg text-base leading-7 text-slate-500">Conheça nossas soluções e teste gratuitamente as ferramentas disponíveis.</p></div><div className="flex items-center gap-2 text-sm font-bold text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-500" /> dados demonstrativos · prontos para experimentar</div></div>
          {featured.length > 0 && <div className="mt-12 grid gap-6 lg:grid-cols-2">{featured.map((app: any) => <AppCard key={app.id} app={app} featured />)}</div>}
          <div className="mt-20 flex flex-col gap-5 border-t border-slate-200 pt-8 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="text-2xl font-black tracking-[-0.04em]">Explore o catálogo</h3><p className="mt-2 text-sm text-slate-500">Seu próximo aplicativo pode estar aqui.</p></div><div className="relative w-full lg:max-w-sm"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar aplicativo..." className="h-12 rounded-full border-slate-200 bg-slate-50 pl-11" /></div></div>
          <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition ${category === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"}`}>{item}</button>)}</div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{isLoading ? [1, 2, 3].map((item) => <div key={item} className="h-[430px] animate-pulse rounded-[24px] bg-slate-100" />) : filtered.map((app: any) => <AppCard key={app.id} app={app} />)}</div>
          {!isLoading && filtered.length === 0 && <div className="rounded-3xl border border-dashed border-slate-300 py-16 text-center"><Search className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 font-bold text-slate-600">Nenhum aplicativo encontrado.</p><button onClick={() => { setSearch(""); setCategory("Todos"); }} className="mt-3 text-sm font-bold text-emerald-600">Limpar filtros</button></div>}
        </div></section>

        <section id="agro" className="scroll-mt-24 bg-[#e8f4ed] py-24 lg:py-32"><div className="container"><div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-end"><div><SectionEyebrow>campo, gestão e resultado</SectionEyebrow><h2 className="max-w-xl text-4xl font-black leading-[1.05] tracking-[-0.06em] sm:text-5xl">Soluções para Agro<span className="text-emerald-500">.</span></h2><p className="mt-5 max-w-lg text-base leading-7 text-slate-600">Soluções inteligentes para o usuário testar e levar mais organização para o dia a dia na agricultura — do planejamento da safra ao acompanhamento da operação.</p><div className="mt-7 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> tecnologia feita para o campo</div></div><div className="grid gap-4 sm:grid-cols-2">{apps.filter((app: any) => app.category === "Agronegócio").map((app: any) => <AppCard key={app.id} app={app} featured />)}<div className="rounded-[24px] border border-emerald-200 bg-white/70 p-7"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Target className="h-5 w-5" /></div><h3 className="mt-5 text-xl font-black tracking-[-0.04em]">Novas ferramentas em breve</h3><p className="mt-3 text-sm leading-6 text-slate-500">Acompanhe esta área para experimentar aplicações voltadas à rotina agrícola, gestão de recursos e tomada de decisão.</p><button onClick={() => scrollTo("contato")} className="mt-5 inline-flex items-center text-xs font-black uppercase tracking-[0.12em] text-emerald-700">quero saber mais <ArrowRight className="ml-2 h-4 w-4" /></button></div></div></div></div></section>
        <section id="sobre" className="scroll-mt-24 bg-[#f0f6f5] py-24 lg:py-32"><div className="container grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><div><SectionEyebrow>por que utilizar</SectionEyebrow><h2 className="max-w-md text-4xl font-black leading-[1.05] tracking-[-0.06em] sm:text-5xl">Tecnologia feita para facilitar<span className="text-emerald-500">.</span></h2><p className="mt-5 max-w-md text-base leading-7 text-slate-500">Descubra novas possibilidades através da tecnologia. Menos complexidade, mais eficiência e uma experiência pensada para o seu ritmo.</p><div className="mt-8 inline-flex items-center gap-3 text-sm font-bold text-slate-900"><span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm"><ArrowRight className="h-4 w-4 text-emerald-600" /></span> Conheça. Acesse. Teste.</div></div><div className="grid gap-4 sm:grid-cols-2"><div className="benefit-card"><Zap className="h-6 w-6 text-emerald-600" /><h3>Mais produtividade</h3><p>Automatize tarefas e ganhe tempo para focar no que realmente importa.</p></div><div className="benefit-card"><Target className="h-6 w-6 text-blue-600" /><h3>Mais controle</h3><p>Tenha informações organizadas e acessíveis para tomar decisões melhores.</p></div><div className="benefit-card"><Layers3 className="h-6 w-6 text-emerald-600" /><h3>Tecnologia prática</h3><p>Soluções pensadas para resolver problemas reais do dia a dia.</p></div><div className="benefit-card"><ShieldCheck className="h-6 w-6 text-blue-600" /><h3>Experiência digital</h3><p>Interfaces simples, modernas e desenvolvidas pensando no usuário.</p></div></div></div></section>

        <section id="solucoes" className="scroll-mt-24 bg-slate-950 py-24 text-white lg:py-32"><div className="container"><div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]"><div><SectionEyebrow light>tecnologia que resolve</SectionEyebrow><h2 className="max-w-md text-4xl font-black leading-[1.05] tracking-[-0.06em] sm:text-5xl">Transforme necessidades reais em soluções<span className="text-emerald-300">.</span></h2><p className="mt-5 max-w-md text-base leading-7 text-slate-400">Desenvolvemos experiências digitais simples, inteligentes e eficientes para colocar boas ideias em movimento.</p></div><div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">{["Desenvolvimento de aplicativos", "Sistemas de gestão", "Automação de processos", "Dashboards e indicadores", "Soluções para operações", "Sistemas personalizados", "Integração de dados", "Transformação digital"].map((item, index) => <div key={item} className="group flex items-start gap-4 border-b border-white/10 pb-5"><span className="text-xs font-bold text-emerald-300">0{index + 1}</span><div className="flex-1"><h3 className="text-base font-bold transition group-hover:text-emerald-300">{item}</h3><div className="mt-2 h-px w-0 bg-emerald-300 transition-all group-hover:w-12" /></div><ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300" /></div>)}</div></div></div></section>

        <section className="relative overflow-hidden bg-emerald-500 py-16"><div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_55%)]" /><div className="container relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center"><div><div className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-950/70">para empresas que querem avançar</div><h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.06em] text-slate-950 sm:text-4xl">Tem um desafio? Podemos transformar em uma solução.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-emerald-950/75">Cada negócio possui suas próprias necessidades. Vamos conversar sobre processos, informações e oportunidades.</p></div><button onClick={() => scrollTo("contato")} className="inline-flex h-13 shrink-0 items-center justify-center rounded-full bg-slate-950 px-7 text-xs font-black uppercase tracking-[0.13em] text-white transition hover:bg-slate-800">fale conosco <ArrowRight className="ml-2 h-4 w-4" /></button></div></section>

        <section id="contato" className="scroll-mt-24 bg-white py-24 lg:py-32"><div className="container grid gap-14 lg:grid-cols-[0.75fr_1.25fr]"><div><SectionEyebrow>vamos conversar</SectionEyebrow><h2 className="max-w-md text-4xl font-black leading-[1.05] tracking-[-0.06em] sm:text-5xl">Uma ideia pode se transformar em uma solução<span className="text-emerald-500">.</span></h2><p className="mt-5 max-w-md text-base leading-7 text-slate-500">Conte um pouco sobre o seu desafio. O espaço está aberto para novas possibilidades.</p><div className="mt-10 space-y-4"><div className="flex items-center gap-3 text-sm text-slate-500"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><MessageCircle className="h-4 w-4" /></span> WhatsApp configurável pelo administrador</div><div className="flex items-center gap-3 text-sm text-slate-500"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-700"><Send className="h-4 w-4" /></span> E-mail e redes sociais configuráveis</div></div></div><form onSubmit={(e) => { e.preventDefault(); submitContact.mutate(contact); }} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Nome<input required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none ring-emerald-500/20 transition focus:ring-4" placeholder="Seu nome" /></label><label className="text-xs font-bold text-slate-600">Empresa<input value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none ring-emerald-500/20 transition focus:ring-4" placeholder="Sua empresa" /></label><label className="text-xs font-bold text-slate-600">E-mail<input required type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none ring-emerald-500/20 transition focus:ring-4" placeholder="voce@empresa.com" /></label><label className="text-xs font-bold text-slate-600">Telefone / WhatsApp<input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none ring-emerald-500/20 transition focus:ring-4" placeholder="(00) 00000-0000" /></label><label className="text-xs font-bold text-slate-600 sm:col-span-2">Mensagem<Textarea required value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} className="mt-2 min-h-32 resize-none rounded-xl border-slate-200 bg-white" placeholder="Como podemos ajudar?" /></label></div><button disabled={submitContact.isPending} className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-950 text-xs font-black uppercase tracking-[0.13em] text-white transition hover:bg-emerald-600 disabled:opacity-50">{submitContact.isPending ? "enviando..." : "enviar mensagem"}<Send className="ml-2 h-4 w-4" /></button></form></div></section>
      </main>

      <footer className="bg-[#07161d] py-12 text-white"><div className="container"><div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-10 lg:flex-row"><div><Logo light /><p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">Soluções digitais desenvolvidas para transformar ideias em resultados.</p></div><div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm text-slate-400 sm:grid-cols-3"><button onClick={() => scrollTo("inicio")} className="text-left hover:text-emerald-300">Início</button><button onClick={() => scrollTo("aplicativos")} className="text-left hover:text-emerald-300">Aplicativos</button><button onClick={() => scrollTo("solucoes")} className="text-left hover:text-emerald-300">Soluções</button><button onClick={() => scrollTo("sobre")} className="text-left hover:text-emerald-300">Sobre</button><button onClick={() => scrollTo("contato")} className="text-left hover:text-emerald-300">Contato</button><Link href="/admin" className="text-left hover:text-emerald-300">Administração</Link></div></div><div className="flex flex-col justify-between gap-3 pt-6 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 sm:flex-row"><span>© 2026 — Todos os direitos reservados.</span><span>Explore. Teste. Descubra. Transforme.</span></div></div></footer>
    </div>
  );
}
