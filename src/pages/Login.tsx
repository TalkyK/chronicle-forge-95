import { useEffect, useRef, useState } from "react";
import { ArrowRight, KeyRound, Lock, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLocale } from "@/i18n/locale";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { updateMyProfile } from "@/data/profiles";

type LoginTab = "login" | "register" | "complete";

type Coin = {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
};

function getThemeAccentColor(): string {
  if (typeof window === "undefined") return "hsl(0 0% 100%)";
  const rawAccent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  if (!rawAccent) return "hsl(0 0% 100%)";
  return `hsl(${rawAccent})`;
}

const Login = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { signInWithPassword, signUpWithPassword, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const redirectTarget = searchParams.get("redirect");

  const tabFromQuery = (): LoginTab => {
    const raw = (searchParams.get("tab") ?? "").toLowerCase();
    if (raw === "register" || raw === "cadastro") return "register";
    if (raw === "complete" || raw === "completar") return "complete";
    return "login";
  };

  const [tab, setTab] = useState<LoginTab>(tabFromQuery);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTab(tabFromQuery());
  }, [searchParams]);

  useEffect(() => {
    if (tab === "complete" && user?.email) {
      setIdentifier(user.email);
    }
  }, [tab, user?.email]);

  const setTabAndUrl = (next: LoginTab) => {
    setTab(next);
    const sp = new URLSearchParams(searchParams);
    if (next === "login") sp.delete("tab");
    else sp.set("tab", next);
    setSearchParams(sp, { replace: true });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const coinCount = 100;
    const coins: Coin[] = [];
    const goldColor = getThemeAccentColor();

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const createCoin = (): Coin => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
    });

    const drawCoin = (coin: Coin) => {
      ctx.save();
      ctx.translate(coin.x, coin.y);
      ctx.rotate(coin.rotation);

      ctx.shadowBlur = 10;
      ctx.shadowColor = goldColor;

      ctx.beginPath();
      ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
      ctx.fillStyle = goldColor;
      ctx.globalAlpha = coin.opacity;
      ctx.fill();

      ctx.font = `${coin.size * 1.2}px serif`;
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 0, 0);

      ctx.restore();
    };

    const update = () => {
      for (const coin of coins) {
        coin.y += coin.speed;
        coin.rotation += coin.rotationSpeed;

        if (coin.y > height + 20) {
          coin.y = -20;
          coin.x = Math.random() * width;
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const coin of coins) drawCoin(coin);
      update();
      animationRef.current = window.requestAnimationFrame(animate);
    };

    resize();
    coins.length = 0;
    for (let i = 0; i < coinCount; i += 1) coins.push(createCoin());

    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="bg-background text-foreground overflow-hidden min-h-screen selection:bg-primary selection:text-white">
      {/* Canvas Animation Layer */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />

      {/* Background Polish */}
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, hsl(var(--background) / 0.8) 100%)",
        }}
      />

      {/* Main Content */}
      <main className="relative z-20 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-md w-full">
          <div className="glass-card rounded-2xl p-10 md:p-12 transform transition-all duration-500">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground text-center">
                {tab === "login" ? t("login.title") : tab === "register" ? "Criar conta" : "Completar cadastro"}
              </h1>
            </div>

            {tab === "complete" && !user && (
              <div className="mb-6 rounded-xl border border-border/50 bg-foreground/5 p-4 text-sm text-muted-foreground font-body">
                Para completar o cadastro, primeiro entre com Google.
              </div>
            )}

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (isSubmitting) return;
                  const emailOrUsername = identifier.trim();

                if (tab === "login") {
                    if (!emailOrUsername || !password) {
                    toast({
                      variant: "destructive",
                      title: "Dados inválidos",
                        description: "Informe usuário ou e-mail e senha.",
                    });
                    return;
                  }

                  setIsSubmitting(true);
                    signInWithPassword({ emailOrUsername, password })
                    .then(() => {
                      toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
                      navigate(redirectTarget || "/catalog");
                    })
                    .catch((err: unknown) => {
                      const message =
                        err && typeof err === "object" && "message" in err
                          ? String((err as { message?: unknown }).message)
                          : "Não foi possível fazer login.";
                      toast({ variant: "destructive", title: "Falha no login", description: message });
                    })
                    .finally(() => setIsSubmitting(false));
                  return;
                }

                if (tab === "register") {
                    if (!emailOrUsername || !password || !username.trim()) {
                    toast({
                      variant: "destructive",
                      title: "Dados inválidos",
                        description: "Informe usuário, e-mail e senha para criar a conta.",
                    });
                    return;
                  }

                  setIsSubmitting(true);
                    signUpWithPassword({ email: emailOrUsername, password, username: username.trim() })
                      .then((result) => {
                        toast({
                          title: "Conta criada",
                          description: result.message || "Verifique seu e-mail para confirmar e depois faça login.",
                        });
                        setTabAndUrl("login");
                      })
                    .catch((err: unknown) => {
                      const message =
                        err && typeof err === "object" && "message" in err
                          ? String((err as { message?: unknown }).message)
                          : "Não foi possível criar a conta.";
                      toast({ variant: "destructive", title: "Falha ao criar conta", description: message });
                    })
                    .finally(() => setIsSubmitting(false));
                  return;
                }

                // complete
                if (!user) {
                  toast({ variant: "destructive", title: "Entre com Google", description: "Faça login com Google para continuar." });
                  return;
                }

                if (!password || !displayName.trim()) {
                  toast({
                    variant: "destructive",
                    title: "Dados inválidos",
                    description: "Informe nome de usuário e senha.",
                  });
                  return;
                }

                setIsSubmitting(true);
                Promise.all([
                  updateMyProfile({ display_name: displayName.trim() }),
                  supabase.auth.updateUser({ password }),
                ])
                  .then(() => {
                    toast({ title: "Cadastro concluído", description: "Conta configurada com sucesso." });
                    navigate(redirectTarget || "/catalog");
                  })
                  .catch((err: unknown) => {
                    const message =
                      err && typeof err === "object" && "message" in err
                        ? String((err as { message?: unknown }).message)
                        : "Não foi possível concluir o cadastro.";
                    toast({ variant: "destructive", title: "Falha", description: message });
                  })
                  .finally(() => setIsSubmitting(false));
              }}
            >
              {tab === "register" && (
                <div className="space-y-1.5 group">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                    Nome de usuário
                  </label>
                  <div className="relative input-glow transition-all duration-300">
                    <input
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 focus:ring-0 transition-all font-body"
                      placeholder="Escolha um nome"
                      type="text"
                      autoComplete="nickname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <User className="absolute right-4 top-3.5 w-5 h-5 text-foreground/20" />
                  </div>
                </div>
              )}

              {tab === "complete" && (
                <div className="space-y-1.5 group">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                    Nome de exibição
                  </label>
                  <div className="relative input-glow transition-all duration-300">
                    <input
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 focus:ring-0 transition-all font-body"
                      placeholder="Como quer ser chamado"
                      type="text"
                      autoComplete="nickname"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <User className="absolute right-4 top-3.5 w-5 h-5 text-foreground/20" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 group">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  {tab === "complete" || tab === "register" ? "E-mail" : t("login.username")}
                </label>
                <div className="relative input-glow transition-all duration-300">
                  <input
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 focus:ring-0 transition-all font-body"
                    placeholder={
                      tab === "login" ? "E-mail ou usuário" : t("login.usernamePlaceholder")
                    }
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={tab === "complete"}
                  />
                  <User className="absolute right-4 top-3.5 w-5 h-5 text-foreground/20" />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  {t("login.password")}
                </label>
                <div className="relative input-glow transition-all duration-300">
                  <input
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 focus:ring-0 transition-all font-body"
                    placeholder={t("login.passwordPlaceholder")}
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <KeyRound className="absolute right-4 top-3.5 w-5 h-5 text-foreground/20" />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    className="w-4 h-4 rounded border-foreground/20 bg-foreground/5 text-primary focus:ring-offset-0 focus:ring-primary/50"
                    type="checkbox"
                  />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {t("login.rememberMe")}
                  </span>
                </label>
                {tab === "login" && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-accent hover:underline underline-offset-4 transition-all"
                  >
                    {t("login.forgotPassword")}
                  </button>
                )}
              </div>

              <div className="pt-4">
                <button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold py-4 rounded-xl flex items-center justify-center gap-2 transform transition-all duration-300 active:scale-[0.98] shadow-lg shadow-primary/20 group"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>
                    {tab === "login" ? t("login.submit") : tab === "register" ? "Criar conta" : "Concluir"}
                  </span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {(tab === "register" || tab === "login" || (tab === "complete" && !user)) && (
                <button
                  type="button"
                  className="w-full bg-foreground/5 hover:bg-foreground/10 text-foreground font-heading font-bold py-4 rounded-xl flex items-center justify-center gap-2 transform transition-all duration-300 active:scale-[0.98] border border-foreground/10"
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (isSubmitting) return;
                    setIsSubmitting(true);
                    try {
                      console.log("OAuth start: google");
                      const { data, error } = await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: {
                          redirectTo: `${window.location.origin}/auth/callback${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`,
                          skipBrowserRedirect: true,
                        },
                      });

                      console.log("OAuth redirect payload:", data);

                      if (error) {
                        toast({
                          variant: "destructive",
                          title: "Google indisponível",
                          description:
                            "O provedor Google não está habilitado no Supabase (Auth → Providers). Ative e tente novamente.",
                        });
                        setIsSubmitting(false);
                        return;
                      }

                      if (!data?.url) {
                        toast({
                          variant: "destructive",
                          title: "Falha",
                          description: "Não foi possível iniciar o login com Google.",
                        });
                        setIsSubmitting(false);
                        return;
                      }

                      console.log("Redirecting to Google OAuth...");
                      window.location.assign(data.url);
                    } catch {
                      toast({ variant: "destructive", title: "Falha", description: "Não foi possível entrar com Google." });
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <span className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center font-mono">G</span>
                  <span>Continuar com Google</span>
                </button>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm font-body">
                {tab === "login" ? (
                  <>
                    {t("login.noAccount")}
                    <button
                      type="button"
                      className="text-accent font-bold hover:underline underline-offset-4 ml-1"
                      onClick={() => setTabAndUrl("register")}
                      disabled={isSubmitting}
                    >
                      {t("login.register")}
                    </button>
                  </>
                ) : (
                  <>
                    Já tem uma conta?
                    <button
                      type="button"
                      className="text-accent font-bold hover:underline underline-offset-4 ml-1"
                      onClick={() => setTabAndUrl("login")}
                      disabled={isSubmitting}
                    >
                      Voltar ao login
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
