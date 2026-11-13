import type { Metadata } from "next";
import { CredentialsManager } from "@/components/admin/credentials-manager";
import { requireAdmin } from "@/lib/auth";
import type { Certification, Education } from "@/lib/types";

export const metadata: Metadata = { title: "Credentials" };

export default async function CredentialsPage() {
  const { supabase } = await requireAdmin();
  const [education, certifications] = await Promise.all([
    supabase.from("education").select("*").order("sort_order"),
    supabase.from("certifications").select("*").order("sort_order"),
  ]);

  return (
    <CredentialsManager
      education={(education.data ?? []) as Education[]}
      certifications={(certifications.data ?? []) as Certification[]}
    />
  );
}
