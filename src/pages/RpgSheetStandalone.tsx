import { useEffect, useRef, useState } from "react";
import { saveMySheet } from "@/data/sheets";
import { toast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const RpgSheetStandalone = () => {
  const { loading } = useRequireAuth();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

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
    <div className="min-h-screen w-full bg-background">
      <iframe
        id="rpg-sheet-iframe"
        ref={iframeRef}
        title="Ficha RPG"
        src="/rpg-sheet.html"
        className="w-full h-screen border-0"
      />
    </div>
  );
};

export default RpgSheetStandalone;
