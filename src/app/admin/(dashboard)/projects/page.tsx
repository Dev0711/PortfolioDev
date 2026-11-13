import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/admin/kit";
import { ProjectsTable } from "@/components/admin/projects-table";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("projects")
    .select("id, title, slug, category, status, featured, cover_url")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const projects = data ?? [];
  const newButton = (
    <Link href="/admin/projects/new" className={cn(buttonVariants())}>
      <Plus /> New project
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Projects"
        description="Drag to change the display order. Drafts are only visible here and in preview."
        actions={newButton}
      />
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          body="Create a case study, save it as a draft, preview it, and publish when it is ready."
          action={newButton}
        />
      ) : (
        <ProjectsTable projects={projects as React.ComponentProps<typeof ProjectsTable>["projects"]} />
      )}
    </>
  );
}
