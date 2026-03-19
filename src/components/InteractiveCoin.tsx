import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Dices, Feather } from "lucide-react";

interface InteractiveCoinProps {
  onSelect: (mode: "RPG" | "STORY") => void;
}

const InteractiveCoin = ({ onSelect }: InteractiveCoinProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped((prev) => !prev);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === "r") {
        setIsFlipped(false);
        onSelect("RPG");
      } else if (e.key.toLowerCase() === "p") {
        setIsFlipped(true);
        onSelect("STORY");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelect]);

  const currentMode = isFlipped ? "STORY" : "RPG";

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Coin */}
      <div
        className="relative cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
      >
        <motion.div
          className="relative w-48 h-48 sm:w-56 sm:h-56"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front - RPG */}
          <div
            className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-3 border-4 border-primary/40 shadow-2xl shadow-primary/30"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(135deg, hsl(264 33% 35%), hsl(272 40% 50%))",
            }}
          >
            <div className="absolute inset-2 rounded-full border border-primary-foreground/20" />
            <Dices className="w-12 h-12 text-primary-foreground drop-shadow-lg" />
            <span className="font-display text-lg text-primary-foreground tracking-wider">RPG</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-primary-foreground/10 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
          </div>

          {/* Back - Story */}
          <div
            className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-3 border-4 border-accent/40 shadow-2xl shadow-accent/30"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, hsl(37 72% 30%), hsl(37 72% 50%))",
            }}
          >
            <div className="absolute inset-2 rounded-full border border-accent-foreground/20" />
            <Feather className="w-12 h-12 text-accent-foreground drop-shadow-lg" />
            <span className="font-display text-lg text-accent-foreground tracking-wider">STORY</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-accent-foreground/10 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
          </div>
        </motion.div>
      </div>

      {/* Instruction */}
      <p className="text-muted-foreground text-sm font-body animate-fade-in">
        Clique na moeda para girar · <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted border border-border">R</kbd> RPG · <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted border border-border">P</kbd> Personagem
      </p>

      {/* CTA Button */}
      <motion.button
        key={currentMode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => onSelect(currentMode)}
        className={`font-heading tracking-wider text-lg px-8 py-3 rounded-lg shadow-xl transition-all duration-300 border ${
          currentMode === "RPG"
            ? "bg-primary text-primary-foreground border-primary/30 shadow-primary/30 hover:bg-primary/80"
            : "bg-accent text-accent-foreground border-accent/30 shadow-accent/30 hover:bg-accent/80"
        }`}
      >
        {currentMode === "RPG" ? "Forje seu personagem" : "Dê vida à sua história"}
      </motion.button>
    </div>
  );
};

export default InteractiveCoin;
