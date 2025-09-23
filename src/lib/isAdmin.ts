// lib/isAdmin.ts

import { supabaseServer } from "./supabaseServer";

export async function isAdmin() {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  return profile?.is_admin ?? false;
}
