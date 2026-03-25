import {
  BookOpen,
  Plus,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useLocale } from "@/i18n/locale";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { fetchMyProfile } from "@/data/profiles";
import { listMySheets } from "@/data/sheets";
import type { SheetRow } from "@/data/sheets";

type SheetFilter = "ALL" | "RPG" | "STORY";

const Catalog = () => {
  const { t } = useLocale();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [sheets, setSheets] = useState<SheetRow[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);

  const filterFromQuery = (): SheetFilter => {
    const f = (searchParams.get("filter") ?? "").toLowerCase();
    if (f === "rpg") return "RPG";
    if (f === "story" || f === "personagem" || f === "personagens") return "STORY";
    return "ALL";
  };

  const [activeFilter, setActiveFilter] = useState<SheetFilter>(filterFromQuery);

  useEffect(() => {
    setActiveFilter(filterFromQuery());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    setAvatarUrl(null);

    if (!user) return;

    fetchMyProfile()
      .then((p) => {
        if (!mounted) return;
        setAvatarUrl(p?.avatar_url ?? null);
      })
      .catch(() => {
        if (!mounted) return;
        setAvatarUrl(null);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;
    setSheets([]);

    if (!user) return;

    setLoadingSheets(true);
    listMySheets()
      .then((rows) => {
        if (!mounted) return;
        setSheets(rows);
      })
      .catch(() => {
        if (!mounted) return;
        setSheets([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingSheets(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const setFilter = (next: SheetFilter) => {
    setActiveFilter(next);
    const sp = new URLSearchParams(searchParams);
    if (next === "ALL") sp.delete("filter");
    if (next === "RPG") sp.set("filter", "rpg");
    if (next === "STORY") sp.set("filter", "story");
    setSearchParams(sp, { replace: true });
  };

  const filteredSheets = sheets.filter((s) => {
    if (activeFilter === "ALL") return true;
    return s.type === activeFilter;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <nav className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-background/80 nebula-shadow">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-display italic text-accent">
            Grimoire
          </Link>

          <div className="hidden md:flex gap-6">
            <Link
              to="/"
              className="text-foreground/60 hover:text-foreground font-mono uppercase tracking-widest text-xs transition-colors"
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/catalog"
              className="text-accent border-b-2 border-accent pb-1 font-mono uppercase tracking-widest text-xs transition-colors"
            >
              {t("nav.grimoires")}
            </Link>
            <Link
              to="/catalog#ordem"
              className="text-foreground/60 hover:text-foreground font-mono uppercase tracking-widest text-xs transition-colors"
            >
              {t("nav.arcaneOrder")}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to={user ? "/settings?panel=conta" : "/login"} aria-label="Configurações e conta">
            <img
              className="w-10 h-10 rounded-full border border-border/30 object-cover"
              alt="Avatar do perfil"
              src={
                avatarUrl ??
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCVTrhEdSv9a9La2pu_Z8Go5-GtUDqbW7f0PhECmoKXIi9MAnl3Il8-L3jVWxqaKmDQ1Uyb1Rx_glGolEP6vtMMEWhpgKh7x0u_cyNaxQD81dUBn_oWPLr4c2jM0_Z1v3XCqv0LWThJN5pUF1Tv11zSxMaO-gOF6yFUqNRwrOCyijKtfJm9hUlbfJYs7CY1eWDeF8EOcjamKpoYk4xiCGYlEK-xGu4zWUuusasCNPHbD8Yt7aZw7gks8zy4mGYOlCSoE9opFR0VgE66"
              }
            />
          </Link>
        </div>
      </nav>

      {/* Side Navigation Bar (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 pt-20 bg-secondary border-r border-border/50 z-40">
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 astral-gradient rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg text-primary leading-none">Ordem dos Arcanos</h2>
              <p className="font-mono text-[10px] uppercase tracking-tighter text-foreground/40">
                Grande Mestre do Arquivo
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              to="/catalog#fichas"
              onClick={() => setFilter("ALL")}
              className={
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 " +
                (activeFilter === "ALL"
                  ? "bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-accent text-accent font-bold"
                  : "text-foreground/50 hover:text-foreground hover:bg-background/40 hover:translate-x-1")
              }
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-mono uppercase tracking-widest">Biblioteca</span>
            </Link>
            <Link
              to="/catalog#fichas"
              className="w-full flex items-center gap-3 text-foreground/50 hover:text-foreground hover:bg-background/40 hover:translate-x-1 px-4 py-3 rounded-lg transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-mono uppercase tracking-widest">Magias Ativas</span>
            </Link>
            <Link
              to="/catalog#chat"
              className="w-full flex items-center gap-3 text-foreground/50 hover:text-foreground hover:bg-background/40 hover:translate-x-1 px-4 py-3 rounded-lg transition-all duration-300"
            >
              <Users className="w-5 h-5" />
              <span className="text-sm font-mono uppercase tracking-widest">Chat do Grupo</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto px-6 py-8 border-t border-border/30">
          <button
            type="button"
            className="w-full astral-gradient text-primary-foreground py-3 rounded-lg font-mono uppercase tracking-widest text-xs hover:scale-[0.98] transition-transform duration-200 shadow-lg"
          >
            Convocar Novo Aliado
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main id="ordem" className="md:ml-64 p-6 md:p-12 max-w-7xl mx-auto">
        {/* Hero Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground tracking-tight mb-4 italic">
              {t("catalog.heroTitle")}
            </h1>
            <p className="text-lg text-muted-foreground font-body leading-relaxed">
              {t("catalog.heroDescription")}
            </p>
          </div>
          <button
            type="button"
            className="astral-gradient group relative flex items-center gap-3 px-8 py-4 rounded-full text-primary-foreground font-mono uppercase tracking-widest text-sm hover:scale-105 transition-transform duration-300 shadow-[0_10px_30px_hsl(var(--primary)/0.3)]"
          >
            <Plus className="w-5 h-5" />
            {t("catalog.newSheet")}
          </button>
        </header>

        {/* Sub Navigation & Mode Selector */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12 border-b border-border/50 pb-4">
          <div className="flex gap-8 overflow-x-auto w-full md:w-auto no-scrollbar">
            <Link
              to="/catalog#fichas"
              className="flex items-center gap-2 text-accent font-display text-xl border-b-2 border-accent pb-3 whitespace-nowrap"
            >
              <span>📜</span> {t("catalog.tabs.sheets")}
            </Link>
            <Link
              to="/catalog#membros"
              className="flex items-center gap-2 text-foreground/60 hover:text-foreground font-display text-xl pb-3 whitespace-nowrap transition-colors"
            >
              <span>👥</span> {t("catalog.tabs.members")}
            </Link>
            <Link
              to="/catalog#chat"
              className="flex items-center gap-2 text-foreground/60 hover:text-foreground font-display text-xl pb-3 whitespace-nowrap transition-colors"
            >
              <span>💬</span> {t("catalog.tabs.chat")}
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2 text-foreground/60 hover:text-foreground font-display text-xl pb-3 whitespace-nowrap transition-colors"
            >
              <span>⚙️</span> {t("catalog.tabs.settings")}
            </Link>
          </div>

          {/* Interactive Mode Selector */}
          <div className="flex bg-secondary p-1 rounded-full border border-border/50">
            <button
              type="button"
              onClick={() => setFilter("RPG")}
              className={
                "flex items-center gap-2 px-6 py-2 rounded-full font-mono text-xs uppercase tracking-tighter transition-colors " +
                (activeFilter === "RPG"
                  ? "astral-gradient text-primary-foreground"
                  : "text-foreground/50 hover:text-foreground")
              }
            >
              <span>⚔️</span> {t("catalog.mode.rpg")}
            </button>
            <button
              type="button"
              onClick={() => setFilter("STORY")}
              className={
                "flex items-center gap-2 px-6 py-2 rounded-full font-mono text-xs uppercase tracking-tighter transition-colors " +
                (activeFilter === "STORY"
                  ? "astral-gradient text-primary-foreground"
                  : "text-foreground/50 hover:text-foreground")
              }
            >
              <span>🪶</span> {t("catalog.mode.story")}
            </button>
          </div>
        </div>

        {/* Section: Fichas (Bento Grid) */}
          <section id="fichas" className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!user && (
                <div className="col-span-full rounded-xl border border-border/50 bg-secondary/40 p-6 text-muted-foreground font-body">
                  Faça login para ver suas fichas salvas.
                </div>
              )}

              {user && loadingSheets && (
                <div className="col-span-full rounded-xl border border-border/50 bg-secondary/40 p-6 text-muted-foreground font-body">
                  Carregando fichas...
                </div>
              )}

              {user && !loadingSheets && filteredSheets.length === 0 && (
                <div className="col-span-full rounded-xl border border-border/50 bg-secondary/40 p-6 text-muted-foreground font-body">
                  Nenhuma ficha encontrada para este filtro.
                </div>
              )}

              {user && !loadingSheets &&
                filteredSheets.map((sheet) => (
                  <div
                    key={sheet.id}
                    className="rounded-xl border border-border/50 bg-secondary/40 p-6 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-display italic text-xl text-foreground truncate">
                          {sheet.title}
                        </div>
                        <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                          Atualizado: {new Date(sheet.updated_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <span
                        className={
                          "inline-flex font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border " +
                          (sheet.type === "RPG"
                            ? "border-accent/40 bg-accent/10 text-accent"
                            : "border-primary/30 bg-primary/10 text-primary")
                        }
                      >
                        {sheet.type === "RPG" ? "RPG" : "História"}
                      </span>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground font-body line-clamp-3">
                      {(sheet.type === "RPG"
                        ? (sheet.data as any)?.notes
                        : (sheet.data as any)?.motivation) ||
                        "—"}
                    </div>
                  </div>
                ))}
            </div>
          </section>

        {/* Section: Membros (List View) */}
        <section id="membros" className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display italic">{t("catalog.membersTitle")}</h2>
            <span className="font-mono text-xs uppercase tracking-widest text-foreground/40">
              {t("catalog.membersCount")}
            </span>
          </div>
          <div className="space-y-4" />
        </section>

        <section id="chat" className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display italic">Chat</h2>
            <span className="font-mono text-xs uppercase tracking-widest text-foreground/40">Em breve</span>
          </div>
          <div className="h-24 rounded-xl border border-border/50 bg-secondary/40" />
        </section>

        <section id="configuracoes" className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display italic">Configurações</h2>
          </div>
          <div className="h-24 rounded-xl border border-border/50 bg-secondary/40" />
        </section>

        <section id="biblioteca" className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display italic">Biblioteca</h2>
          </div>
          <div className="h-24 rounded-xl border border-border/50 bg-secondary/40" />
        </section>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/80 glass-panel py-3 px-6 flex justify-between items-center z-50">
        <Link to="/catalog#biblioteca" className="flex flex-col items-center gap-1 text-accent">
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-mono uppercase">Biblioteca</span>
        </Link>
        <Link to="/catalog#chat" className="flex flex-col items-center gap-1 text-foreground/40">
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-mono uppercase">{t("catalog.tabs.chat")}</span>
        </Link>
        <Link
          to="/sheets/new"
          className="astral-gradient w-12 h-12 rounded-full flex items-center justify-center -mt-10 shadow-lg"
          aria-label={t("catalog.newSheet")}
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </Link>
        <Link to="/settings" className="flex flex-col items-center gap-1 text-foreground/40">
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-mono uppercase">{t("catalog.tabs.settingsShort")}</span>
        </Link>
      </nav>
    </div>
  );
};

export default Catalog;
