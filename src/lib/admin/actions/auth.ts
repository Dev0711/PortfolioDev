"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { loginSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

/** Same message for every failure so the form does not reveal which accounts exist. */
const GENERIC = "Incorrect email or password, or this account is not authorised.";

export async function signIn(input: unknown): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured. Add the environment variables first (see README)." };
  }

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { ok: false, error: GENERIC };

  // A valid login is not enough: the user must be on the admins allow-list.
  const { data: admin } = await supabase.from("admins").select("role").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, error: GENERIC };
  }

  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
