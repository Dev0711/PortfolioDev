import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { emptySettings, normalizeSettings } from "@/lib/content/normalize";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  return <SettingsForm settings={data ? normalizeSettings(data) : emptySettings} />;
}
