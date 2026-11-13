import type { Metadata } from "next";
import { ProjectForm } from "@/components/admin/project-form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("projects").select("category");
  const categories = [...new Set((data ?? []).map((row) => row.category as string).filter(Boolean))];

  return <ProjectForm project={null} categories={categories} />;
}
