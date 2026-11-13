import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "editor";

/**
 * Resolves the current administrator, or null.
 *
 * Two independent checks, both on the server:
 *   1. `auth.getUser()`: the session token is verified by Supabase Auth.
 *   2. a row in `public.admins`: being signed in is not enough.
 *
 * Deduplicated per request with React `cache`.
 */
export const getAdmin = cache(async () => {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase.from("admins").select("role").eq("user_id", user.id).maybeSingle();
  if (!admin) return null;

  return { supabase, user, role: admin.role as AdminRole };
});

/** Use in every admin layout, page and server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
