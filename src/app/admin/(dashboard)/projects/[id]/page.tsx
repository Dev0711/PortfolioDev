import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { requireAdmin } from "@/lib/auth";
import { normalizeProject } from "@/lib/content/normalize";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: row }, { data: all }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("projects").select("category"),
  ]);
  if (!row) notFound();

  const categories = [...new Set((all ?? []).map((item) => item.category as string).filter(Boolean))];

  // `key` resets the form state when navigating between projects.
  return <ProjectForm key={row.id} project={normalizeProject(row)} categories={categories} />;
}
