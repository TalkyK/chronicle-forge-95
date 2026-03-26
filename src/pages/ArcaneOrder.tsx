import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

const ArcaneOrder = () => {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background text-foreground px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Grimórios
        </Link>

        <section className="rounded-2xl border border-border bg-card/70 p-8 sm:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Em construção
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-foreground">Ordem Arcana</h1>
          <p className="mt-3 text-muted-foreground font-body max-w-2xl">
            Esta área foi reservada para futuras atualizações. Em breve você verá novidades da ordem,
            conteúdo especial e novos recursos.
          </p>
        </section>
      </div>
    </main>
  );
};

export default ArcaneOrder;
