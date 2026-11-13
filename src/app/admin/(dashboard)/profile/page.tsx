import type { Metadata } from "next";
import { ProfileForm } from "@/components/admin/profile-form";
import { requireAdmin } from "@/lib/auth";
import { emptyProfile, normalizeProfile } from "@/lib/content/normalize";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("profile").select("*").eq("id", 1).maybeSingle();

  return <ProfileForm profile={data ? normalizeProfile(data) : emptyProfile} />;
}
