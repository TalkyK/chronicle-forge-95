import type { Locale } from "@/i18n/messages";
import { supabase } from "@/lib/supabaseClient";

export type MyProfile = {
  display_name: string | null;
  avatar_url: string | null;
  locale: string | null;
};

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

export async function fetchMyProfile(): Promise<MyProfile | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, locale")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return null;
  return {
    display_name: profile?.display_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
    locale: profile?.locale ?? null,
  };
}

export async function updateMyProfile(params: { display_name?: string | null; avatar_url?: string | null }) {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      ...(typeof params.display_name !== "undefined" ? { display_name: params.display_name } : {}),
      ...(typeof params.avatar_url !== "undefined" ? { avatar_url: params.avatar_url } : {}),
    },
    {
      onConflict: "id",
    }
  );

  if (error) throw error;
}

export async function uploadMyAvatar(file: File): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) throw new Error("Sem sessão");

  const fileExt = (file.name.split(".").pop() || "png").toLowerCase();
  const filePath = `${user.id}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
    upsert: true,
    contentType: file.type || undefined,
    cacheControl: "3600",
  });
  if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);
  const publicUrl = publicData.publicUrl;

  const versionedUrl = `${publicUrl}?v=${Date.now()}`;
  await updateMyProfile({ avatar_url: versionedUrl });
  return versionedUrl;
}
