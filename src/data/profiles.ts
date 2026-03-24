import type { Locale } from "@/i18n/messages";
import { supabase } from "@/lib/supabaseClient";

export async function upsertMyProfileLocale(locale: Locale) {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      locale,
    },
    {
      onConflict: "id",
    }
  );

  if (error) throw error;
}

export async function fetchMyProfileLocale(): Promise<Locale | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("locale")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return null;

  const locale = profile?.locale;
  if (
    locale === "pt-BR" ||
    locale === "pt-PT" ||
    locale === "en" ||
    locale === "es" ||
    locale === "fr" ||
    locale === "de" ||
    locale === "ja" ||
    locale === "it"
  ) {
    return locale;
  }
  return null;
}
