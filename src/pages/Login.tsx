import { useEffect, useRef, useState } from "react";
import { ArrowRight, KeyRound, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "@/i18n/locale";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "@/hooks/use-toast";

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
  const { signInWithPassword, signUpWithPassword } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="bg-background text-foreground overflow-hidden min-h-screen selection:bg-primary/30">
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
                {t("login.title")}
              </h1>
            </div>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (isSubmitting) return;
                const email = identifier.trim();
                if (!email || !password) {
                  toast({
                    variant: "destructive",
                    title: "Dados inválidos",
                    description: "Informe usuário/e-mail e senha.",
                  });
                  return;
                }

                setIsSubmitting(true);
                signInWithPassword({ email, password })
                  .then(() => {
                    toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
                    navigate("/catalog");
                  })
                  .catch((err: unknown) => {
                    const message =
                      err && typeof err === "object" && "message" in err
                        ? String((err as { message?: unknown }).message)
                        : "Não foi possível fazer login.";
                    toast({ variant: "destructive", title: "Falha no login", description: message });
                  })
                  .finally(() => setIsSubmitting(false));
              }}
            >
              <div className="space-y-1.5 group">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  {t("login.username")}
                </label>
                <div className="relative input-glow transition-all duration-300">
                  <input
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 focus:ring-0 transition-all font-body"
                    placeholder={t("login.usernamePlaceholder")}
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
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
                <button
                  type="button"
                  className="text-xs font-semibold text-accent hover:underline underline-offset-4 transition-all"
                >
                  {t("login.forgotPassword")}
                </button>
              </div>

              <div className="pt-4">
                <button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold py-4 rounded-xl flex items-center justify-center gap-2 transform transition-all duration-300 active:scale-[0.98] shadow-lg shadow-primary/20 group"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>{t("login.submit")}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm font-body">
                {t("login.noAccount")}
                <button
                  type="button"
                  className="text-accent font-bold hover:underline underline-offset-4 ml-1"
                  onClick={() => {
                    if (isSubmitting) return;
                    const email = identifier.trim();
                    if (!email || !password) {
                      toast({
                        variant: "destructive",
                        title: "Dados inválidos",
                        description: "Informe usuário/e-mail e senha para criar a conta.",
                      });
                      return;
                    }

                    setIsSubmitting(true);
                    signUpWithPassword({ email, password })
                      .then(() => {
                        toast({
                          title: "Conta criada",
                          description:
                            "Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada.",
                        });
                      })
                      .catch((err: unknown) => {
                        const message =
                          err && typeof err === "object" && "message" in err
                            ? String((err as { message?: unknown }).message)
                            : "Não foi possível criar a conta.";
                        toast({ variant: "destructive", title: "Falha ao criar conta", description: message });
                      })
                      .finally(() => setIsSubmitting(false));
                  }}
                >
                  {t("login.register")}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
