import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId: number | undefined;

    const normalizeUsername = (raw: string) => {
      const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
      return cleaned.length >= 3 ? cleaned : "";
    };

    const ensureProfile = async (session: { user: { id: string; email?: string | null; user_metadata?: any } }) => {
      const user = session.user;
      const email = (user.email || "").toLowerCase();
      const metaUsername = user.user_metadata?.username ? String(user.user_metadata.username) : "";
      const baseRaw = metaUsername || email.split("@")[0] || "user";
      const base = normalizeUsername(baseRaw) || `user${user.id.slice(0, 6)}`;
      let candidate = base;

      for (let i = 0; i < 3; i += 1) {
        const { data: existing, error } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("username", candidate)
          .maybeSingle();

        if (error) {
          console.error("Profile username check error:", error);
          break;
        }

        if (!existing || existing.id === user.id) break;
        candidate = `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
      }

      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username: candidate,
          email: email || null,
        },
        { onConflict: "id" }
      );

      if (upsertError) {
        console.error("Profile upsert error:", upsertError);
      }
    };

    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Callback session error:", error);
        navigate("/login?error=confirmation_failed", { replace: true });
        return;
      }

      if (data.session) {
        console.log("OAuth session established:", data.session);
        await ensureProfile(data.session);
        navigate("/catalog", { replace: true });
        return;
      }

      const { data: listenerData } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
          listenerData.subscription.unsubscribe();
          console.log("OAuth session established (listener):", session);
          ensureProfile(session).finally(() => {
            navigate("/catalog", { replace: true });
          });
        }
      });

      timeoutId = window.setTimeout(() => {
        listenerData.subscription.unsubscribe();
        navigate("/login?error=session_timeout", { replace: true });
      }, 5000);
    };

    handleCallback();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground font-body">Confirmando sua conta, aguarde...</p>
    </main>
  );
};

export default AuthCallback;
