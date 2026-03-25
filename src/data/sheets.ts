import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/database.types";

export type SheetRow = Pick<
  Tables<"character_sheets">,
  "id" | "title" | "type" | "updated_at" | "created_at" | "data"
>;

export type SheetType = "RPG" | "STORY";

export async function listMySheets(): Promise<SheetRow[]> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return [];

  const { data: rows, error } = await supabase
    .from("character_sheets")
    .select("id,title,type,updated_at,created_at,data")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (rows ?? []) as SheetRow[];
}

export async function saveMySheet(params: {
  id?: string | null;
  type: SheetType;
  title: string;
  data: unknown;
}): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) throw new Error("Sem sessão");

  const title = params.title.trim() || "Sem título";

  if (params.id) {
    const { data: updated, error } = await supabase
      .from("character_sheets")
      .update({ title, data: params.data as any })
      .eq("id", params.id)
      .select("id")
      .single();

    if (error) throw error;
    return updated.id;
  }

  const { data: inserted, error } = await supabase
    .from("character_sheets")
    .insert({
      type: params.type,
      title,
      data: params.data as any,
      user_id: user.id,
    })
    .select("id")
    .single();

  if (error) throw error;
  return inserted.id;
}
