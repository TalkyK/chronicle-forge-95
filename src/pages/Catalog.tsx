import { BookOpen, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Catalog = () => {
  return (
    <div className="container max-w-5xl py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-foreground">Seu Grimório</h1>
        <Link to="/sheets/new">
          <Button variant="default" size="sm" className="gap-1.5 font-heading tracking-wide">
            <Plus className="w-4 h-4" /> Nova Ficha
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-xl text-foreground mb-2">Nenhuma ficha ainda</h2>
        <p className="text-muted-foreground font-body mb-6 max-w-sm">
          Seu grimório está vazio. Crie sua primeira ficha de personagem e comece sua coleção.
        </p>
        <Link to="/sheets/new">
          <Button variant="hero" className="gap-2">
            <Plus className="w-4 h-4" /> Criar Primeira Ficha
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Catalog;
