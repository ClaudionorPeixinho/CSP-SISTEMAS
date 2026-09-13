import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Edit3, ExternalLink, ImagePlus, LayoutDashboard, Lock, LogOut, Plus, Save, ShieldAlert, Trash2, Upload, X } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const emptyForm = { slug: "", name: "", category: "Gestão", shortDescription: "", fullDescription: "", imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82", imageKey: null as string | null, appUrl: "https://", buttonLabel: "ABRIR APLICATIVO", status: "available" as "available" | "paused", featured: false, displayOrder: 10, features: "[\"Recurso principal\", \"Visão organizada\"]", benefits: "[\"Mais clareza\", \"Mais eficiência\"]" };

const slugify = (value: string) =>
  Array.from(value.normalize("NFD"))
    .filter((ch) => { const code = ch.codePointAt(0) || 0; return code < 0x0300 || code > 0x036f; })
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

function friendlyErrorMessage(error: any): string {
  const message = String(error?.message ?? "").trim();
  // A raw Zod validation dump (from an unexpected server-side rejection) starts
  // with "[" — never show that JSON blob to the user.
  if (!message || message.startsWith("[")) return "Alguns campos são inválidos. Revise o formulário e tente novamente.";
  return message;
}

function Brand() { return <Link href="/" className="flex items-center gap-3 text-slate-950"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-950 text-[13px] font-black tracking-[-0.03em] text-white shadow-lg">CSP</div><div className="leading-none"><div className="text-[17px] font-black tracking-[-0.05em]">CSP</div><div className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">administração</div></div></Link>; }

function AdminLogin() {
  const utils = trpc.useUtils();
  const [password, setPassword] = useState("");
  const login = trpc.auth.adminLogin.useMutation({
    onSuccess: async () => { toast.success("Bem-vindo(a)!"); setPassword(""); await utils.auth.me.invalidate(); },
    onError: (error) => toast.error("Não foi possível entrar", { description: error.message }),
  });

  return (
    <div className="grid min-h-screen place-items-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white"><ShieldAlert className="h-6 w-6" /></div>
        <h1 className="mt-6 text-2xl font-black tracking-[-0.05em]">Área restrita</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Digite a senha de administrador para gerenciar os aplicativos.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (password.trim()) login.mutate({ password }); }} className="mt-7 text-left">
          <label className="text-xs font-bold text-slate-600">Senha
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" />
            </div>
          </label>
          <button disabled={login.isPending || !password.trim()} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-950 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-emerald-600 disabled:opacity-50">{login.isPending ? "entrando..." : "entrar como administrador"}</button>
        </form>
        <Link href="/" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-600"><ArrowLeft className="h-3.5 w-3.5" /> voltar ao site</Link>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, textarea = false, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; textarea?: boolean; type?: string }) { const common = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"; return <label className="text-xs font-bold text-slate-600">{label}{textarea ? <textarea value={value} onChange={(e) => onChange(e.target.value)} className={`${common} min-h-24 resize-y py-3`} /> : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`${common} h-11`} />}</label>; }

export default function Admin() {
  const { user, loading, logout } = useAuth();
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { data: apps = [], isLoading, refetch } = trpc.applications.listAll.useQuery(undefined, { enabled: Boolean(user?.role === "admin") });
  const create = trpc.applications.create.useMutation({ onSuccess: () => { toast.success("Aplicativo cadastrado"); resetForm(); refetch(); }, onError: (e) => toast.error("Não foi possível salvar", { description: friendlyErrorMessage(e) }) });
  const update = trpc.applications.update.useMutation({ onSuccess: () => { toast.success("Aplicativo atualizado"); resetForm(); refetch(); }, onError: (e) => toast.error("Não foi possível salvar", { description: friendlyErrorMessage(e) }) });
  const remove = trpc.applications.remove.useMutation({ onSuccess: () => { toast.success("Aplicativo excluído"); refetch(); }, onError: (e) => toast.error("Não foi possível excluir", { description: friendlyErrorMessage(e) }) });
  const upload = trpc.applications.uploadImage.useMutation({ onSuccess: (data) => { setForm((current: any) => ({ ...current, imageUrl: data.url, imageKey: data.key })); toast.success("Imagem carregada"); }, onError: (e) => toast.error(e.message) });
  const isSaving = create.isPending || update.isPending;
  const categories = useMemo(() => Array.from(new Set(apps.map((app: any) => app.category))), [apps]);
  useEffect(() => { if (form.name && !editingId) setForm((current: any) => ({ ...current, slug: current.slug || slugify(current.name) })); }, [form.name, editingId]);
  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };
  const edit = (app: any) => { setForm({ ...app }); setEditingId(app.id); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const slug = slugify(form.slug) || slugify(form.name);
    const problems: string[] = [];
    if (!form.name || form.name.trim().length < 2) problems.push("Nome do aplicativo (mínimo 2 caracteres)");
    if (!slug) problems.push("Slug da página (informe o nome ou um slug válido)");
    if (!form.shortDescription || form.shortDescription.trim().length < 10) problems.push("Descrição curta (mínimo 10 caracteres)");
    if (!form.fullDescription || form.fullDescription.trim().length < 10) problems.push("Descrição completa (mínimo 10 caracteres)");
    if (!/^https?:\/\/.+/.test(form.imageUrl || "")) problems.push("Imagem de capa (faça upload ou cole um link http:// ou https://)");
    if (!/^https?:\/\/.+/.test(form.appUrl || "")) problems.push("Link do aplicativo (use um endereço http:// ou https://)");
    if (problems.length > 0) {
      toast.error("Revise os campos antes de salvar", { description: problems.join(" • ") });
      return;
    }
    const payload = { ...form, slug, displayOrder: Number(form.displayOrder), featured: Boolean(form.featured) };
    if (editingId) update.mutate({ id: editingId, data: payload }); else create.mutate(payload);
  };
  const onImage = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/")) return toast.error("Selecione uma imagem válida"); const reader = new FileReader(); reader.onload = () => upload.mutate({ fileName: file.name, dataUrl: String(reader.result) }); reader.readAsDataURL(file); };

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f8fafc]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  if (!user) return <AdminLogin />;
  if (user.role !== "admin") return <div className="grid min-h-screen place-items-center bg-[#f8fafc] p-6"><div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl"><ShieldAlert className="mx-auto h-10 w-10 text-amber-500" /><h1 className="mt-6 text-2xl font-black">Acesso não autorizado</h1><p className="mt-3 text-sm leading-6 text-slate-500">Sua conta está autenticada, mas ainda não possui permissão de administrador.</p><Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">voltar ao site</Link></div></div>;

  return <div className="min-h-screen bg-[#f8fafc] text-slate-950"><header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl"><div className="container flex h-[76px] items-center justify-between"><Brand /><div className="flex items-center gap-4"><span className="hidden text-right sm:block"><strong className="block text-xs font-black">{user.name || "Administrador"}</strong><small className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600">acesso admin</small></span><button onClick={logout} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500" aria-label="Sair"><LogOut className="h-4 w-4" /></button></div></div></header><main className="container py-10"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600"><LayoutDashboard className="h-3.5 w-3.5" /> painel de controle</div><h1 className="text-4xl font-black tracking-[-0.06em]">Aplicativos<span className="text-emerald-500">.</span></h1><p className="mt-2 text-sm text-slate-500">Cadastre, organize e destaque as soluções da sua vitrine.</p></div><div className="flex gap-3"><Link href="/" className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-slate-600"><ArrowLeft className="mr-2 h-4 w-4" /> ver site</Link><button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(!showForm); }} className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-black uppercase tracking-[0.11em] text-white hover:bg-emerald-600">{showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{showForm ? "fechar" : "adicionar aplicativo"}</button></div></div>
      {showForm && <form onSubmit={save} className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">{editingId ? "Editar aplicativo" : "Novo aplicativo"}</h2><p className="mt-1 text-sm text-slate-500">Os campos aparecem automaticamente na vitrine após salvar.</p></div><div className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">rascunho configurável</div></div><div className="mt-7 grid gap-5 lg:grid-cols-2"><div className="space-y-5"><Field label="Nome do aplicativo" value={form.name} onChange={(value) => setForm({ ...form, name: value })} /><Field label="Slug da página" value={form.slug} onChange={(value) => setForm({ ...form, slug: value })} /><div className="grid gap-5 sm:grid-cols-2"><Field label="Categoria" value={form.category} onChange={(value) => setForm({ ...form, category: value })} /><Field label="Ordem de exibição" type="number" value={form.displayOrder} onChange={(value) => setForm({ ...form, displayOrder: value })} /></div><Field label="Descrição curta" value={form.shortDescription} onChange={(value) => setForm({ ...form, shortDescription: value })} textarea /><Field label="Descrição completa" value={form.fullDescription} onChange={(value) => setForm({ ...form, fullDescription: value })} textarea /></div><div className="space-y-5"><div><div className="text-xs font-bold text-slate-600">Imagem de capa</div><div className="mt-2 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50"><div className="relative aspect-[2/1] overflow-hidden">{form.imageUrl && <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />}<label className="absolute inset-0 grid cursor-pointer place-items-center bg-slate-950/35 text-center text-white opacity-0 transition hover:opacity-100"><input type="file" accept="image/*" className="hidden" onChange={onImage} /><span><Upload className="mx-auto h-6 w-6" /><span className="mt-2 block text-xs font-black uppercase tracking-[0.12em]">trocar imagem</span></span></label></div><div className="flex items-center justify-between p-3"><span className="text-xs text-slate-500">Preview antes de salvar</span>{upload.isPending ? <span className="text-xs font-bold text-emerald-600">carregando...</span> : <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-emerald-700"><input type="file" accept="image/*" className="hidden" onChange={onImage} /><ImagePlus className="h-4 w-4" /> upload</label>}</div></div><Field label="Ou cole a URL de uma imagem" value={form.imageUrl} onChange={(value) => setForm({ ...form, imageUrl: value, imageKey: null })} /><p className="mt-1.5 text-[11px] text-slate-400">Precisa ser um link completo, começando com http:// ou https://.</p></div><Field label="Link / URL do aplicativo" value={form.appUrl} onChange={(value) => setForm({ ...form, appUrl: value })} /><Field label="Texto do botão" value={form.buttonLabel} onChange={(value) => setForm({ ...form, buttonLabel: value })} /><div className="grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm"><option value="available">Disponível para teste</option><option value="paused">Pausado</option></select></label><label className="flex items-center gap-3 pt-6 text-xs font-bold text-slate-600"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-emerald-600" /> Marcar como destaque</label></div></div></div><div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><button type="button" onClick={resetForm} className="h-11 rounded-full px-5 text-xs font-black uppercase tracking-[0.1em] text-slate-500 hover:bg-slate-100">cancelar</button><button disabled={isSaving || upload.isPending} className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-xs font-black uppercase tracking-[0.1em] text-slate-950 hover:bg-emerald-400 disabled:opacity-50"><Save className="mr-2 h-4 w-4" />{isSaving ? "salvando..." : "salvar aplicativo"}</button></div></form>}
      <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="stat-card"><span>total</span><strong>{apps.length}</strong><small>aplicativos cadastrados</small></div><div className="stat-card"><span>disponíveis</span><strong>{apps.filter((app: any) => app.status === "available").length}</strong><small>prontos para teste</small></div><div className="stat-card"><span>destaques</span><strong>{apps.filter((app: any) => app.featured).length}</strong><small>em evidência na home</small></div></div>
      <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h2 className="font-black">Catálogo publicado</h2><p className="mt-1 text-xs text-slate-400">Gerencie os cards que aparecem para os visitantes.</p></div><span className="hidden text-xs font-bold text-slate-400 sm:block">{categories.length} categorias</span></div><div className="divide-y divide-slate-100">{isLoading ? <div className="p-10 text-center text-sm text-slate-400">Carregando catálogo...</div> : apps.map((app: any) => <div key={app.id} className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-4"><img src={app.imageUrl} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{app.name}</h3>{app.featured && <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-amber-700">destaque</span>}</div><p className="mt-1 truncate text-sm text-slate-500">{app.category} · {app.shortDescription}</p><div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em]"> <span className={app.status === "available" ? "text-emerald-600" : "text-slate-400"}>{app.status === "available" ? "● disponível" : "○ pausado"}</span><span className="text-slate-300">/</span><a href={app.appUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-600">link externo <ExternalLink className="h-3 w-3" /></a></div></div></div><div className="flex items-center gap-2 sm:shrink-0"><button onClick={() => edit(app)} className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700"><Edit3 className="h-3.5 w-3.5" /> editar</button><button onClick={() => { if (window.confirm(`Excluir ${app.name}? Esta ação não pode ser desfeita.`)) remove.mutate({ id: app.id }); }} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500" aria-label={`Excluir ${app.name}`}><Trash2 className="h-3.5 w-3.5" /></button></div></div>)}</div></div>
    </main></div>;
}
