import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import InteractiveCoin from "@/components/InteractiveCoin";
import { Sparkles, Scroll, Users } from "lucide-react";
import { useLocale } from "@/i18n/locale";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLocale();

  const handleSelect = (mode: "RPG" | "STORY") => {
    navigate(`/sheets/new?type=${mode}`);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-hero grain-overlay relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl text-primary-foreground leading-tight"
          >
            {t("index.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-primary-foreground/70 font-body text-lg sm:text-xl max-w-md"
          >
            {t("index.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <InteractiveCoin onSelect={handleSelect} />
          </motion.div>
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-2xl text-center text-foreground mb-12">
            {t("index.sectionTitle")}
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: t("index.features.modes.title"),
                desc: t("index.features.modes.desc"),
              },
              {
                icon: Scroll,
                title: t("index.features.flexible.title"),
                desc: t("index.features.flexible.desc"),
              },
              {
                icon: Users,
                title: t("index.features.catalog.title"),
                desc: t("index.features.catalog.desc"),
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-card border border-border"
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground font-body text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
