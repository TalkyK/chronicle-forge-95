import { Link, useLocation } from "react-router-dom";
import { BookOpen, Plus, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "@/i18n/locale";

const Header = () => {
  const location = useLocation();
  const { t } = useLocale();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
          <span className="font-display text-sm tracking-wider text-foreground">
            {t("header.brand")}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/catalog"
            className={`px-3 py-1.5 rounded-md text-sm font-heading tracking-wide transition-colors ${
              location.pathname === "/catalog"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t("nav.grimoires")}
          </Link>
          <Link
            to="/sheets/new"
            className="px-3 py-1.5 rounded-md text-sm font-heading tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("catalog.newSheet")}
          </Link>
          <button
            onClick={() => setIsDark(!isDark)}
            className="ml-2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={t("header.toggleTheme")}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
