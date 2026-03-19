import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Dices, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewSheet = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") as "RPG" | "STORY" | null;

  if (!type) {
    return (
      <div className="container max-w-lg py-16 px-4 text-center">
        <h1 className="font-display text-2xl text-foreground mb-8">Escolha o tipo de ficha</h1>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="rpg" size="lg" onClick={() => navigate("/sheets/new?type=RPG")} className="gap-2">
            <Dices className="w-5 h-5" /> Ficha de RPG
          </Button>
          <Button variant="story" size="lg" onClick={() => navigate("/sheets/new?type=STORY")} className="gap-2">
            <Feather className="w-5 h-5" /> Ficha de Personagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-body mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="flex items-center gap-3 mb-8">
        {type === "RPG" ? (
          <div className="p-2 rounded-lg bg-primary/10"><Dices className="w-6 h-6 text-primary" /></div>
        ) : (
          <div className="p-2 rounded-lg bg-accent/10"><Feather className="w-6 h-6 text-accent" /></div>
        )}
        <h1 className="font-display text-2xl text-foreground">
          {type === "RPG" ? "Nova Ficha de RPG" : "Nova Ficha de Personagem"}
        </h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground font-body">
          O formulário de criação será implementado em breve. Conecte o backend para salvar fichas!
        </p>
      </div>
    </div>
  );
};

export default NewSheet;
