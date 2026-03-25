import type { ChangeEventHandler } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Shield, Bell, User, Lock, Globe, ArrowLeft } from "lucide-react";
import { useLocale } from "@/i18n/locale";
import type { Locale, MessageKey } from "@/i18n/messages";
import { fetchMyProfile, updateMyProfile, uploadMyAvatar, upsertMyProfileLocale } from "@/data/profiles";
import { useAuth } from "@/auth/AuthProvider";

type PanelId = "idioma" | "conta" | "privacidade" | "notificacoes" | "seguranca";

type LanguageId = "pt-BR" | "pt-PT" | "en" | "es" | "fr" | "de" | "ja" | "it";

type LanguageOption = {
  id: LanguageId;
  flag: string;
  label: string;
};

const languageOptions: LanguageOption[] = [
  { id: "pt-BR", flag: "🇧🇷", label: "Português BR" },
  { id: "pt-PT", flag: "🇵🇹", label: "Português PT" },
  { id: "en", flag: "🇺🇸", label: "English" },
  { id: "es", flag: "🇪🇸", label: "Español" },
  { id: "fr", flag: "🇫🇷", label: "Français" },
  { id: "de", flag: "🇩🇪", label: "Deutsch" },
  { id: "ja", flag: "🇯🇵", label: "日本語" },
  { id: "it", flag: "🇮🇹", label: "Italiano" },
];

const Settings = () => {
  const { locale, setLocale, t } = useLocale();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<PanelId>("idioma");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>(locale);
  const [showNotif, setShowNotif] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const navItems = useMemo(
    () =>
      [
        { id: "idioma" as const, icon: Globe, labelKey: "settings.panels.language" as const },
        { id: "conta" as const, icon: User, labelKey: "settings.panels.account" as const },
        { id: "privacidade" as const, icon: Lock, labelKey: "settings.panels.privacy" as const },
        { id: "notificacoes" as const, icon: Bell, labelKey: "settings.panels.notifications" as const },
        { id: "seguranca" as const, icon: Shield, labelKey: "settings.panels.security" as const },
      ] satisfies Array<{ id: PanelId; icon: typeof Globe; labelKey: MessageKey }>,
    []
  );

  const panelDescKeyById: Record<PanelId, MessageKey> = {
    idioma: "settings.desc.language",
    conta: "settings.desc.account",
    privacidade: "settings.desc.privacy",
    notificacoes: "settings.desc.notifications",
    seguranca: "settings.desc.security",
  };

  const save = () => {
    setShowNotif(true);
  };

  useEffect(() => {
    const panel = searchParams.get("panel");
    if (
      panel === "idioma" ||
      panel === "conta" ||
      panel === "privacidade" ||
      panel === "notificacoes" ||
      panel === "seguranca"
    ) {
      setActivePanel(panel);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!showNotif) return;
    const t = window.setTimeout(() => setShowNotif(false), 2500);
    return () => window.clearTimeout(t);
  }, [showNotif]);

  useEffect(() => {
    setSelectedLanguage(locale);
  }, [locale]);

  useEffect(() => {
    let mounted = true;

    setProfileLoading(true);
    setAvatarUrl(null);

    if (!user) {
      setDisplayName("");
      setProfileLoading(false);
      return;
    }

    fetchMyProfile()
      .then((p) => {
        if (!mounted) return;
        const nextDisplayName = (p?.display_name ?? "").trim();
        setDisplayName(nextDisplayName);
        setAvatarUrl(p?.avatar_url ?? null);
      })
      .catch(() => {
        if (!mounted) return;
        setDisplayName("");
        setAvatarUrl(null);
      })
      .finally(() => {
        if (!mounted) return;
        setProfileLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const avatarInitials = useMemo(() => {
    const base = (displayName || user?.email || "U").trim();
    const parts = base.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
    return (first + (second ?? "")).toUpperCase();
  }, [displayName, user?.email]);

  const handleSaveProfile = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSavingProfile(true);
    try {
      const trimmed = displayName.trim();
      await updateMyProfile({ display_name: trimmed.length ? trimmed : null });
      save();
    } catch {
      window.alert("Não foi possível salvar seu perfil agora.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePickAvatar = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    avatarInputRef.current?.click();
  };

  const handleAvatarChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      window.alert("A imagem deve ter no máximo 2 MB.");
      e.target.value = "";
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await uploadMyAvatar(file);
      setAvatarUrl(url);
      save();
    } catch {
      window.alert("Não foi possível enviar sua imagem agora.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground settings-runes">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-screen relative z-10">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col bg-secondary border-r border-border/50 py-8">
          <div className="px-6 pb-8 border-b border-border/50">
            <div className="w-10 h-10 rounded-full border border-accent flex items-center justify-center mb-3">
              <span className="text-base">⚔</span>
            </div>
            <h1 className="font-heading text-lg font-bold text-accent tracking-wider">FichaQuest</h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Sistema de Fichas</p>
          </div>

          <nav className="py-6 flex-1">
            <div className="px-6 mb-2 mt-2">
              <div className="font-heading text-[10px] tracking-[0.18em] uppercase text-muted-foreground/60">
                {t("settings.section")}
              </div>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePanel(item.id)}
                  className={
                    "w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors border-l-2 " +
                    (activePanel === item.id
                      ? "text-accent bg-accent/10 border-l-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-l-transparent")
                  }
                >
                  <item.icon className={"w-5 h-5 " + (activePanel === item.id ? "opacity-100" : "opacity-70")} />
                  <span className="font-body text-base">{t(item.labelKey)}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="px-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full astral-gradient flex items-center justify-center border border-border/50">
                <span className="font-heading text-sm font-semibold text-primary-foreground">AR</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground truncate">Arathorn Darkblade</div>
                <div className="text-xs text-muted-foreground">Mestre de Aventuras · Pro</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="p-6 md:p-10 overflow-y-auto">
          <div className="mb-10 pb-6 border-b border-border/50 relative">
            <div className="absolute -bottom-px left-0 w-20 h-px bg-accent" />
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Link to="/catalog" className="hover:text-foreground transition-colors">
                    {t("settings.section")}
                  </Link>{" "}
                  <span className="text-muted-foreground/60">›</span>{" "}
                  <span className="text-muted-foreground">
                    {t(navItems.find((n) => n.id === activePanel)?.labelKey ?? "settings.section")}
                  </span>
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t("settings.backHome")}</span>
                </Link>
              </div>
            </div>

            <h2 className="font-heading text-2xl font-bold text-accent mt-2">
              {t(navItems.find((n) => n.id === activePanel)?.labelKey ?? "settings.section")}
            </h2>

            <p className="text-muted-foreground italic mt-1">{t(panelDescKeyById[activePanel])}</p>
          </div>

          {/* Idioma */}
          {activePanel === "idioma" && (
            <>
              <section className="bg-secondary border border-border/50 rounded-sm p-7 mb-6 relative settings-card-topline">
                <div className="font-heading text-sm tracking-widest text-accent mb-1">{t("settings.language.interfaceTitle")}</div>
                <div className="text-muted-foreground italic mb-6">{t("settings.language.interfaceDesc")}</div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(opt.id);
                        setLocale(opt.id as Locale);
                        upsertMyProfileLocale(opt.id as Locale).catch(() => {
                          // silencioso: sem sessão ou falha de rede não deve quebrar a UI
                        });
                      }}
                      className={
                        "border rounded-sm p-4 text-center transition-colors bg-background hover:bg-foreground/5 " +
                        (selectedLanguage === opt.id ? "border-accent bg-accent/10" : "border-border/50")
                      }
                    >
                      <span className="text-2xl block mb-2">{opt.flag}</span>
                      <div className={
                        "font-heading text-xs tracking-wider " +
                        (selectedLanguage === opt.id ? "text-accent" : "text-muted-foreground")
                      }>
                        {opt.label}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-6 flex-wrap">
                  <button
                    type="button"
                    onClick={save}
                    className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-accent/60 bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                  >
                    {t("settings.language.save")}
                  </button>
                </div>
              </section>

              <section className="bg-secondary border border-border/50 rounded-sm p-7 mb-6 relative settings-card-topline">
                <div className="font-heading text-sm tracking-widest text-accent mb-1">{t("settings.language.regionalTitle")}</div>
                <div className="text-muted-foreground italic mb-6">{t("settings.language.regionalDesc")}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-heading text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Formato de Data
                    </label>
                    <select
                      className="w-full bg-background border border-border/50 text-foreground px-3 py-2.5 rounded-sm outline-none focus:border-accent/60"
                      defaultValue="br"
                    >
                      <option value="br">DD/MM/AAAA (Padrão BR)</option>
                      <option value="us">MM/DD/YYYY (US)</option>
                      <option value="iso">AAAA-MM-DD (ISO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-heading text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Fuso Horário
                    </label>
                    <select
                      className="w-full bg-background border border-border/50 text-foreground px-3 py-2.5 rounded-sm outline-none focus:border-accent/60"
                      defaultValue="sp"
                    >
                      <option value="sp">America/Sao_Paulo (UTC-3)</option>
                      <option value="manaus">America/Manaus (UTC-4)</option>
                      <option value="noronha">America/Noronha (UTC-2)</option>
                      <option value="utc">UTC</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 flex-wrap">
                  <button
                    type="button"
                    onClick={save}
                    className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-accent/60 bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                  >
                    Aplicar Formato
                  </button>
                  <button
                    type="button"
                    className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    Restaurar Padrão
                  </button>
                </div>
              </section>
            </>
          )}

          {/* Conta */}
          {activePanel === "conta" && (
            <>
              <section className="bg-secondary border border-border/50 rounded-sm p-7 mb-6 relative settings-card-topline">
                <div className="font-heading text-sm tracking-widest text-accent mb-1">Perfil do Aventureiro</div>
                <div className="text-muted-foreground italic mb-6">
                  Nome e identificação visíveis para outros jogadores e mestres
                </div>

                {!user && (
                  <div className="text-sm text-muted-foreground italic">
                    Você precisa estar logado para editar sua conta. <Link to="/login" className="text-accent hover:underline">Ir para login</Link>.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-heading text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Nome de Usuário
                    </label>
                    <input
                      className="w-full bg-background border border-border/50 text-foreground px-3 py-2.5 rounded-sm outline-none focus:border-accent/60"
                      value={user?.email ?? ""}
                      type="text"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block font-heading text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Nome de Exibição
                    </label>
                    <input
                      className="w-full bg-background border border-border/50 text-foreground px-3 py-2.5 rounded-sm outline-none focus:border-accent/60"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      type="text"
                      placeholder={profileLoading ? "Carregando..." : "Seu nome"}
                      disabled={!user || profileLoading || savingProfile}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block font-heading text-xs uppercase tracking-widest text-muted-foreground mb-2">E-mail</label>
                  <input
                    className="w-full bg-background border border-border/50 text-foreground px-3 py-2.5 rounded-sm outline-none focus:border-accent/60"
                    value={user?.email ?? ""}
                    type="email"
                    disabled
                  />
                </div>

                <div className="flex gap-3 mt-6 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-accent/60 bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                    disabled={profileLoading || savingProfile}
                  >
                    {savingProfile ? "Salvando..." : "Salvar Perfil"}
                  </button>
                  <button
                    type="button"
                    className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                    onClick={() => {
                      if (!user) return;
                      fetchMyProfile()
                        .then((p) => {
                          setDisplayName((p?.display_name ?? "").trim());
                          setAvatarUrl(p?.avatar_url ?? null);
                        })
                        .catch(() => {
                          // silencioso
                        });
                    }}
                    disabled={!user || profileLoading || savingProfile}
                  >
                    Cancelar
                  </button>
                </div>
              </section>

              <section className="bg-secondary border border-border/50 rounded-sm p-7 mb-6 relative settings-card-topline">
                <div className="font-heading text-sm tracking-widest text-accent mb-1">Avatar & Aparência</div>
                <div className="text-muted-foreground italic mb-6">
                  Imagem de perfil exibida nas sessões e fichas compartilhadas
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  {avatarUrl ? (
                    <img
                      className="w-16 h-16 rounded-full border border-border/50 object-cover"
                      alt="Avatar do perfil"
                      src={avatarUrl}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full astral-gradient flex items-center justify-center border border-border/50">
                      <span className="font-heading text-xl font-bold text-primary-foreground">{avatarInitials}</span>
                    </div>
                  )}
                  <div>
                    <button
                      type="button"
                      onClick={handlePickAvatar}
                      className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors block"
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? "Enviando..." : "Enviar Imagem"}
                    </button>
                    <p className="text-sm text-muted-foreground italic mt-2">
                      PNG ou JPG · Máx. 2 MB · 500×500px recomendado
                    </p>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Privacidade */}
          {activePanel === "privacidade" && (
            <>
              <section className="bg-secondary border border-border/50 rounded-sm p-7 mb-6 relative settings-card-topline">
                <div className="font-heading text-sm tracking-widest text-accent mb-1">Visibilidade do Perfil</div>
                <div className="text-muted-foreground italic mb-6">Quem pode ver seu perfil e fichas na plataforma</div>

                {[
                  {
                    title: "Perfil Público",
                    desc: "Outros aventureiros podem encontrar e ver seu perfil",
                    defaultChecked: true,
                  },
                  {
                    title: "Fichas Públicas por Padrão",
                    desc: "Novas fichas criadas ficam visíveis para outros jogadores",
                    defaultChecked: false,
                  },
                  {
                    title: "Exibir Campanhas Ativas",
                    desc: "Mostra suas campanhas em andamento no perfil público",
                    defaultChecked: true,
                  },
                ].map((row) => (
                  <div key={row.title} className="flex items-center justify-between py-4 border-b border-border/50 last:border-b-0">
                    <div>
                      <h4 className="text-base font-semibold text-foreground">{row.title}</h4>
                      <p className="text-sm text-muted-foreground italic">{row.desc}</p>
                    </div>
                    <label className="relative w-11 h-6 flex-shrink-0">
                      <input
                        type="checkbox"
                        defaultChecked={row.defaultChecked}
                        onChange={save}
                        className="peer sr-only"
                      />
                      <span className="absolute inset-0 rounded-full border border-border/60 bg-background transition-colors peer-checked:bg-accent/20 peer-checked:border-accent/60" />
                      <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-muted-foreground transition-all peer-checked:translate-x-5 peer-checked:bg-accent" />
                    </label>
                  </div>
                ))}
              </section>

              <section className="bg-secondary border border-border/50 rounded-sm p-7 mb-6 relative settings-card-topline">
                <div className="font-heading text-sm tracking-widest text-accent mb-1">Uso de Dados & Análises</div>
                <div className="text-muted-foreground italic mb-6">Como usamos seus dados para melhorar a plataforma</div>

                {[
                  {
                    title: "Análises de Uso",
                    desc: "Dados anônimos para melhorar funcionalidades do sistema",
                    defaultChecked: true,
                  },
                  {
                    title: "Cookies de Personalização",
                    desc: "Lembrar preferências de layout e exibição de fichas",
                    defaultChecked: true,
                  },
                  {
                    title: "E-mails de Marketing",
                    desc: "Novidades, eventos e conteúdo especial de RPG",
                    defaultChecked: false,
                  },
                ].map((row) => (
                  <div key={row.title} className="flex items-center justify-between py-4 border-b border-border/50 last:border-b-0">
                    <div>
                      <h4 className="text-base font-semibold text-foreground">{row.title}</h4>
                      <p className="text-sm text-muted-foreground italic">{row.desc}</p>
                    </div>
                    <label className="relative w-11 h-6 flex-shrink-0">
                      <input
                        type="checkbox"
                        defaultChecked={row.defaultChecked}
                        onChange={save}
                        className="peer sr-only"
                      />
                      <span className="absolute inset-0 rounded-full border border-border/60 bg-background transition-colors peer-checked:bg-accent/20 peer-checked:border-accent/60" />
                      <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-muted-foreground transition-all peer-checked:translate-x-5 peer-checked:bg-accent" />
                    </label>
                  </div>
                ))}
              </section>

              <section className="bg-secondary border border-border/50 rounded-sm p-7 mb-6 relative settings-card-topline">
                <div className="font-heading text-sm tracking-widest text-accent mb-1">Seus Dados</div>
                <div className="text-muted-foreground italic mb-6">Histórico de atividade e armazenamento em uso</div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        {["Tipo de Dado", "Itens", "Tamanho", "Status"].map((th) => (
                          <th
                            key={th}
                            className="text-left font-heading text-[11px] tracking-widest uppercase text-muted-foreground/60 py-2.5 px-3"
                          >
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { t: "Fichas de Personagens", i: "34", s: "12,4 MB", b: "Sincronizado", v: "success" as const },
                        { t: "Campanhas & Cenários", i: "7", s: "5,2 MB", b: "Sincronizado", v: "success" as const },
                        { t: "Imagens & Mapas", i: "89", s: "124 MB", b: "Parcial", v: "accent" as const },
                        { t: "Registros de Sessão", i: "210", s: "3,8 MB", b: "Sincronizado", v: "success" as const },
                      ].map((row) => (
                        <tr key={row.t} className="border-b border-accent/10 last:border-b-0 hover:bg-foreground/5">
                          <td className="py-3 px-3 text-muted-foreground hover:text-foreground">{row.t}</td>
                          <td className="py-3 px-3 text-muted-foreground">{row.i}</td>
                          <td className="py-3 px-3 text-muted-foreground">{row.s}</td>
                          <td className="py-3 px-3">
                            <span
                              className={
                                "inline-flex font-heading text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border " +
                                (row.v === "success"
                                  ? "bg-success/20 border-success/40 text-success"
                                  : "bg-accent/10 border-border/60 text-accent")
                              }
                            >
                              {row.b}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Armazenamento usado</span>
                    <span>
                      145,4 MB de <span className="text-accent">500 MB</span>
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-sm border border-border/50 bg-background overflow-hidden">
                    <div className="h-full w-[38%] bg-gradient-to-r from-accent/60 to-accent" />
                  </div>
                </div>

                <div className="flex gap-3 mt-6 flex-wrap">
                  <button
                    type="button"
                    className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    Exportar Meus Dados
                  </button>
                  <button
                    type="button"
                    className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    Baixar Backup (ZIP)
                  </button>
                </div>
              </section>

              <section className="bg-secondary border border-destructive/40 rounded-sm p-7 mb-6 relative settings-card-topline">
                <div className="font-heading text-sm tracking-widest text-destructive mb-1">⚠ Zona de Perigo</div>
                <div className="text-muted-foreground italic mb-6">
                  Ações irreversíveis — prossiga com sabedoria, aventureiro
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    Apagar Histórico de Sessões
                  </button>
                  <button
                    type="button"
                    className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    Excluir Conta Permanentemente
                  </button>
                </div>
              </section>
            </>
          )}

          {/* Notificações */}
          {activePanel === "notificacoes" && (
            <section className="bg-secondary border border-border/50 rounded-sm p-7 mb-6 relative settings-card-topline">
              <div className="font-heading text-sm tracking-widest text-accent mb-4">Alertas da Plataforma</div>

              {[
                {
                  title: "Convites para Campanhas",
                  desc: "Quando um mestre te convidar para uma nova aventura",
                  defaultChecked: true,
                },
                {
                  title: "Sessão Agendada",
                  desc: "Lembrete 1 hora antes da próxima sessão",
                  defaultChecked: true,
                },
                {
                  title: "Atualizações do Sistema",
                  desc: "Novas funcionalidades e manutenções programadas",
                  defaultChecked: false,
                },
              ].map((row) => (
                <div key={row.title} className="flex items-center justify-between py-4 border-b border-border/50 last:border-b-0">
                  <div>
                    <h4 className="text-base font-semibold text-foreground">{row.title}</h4>
                    <p className="text-sm text-muted-foreground italic">{row.desc}</p>
                  </div>
                  <label className="relative w-11 h-6 flex-shrink-0">
                    <input
                      type="checkbox"
                      defaultChecked={row.defaultChecked}
                      onChange={save}
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 rounded-full border border-border/60 bg-background transition-colors peer-checked:bg-accent/20 peer-checked:border-accent/60" />
                    <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-muted-foreground transition-all peer-checked:translate-x-5 peer-checked:bg-accent" />
                  </label>
                </div>
              ))}
            </section>
          )}

          {/* Segurança */}
          {activePanel === "seguranca" && (
            <>
              <section className="bg-secondary border border-border/50 rounded-sm p-7 mb-6 relative settings-card-topline">
                <div className="font-heading text-sm tracking-widest text-accent mb-1">Alterar Senha</div>
                <div className="text-muted-foreground italic mb-6">Use uma senha forte como um escudo encantado</div>

                <div>
                  <label className="block font-heading text-xs uppercase tracking-widest text-muted-foreground mb-2">Senha Atual</label>
                  <input
                    className="w-full bg-background border border-border/50 text-foreground px-3 py-2.5 rounded-sm outline-none focus:border-accent/60"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block font-heading text-xs uppercase tracking-widest text-muted-foreground mb-2">Nova Senha</label>
                    <input
                      className="w-full bg-background border border-border/50 text-foreground px-3 py-2.5 rounded-sm outline-none focus:border-accent/60"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block font-heading text-xs uppercase tracking-widest text-muted-foreground mb-2">Confirmar Nova Senha</label>
                    <input
                      className="w-full bg-background border border-border/50 text-foreground px-3 py-2.5 rounded-sm outline-none focus:border-accent/60"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6 flex-wrap">
                  <button
                    type="button"
                    onClick={save}
                    className="font-heading text-xs tracking-widest uppercase px-6 py-2.5 rounded-sm border border-accent/60 bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                  >
                    Alterar Senha
                  </button>
                </div>
              </section>

              <section className="bg-secondary border border-border/50 rounded-sm p-7 mb-6 relative settings-card-topline">
                <div className="font-heading text-sm tracking-widest text-accent mb-1">Autenticação em Dois Fatores</div>

                {[
                  {
                    title: "Ativar 2FA por Aplicativo",
                    desc: "Google Authenticator, Authy ou compatíveis",
                    defaultChecked: false,
                  },
                  {
                    title: "2FA por SMS",
                    desc: "Código enviado para seu número cadastrado",
                    defaultChecked: true,
                  },
                ].map((row) => (
                  <div key={row.title} className="flex items-center justify-between py-4 border-b border-border/50 last:border-b-0">
                    <div>
                      <h4 className="text-base font-semibold text-foreground">{row.title}</h4>
                      <p className="text-sm text-muted-foreground italic">{row.desc}</p>
                    </div>
                    <label className="relative w-11 h-6 flex-shrink-0">
                      <input
                        type="checkbox"
                        defaultChecked={row.defaultChecked}
                        onChange={save}
                        className="peer sr-only"
                      />
                      <span className="absolute inset-0 rounded-full border border-border/60 bg-background transition-colors peer-checked:bg-accent/20 peer-checked:border-accent/60" />
                      <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-muted-foreground transition-all peer-checked:translate-x-5 peer-checked:bg-accent" />
                    </label>
                  </div>
                ))}
              </section>
            </>
          )}
        </main>
      </div>

      {/* Notification */}
      <div
        className={
          "fixed bottom-8 right-8 z-[100] bg-secondary border border-accent/60 text-accent px-5 py-3 font-heading text-xs tracking-widest rounded-sm shadow-lg transition-all " +
          (showNotif ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0")
        }
        role="status"
        aria-live="polite"
      >
        ✦ Configurações salvas com sucesso
      </div>
    </div>
  );
};

export default Settings;
