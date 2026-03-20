import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Dices,
  Feather,
  GripVertical,
  Plus,
  Trash2,
  Wand2,
  Backpack,
  ImagePlus,
  X,
  Save,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SheetSidebar from "@/components/SheetSidebar";

/* ─── Types ─── */
interface Attribute {
  id: string;
  label: string;
  value: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: string;
  notes: string;
  equipped: boolean;
}

const TEMPLATES: Record<string, { label: string; value: string }[]> = {
  "D&D 5e": [
    { label: "FOR", value: "+0" },
    { label: "DES", value: "+2" },
    { label: "CON", value: "+1" },
    { label: "INT", value: "+4" },
    { label: "SAB", value: "+2" },
    { label: "CAR", value: "+0" },
  ],
  Tormenta20: [
    { label: "FOR", value: "+0" },
    { label: "DES", value: "+0" },
    { label: "CON", value: "+0" },
    { label: "INT", value: "+0" },
    { label: "SAB", value: "+0" },
    { label: "CAR", value: "+0" },
    { label: "PV", value: "0" },
    { label: "PM", value: "0" },
  ],
  "Call of Cthulhu": [
    { label: "FOR", value: "0" },
    { label: "CON", value: "0" },
    { label: "TAM", value: "0" },
    { label: "DES", value: "0" },
    { label: "APA", value: "0" },
    { label: "INT", value: "0" },
    { label: "POD", value: "0" },
    { label: "EDU", value: "0" },
    { label: "SAN", value: "0" },
  ],
};

let nextId = 1;
const uid = () => String(nextId++);

/* ─── Component ─── */
const NewSheet = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") as "RPG" | "STORY" | null;

  /* Choice screen */
  if (!type) {
    return (
      <div className="container max-w-lg py-16 px-4 text-center">
        <h1 className="font-display text-2xl text-foreground mb-8">
          Escolha o tipo de ficha
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="rpg"
            size="lg"
            onClick={() => navigate("/sheets/new?type=RPG")}
            className="gap-2"
          >
            <Dices className="w-5 h-5" /> Ficha de RPG
          </Button>
          <Button
            variant="story"
            size="lg"
            onClick={() => navigate("/sheets/new?type=STORY")}
            className="gap-2"
          >
            <Feather className="w-5 h-5" /> Ficha de Personagem
          </Button>
        </div>
      </div>
    );
  }

  /* RPG dashboard */
  if (type === "RPG") return <RpgSheetDashboard />;

  /* STORY dashboard */
  return <StorySheetDashboard />;
};

/* ─── Archetype data ─── */
const ARCHETYPES = [
  { id: "HERO", label: "Herói", icon: "shield" as const },
  { id: "VILLAIN", label: "Vilão", icon: "skull" as const },
  { id: "MENTOR", label: "Mentor", icon: "graduation-cap" as const },
  { id: "ALLY", label: "Sábio", icon: "brain" as const },
  { id: "NEUTRAL", label: "Trickster", icon: "drama" as const },
  { id: "ANTAGONIST", label: "Sombra", icon: "eye-off" as const },
] as const;

const AGE_RANGES = ["Jovem", "Adulto", "Ancião", "Imortal"] as const;

/* ─── Story Dashboard ─── */
const StorySheetDashboard = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [codename, setCodename] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [personalityInput, setPersonalityInput] = useState("");
  const [personalities, setPersonalities] = useState<string[]>(["Melancólico", "Estrategista"]);
  const [ability, setAbility] = useState("");
  const [storyRole, setStoryRole] = useState("");
  const [archetype, setArchetype] = useState("HERO");
  const [motivation, setMotivation] = useState("");
  const [relations, setRelations] = useState("");

  const addPersonality = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed || personalities.length >= 3 || personalities.includes(trimmed)) return;
    setPersonalities([...personalities, trimmed]);
    setPersonalityInput("");
  };

  const removePersonality = (tag: string) =>
    setPersonalities(personalities.filter((p) => p !== tag));

  const handlePersonalityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && personalityInput.trim()) {
      e.preventDefault();
      addPersonality(personalityInput);
    }
    if (e.key === "Backspace" && !personalityInput && personalities.length > 0) {
      setPersonalities(personalities.slice(0, -1));
    }
  };

  const archetypeIcon = (iconName: string) => {
    switch (iconName) {
      case "shield": return <Shield className="w-6 h-6" />;
      case "skull": return <Skull className="w-6 h-6" />;
      case "graduation-cap": return <GraduationCap className="w-6 h-6" />;
      case "brain": return <Brain className="w-6 h-6" />;
      case "drama": return <Drama className="w-6 h-6" />;
      case "eye-off": return <EyeOff className="w-6 h-6" />;
      default: return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SheetSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="h-6" />
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-body transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 font-body">
                <FileText className="w-3.5 h-3.5" />
                Rascunho
              </Button>
              <Button variant="story" size="sm" className="gap-1.5">
                <Save className="w-3.5 h-3.5" />
                Salvar Personagem
              </Button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Feather className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h1 className="font-display text-xl sm:text-2xl text-foreground">
                    Dê vida à sua História
                  </h1>
                  <p className="text-muted-foreground font-body text-sm">
                    Construa um personagem narrativo com profundidade
                  </p>
                </div>
              </div>

              {/* ── Avatar + Identity ── */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar 3:4 */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-36 h-48 rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 transition-colors group">
                        <ImagePlus className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
                        <span className="text-xs text-muted-foreground font-body mt-1">
                          Enviar Avatar
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-body">
                        Dimensão recomendada: 3:4
                      </span>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label className="font-heading text-sm">Nome Completo</Label>
                        <Input
                          placeholder="Ex: Seraphine Voss"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="font-body"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-heading text-sm">Codinome / Alcunha</Label>
                        <Input
                          placeholder="Ex: A Sombra"
                          value={codename}
                          onChange={(e) => setCodename(e.target.value)}
                          className="font-body"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-heading text-sm">Faixa Etária / Idade Aparente</Label>
                        <div className="flex flex-wrap gap-2">
                          {AGE_RANGES.map((age) => (
                            <button
                              key={age}
                              onClick={() => setAgeRange(age)}
                              className={`px-4 py-1.5 rounded-full text-sm font-body border transition-colors ${
                                ageRange === age
                                  ? "bg-accent text-accent-foreground border-accent"
                                  : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                              }`}
                            >
                              {age}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Personality Tags ── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Personalidade (Tags)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-input min-h-[44px]">
                    {personalities.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/15 text-accent text-sm font-body border border-accent/20"
                      >
                        {tag}
                        <button
                          onClick={() => removePersonality(tag)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {personalities.length < 3 && (
                      <input
                        value={personalityInput}
                        onChange={(e) => setPersonalityInput(e.target.value)}
                        onKeyDown={handlePersonalityKeyDown}
                        placeholder={personalities.length === 0 ? "Adicione até 3 traços..." : ""}
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-body text-foreground placeholder:text-muted-foreground"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-body mt-2">
                    Máximo 3 essências — pressione Enter ou vírgula para adicionar
                  </p>
                </CardContent>
              </Card>

              {/* ── Ability + Story Role ── */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="font-heading text-sm">Habilidade / Diferencial</Label>
                    <Input
                      placeholder="Ex: Manipulação de memórias"
                      value={ability}
                      onChange={(e) => setAbility(e.target.value)}
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-heading text-sm">Papel na Trama</Label>
                    <Input
                      placeholder="Ex: Protagonista da segunda fase"
                      value={storyRole}
                      onChange={(e) => setStoryRole(e.target.value)}
                      className="font-body"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ── Archetype Selector ── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <BookOpenCheck className="w-5 h-5 text-accent" />
                    Arquétipo Literário
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {ARCHETYPES.map((arc) => (
                      <button
                        key={arc.id}
                        onClick={() => setArchetype(arc.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          archetype === arc.id
                            ? "border-accent bg-accent/10 text-accent shadow-md shadow-accent/10"
                            : "border-border text-muted-foreground hover:border-accent/30 hover:text-foreground"
                        }`}
                      >
                        {archetypeIcon(arc.icon)}
                        <span className="text-xs font-heading">{arc.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ── Motivation ── */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="font-heading text-sm">Objetivo do Personagem (Motivação)</Label>
                    <Textarea
                      placeholder="O que move este personagem? Qual é seu objetivo principal?"
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      className="font-body min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-heading text-sm">Relações com Terceiros</Label>
                    <Textarea
                      placeholder="Ex: Rival de Aldric; filha adotiva de Mira..."
                      value={relations}
                      onChange={(e) => setRelations(e.target.value)}
                      className="font-body min-h-[80px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Auto-save indicator + Bottom actions */}
              <div className="flex items-center justify-between pb-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <History className="w-4 h-4" />
                  <span className="text-xs font-body">Alterações salvas automaticamente no rascunho</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 font-body"
                  >
                    <Trash2 className="w-4 h-4" />
                    Descartar
                  </Button>
                  <Button variant="story" className="gap-1.5">
                    <Save className="w-4 h-4" />
                    Salvar Personagem
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

/* ─── RPG Dashboard ─── */
const RpgSheetDashboard = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [system, setSystem] = useState("D&D 5e");
  const [notes, setNotes] = useState("");

  const [attributes, setAttributes] = useState<Attribute[]>(
    TEMPLATES["D&D 5e"].map((a) => ({ id: uid(), ...a }))
  );

  const [skills, setSkills] = useState<Skill[]>([
    { id: uid(), name: "Arcana", description: "Conhecimento arcano e mágico" },
    { id: uid(), name: "Furtividade", description: "Mover-se sem ser detectado" },
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: uid(), name: "Cajado de Ébano", quantity: 1, weight: "2kg", notes: "+1 em rolagens de dano mágico", equipped: true },
    { id: uid(), name: "Poção de Cura", quantity: 3, weight: "0.5kg", notes: "Recupera 2d4+2 HP", equipped: false },
  ]);

  /* Handlers */
  const handleSystemChange = (val: string) => {
    setSystem(val);
    if (TEMPLATES[val]) {
      setAttributes(TEMPLATES[val].map((a) => ({ id: uid(), ...a })));
    }
  };

  const addAttribute = () =>
    setAttributes([...attributes, { id: uid(), label: "", value: "+0" }]);
  const removeAttribute = (id: string) =>
    setAttributes(attributes.filter((a) => a.id !== id));
  const updateAttribute = (id: string, field: keyof Attribute, val: string) =>
    setAttributes(attributes.map((a) => (a.id === id ? { ...a, [field]: val } : a)));

  const addSkill = () =>
    setSkills([...skills, { id: uid(), name: "", description: "" }]);
  const removeSkill = (id: string) =>
    setSkills(skills.filter((s) => s.id !== id));
  const updateSkill = (id: string, field: keyof Skill, val: string) =>
    setSkills(skills.map((s) => (s.id === id ? { ...s, [field]: val } : s)));

  const addInventoryItem = () =>
    setInventory([...inventory, { id: uid(), name: "", quantity: 1, weight: "", notes: "", equipped: false }]);
  const removeInventoryItem = (id: string) =>
    setInventory(inventory.filter((i) => i.id !== id));
  const updateInventoryItem = (id: string, field: keyof InventoryItem, val: string | number | boolean) =>
    setInventory(inventory.map((i) => (i.id === id ? { ...i, [field]: val } : i)));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SheetSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="h-6" />
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-body transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 font-body">
                <FileText className="w-3.5 h-3.5" />
                Save Draft
              </Button>
              <Button variant="rpg" size="sm" className="gap-1.5">
                <Save className="w-3.5 h-3.5" />
                Save Sheet
              </Button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Dices className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-xl sm:text-2xl text-foreground">
                    Forje seu Personagem
                  </h1>
                  <p className="text-muted-foreground font-body text-sm">
                    Preencha os campos abaixo para criar sua ficha de RPG
                  </p>
                </div>
              </div>

              {/* ── Basic Info ── */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group">
                        <ImagePlus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs text-muted-foreground font-body mt-1">
                          Upload Avatar
                        </span>
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="charName" className="font-heading text-sm">
                          Nome do Personagem
                        </Label>
                        <Input
                          id="charName"
                          placeholder="Ex: Aldric, o Cinzento"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="font-body"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rpgSystem" className="font-heading text-sm">
                          Sistema de RPG
                        </Label>
                        <Select value={system} onValueChange={handleSystemChange}>
                          <SelectTrigger className="font-body">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="D&D 5e">D&D 5e</SelectItem>
                            <SelectItem value="Tormenta20">Tormenta20</SelectItem>
                            <SelectItem value="Pathfinder 2e">Pathfinder 2e</SelectItem>
                            <SelectItem value="Call of Cthulhu">Call of Cthulhu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="campaignNotes" className="font-heading text-sm">
                          Notas da Campanha
                        </Label>
                        <Textarea
                          id="campaignNotes"
                          placeholder="Detalhes sobre a campanha, background do personagem..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="font-body min-h-[80px] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Attributes ── */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Dices className="w-5 h-5 text-primary" />
                    Atributos Básicos
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAttribute}
                    className="gap-1.5 font-body text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Attribute
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {attributes.map((attr) => (
                      <div
                        key={attr.id}
                        className="group relative flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-muted/30 hover:border-primary/30 transition-colors"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 absolute top-1 left-1 cursor-grab" />
                        <button
                          onClick={() => removeAttribute(attr.id)}
                          className="absolute top-1 right-1 text-muted-foreground/0 group-hover:text-destructive/70 hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <Input
                          value={attr.label}
                          onChange={(e) => updateAttribute(attr.id, "label", e.target.value)}
                          className="text-center font-mono text-xs h-7 px-1 bg-transparent border-none focus-visible:ring-0 font-bold uppercase tracking-wider"
                          placeholder="LBL"
                        />
                        <Input
                          value={attr.value}
                          onChange={(e) => updateAttribute(attr.id, "value", e.target.value)}
                          className="text-center font-mono text-lg h-9 px-1 w-16 bg-input rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ── Skills ── */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    Perícias & Habilidades
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSkill}
                    className="gap-1.5 font-body text-xs"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Add Skill
                  </Button>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex-1 space-y-2">
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                          placeholder="Nome da habilidade"
                          className="font-heading text-sm h-8"
                        />
                        <Input
                          value={skill.description}
                          onChange={(e) => updateSkill(skill.id, "description", e.target.value)}
                          placeholder="Descrição..."
                          className="font-body text-sm h-8 text-muted-foreground"
                        />
                      </div>
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="mt-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-center text-muted-foreground font-body text-sm py-4">
                      Nenhuma habilidade adicionada
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* ── Inventory ── */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Backpack className="w-5 h-5 text-primary" />
                    Inventário
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addInventoryItem}
                    className="gap-1.5 font-body text-xs"
                  >
                    <Backpack className="w-3.5 h-3.5" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-body">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 font-heading text-xs text-muted-foreground uppercase tracking-wider w-12">
                            Equip.
                          </th>
                          <th className="text-left py-2 px-2 font-heading text-xs text-muted-foreground uppercase tracking-wider">
                            Item
                          </th>
                          <th className="text-left py-2 px-2 font-heading text-xs text-muted-foreground uppercase tracking-wider w-16">
                            Qtde
                          </th>
                          <th className="text-left py-2 px-2 font-heading text-xs text-muted-foreground uppercase tracking-wider w-20">
                            Peso
                          </th>
                          <th className="text-left py-2 px-2 font-heading text-xs text-muted-foreground uppercase tracking-wider">
                            Notas
                          </th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-2 px-2">
                              <Switch
                                checked={item.equipped}
                                onCheckedChange={(checked) =>
                                  updateInventoryItem(item.id, "equipped", checked)
                                }
                                className="scale-75"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                value={item.name}
                                onChange={(e) => updateInventoryItem(item.id, "name", e.target.value)}
                                className="h-8 text-sm font-body border-none bg-transparent px-0 focus-visible:ring-0"
                                placeholder="Nome do item"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateInventoryItem(item.id, "quantity", Number(e.target.value))}
                                className="h-8 text-sm font-mono border-none bg-transparent px-0 focus-visible:ring-0 w-12"
                                min={0}
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                value={item.weight}
                                onChange={(e) => updateInventoryItem(item.id, "weight", e.target.value)}
                                className="h-8 text-sm font-mono border-none bg-transparent px-0 focus-visible:ring-0 w-16"
                                placeholder="0kg"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                value={item.notes}
                                onChange={(e) => updateInventoryItem(item.id, "notes", e.target.value)}
                                className="h-8 text-sm font-body border-none bg-transparent px-0 focus-visible:ring-0 text-muted-foreground"
                                placeholder="Notas..."
                              />
                            </td>
                            <td className="py-2 px-2">
                              <button
                                onClick={() => removeInventoryItem(item.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {inventory.length === 0 && (
                      <p className="text-center text-muted-foreground font-body text-sm py-6">
                        Inventário vazio
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bottom actions */}
              <div className="flex items-center justify-between pb-8">
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 font-body"
                >
                  <Trash2 className="w-4 h-4" />
                  Discard
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-1.5 font-body">
                    <FileText className="w-4 h-4" />
                    Save Draft
                  </Button>
                  <Button variant="rpg" className="gap-1.5">
                    <Save className="w-4 h-4" />
                    Save Sheet
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default NewSheet;
