import { ArrowLeft, EyeOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ProjectDetail } from "@/components/site/project-detail";
import { MotionProvider } from "@/components/site/site-chrome";
import { requireAdmin } from "@/lib/auth";
import { normalizeProject, normalizeSettings } from "@/lib/content/normalize";

export const metadata: Metadata = { title: "Preview" };

/**
 * Draft preview. Rendered with the administrator's own session, so RLS allows
 * reading unpublished rows; anonymous visitors can never reach this route or
 * the data behind it. Uses the same component as the public case study.
 */
export default async function PreviewProjectPage({ params }: PageProps<"/admin/projects/[id]/preview">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: row }, { data: settingsRow }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (!row) notFound();

  const project = normalizeProject(row);
  const settings = normalizeSettings(settingsRow ?? {});
  const theme = { "--signal": settings.accent, "--signal-alt": settings.accent_alt } as CSSProperties;

  return (
    // Full-bleed: break out of the admin content column and cover the sidebar.
    <div style={theme} className="fixed inset-0 z-[60] overflow-y-auto bg-base text-[1rem] text-ink">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-xs text-amber-200 backdrop-blur">
        <p className="flex items-center gap-2">
          <EyeOff className="size-3.5" aria-hidden />
          Preview · {project.status === "published" ? "this project is live" : "draft, not visible to the public"}
        </p>
        <Link href={`/admin/projects/${project.id}`} className="flex items-center gap-1.5 hover:text-white">
          <ArrowLeft className="size-3.5" aria-hidden /> Back to editor
        </Link>
      </div>
      <div>
        <MotionProvider>
          <ProjectDetail project={project} />
        </MotionProvider>
      </div>
    </div>
  );
}
