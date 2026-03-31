import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { saveMySheet } from "@/data/sheets";
import { toast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import SheetSidebar from "@/components/SheetSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const RpgSheetStandalone = () => {
  const { loading } = useRequireAuth();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const callIframeFn = (fnName: "saveDraftNow" | "saveCharacterSlot" | "generatePDF") => {
    const win = iframeRef.current?.contentWindow as unknown as Record<string, unknown> | null;
    const fn = win?.[fnName];
    if (typeof fn === "function") (fn as () => void)();
  };

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as any;
      if (!data || typeof data !== "object") return;
      if (data.type !== "rpg-sheet:save") return;

      // Garantia extra: só aceita mensagens do iframe desta página
      if (iframeRef.current?.contentWindow && event.source !== iframeRef.current.contentWindow) {
        return;
      }

      try {
        const payload = data.payload ?? {};
        const title = String(payload?.name ?? "").trim() || "Sem título";
        const id = await saveMySheet({ id: savedId, type: "RPG", title, data: payload });
        setSavedId(id);

        toast({
          title: "Personagem salvo",
          description: "Sua ficha foi salva na biblioteca.",
        });

        iframeRef.current?.contentWindow?.postMessage(
          { type: "rpg-sheet:saved", ok: true, id },
          window.location.origin,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Não foi possível salvar agora.";
        toast({
          variant: "destructive",
          title: "Falha ao salvar",
          description: message,
        });
        iframeRef.current?.contentWindow?.postMessage(
          { type: "rpg-sheet:saved", ok: false, error: message },
          window.location.origin,
        );
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [savedId]);

  if (loading) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SheetSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="h-6" />
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-body transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 font-body"
                onClick={() => callIframeFn("saveDraftNow")}
              >
                <FileText className="w-3.5 h-3.5" />
                Rascunho
              </Button>
              <Button
                variant="rpg"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  callIframeFn("saveCharacterSlot");
                  callIframeFn("generatePDF");
                }}
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Personagem
              </Button>
            </div>
          </header>

          <main className="flex-1 min-h-0">
            <iframe
              id="rpg-sheet-iframe"
              ref={iframeRef}
              title="Ficha RPG"
              src="/rpg-sheet.html"
              className="w-full h-full border-0"
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RpgSheetStandalone;
