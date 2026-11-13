"use client";

import { Eye, Pencil, Star } from "lucide-react";
import Link from "next/link";
import { ConfirmDelete, StatusBadge, useAction, useSyncedState } from "@/components/admin/kit";
import { SortableList, SortableRow } from "@/components/admin/sortable";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteProject, reorder, setProjectFeatured, setProjectStatus } from "@/lib/admin/actions/content";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

type Row = Pick<Project, "id" | "title" | "slug" | "category" | "status" | "featured" | "cover_url">;

export function ProjectsTable({ projects }: { projects: Row[] }) {
  const [rows, setRows] = useSyncedState(projects);
  const { run, pending } = useAction();

  const patch = (id: string, changes: Partial<Row>) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...changes } : row)));

  return (
    <SortableList
      items={rows}
      className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface"
      onReorder={(next) => {
        setRows(next);
        run(() => reorder("projects", next.map((row) => row.id)));
      }}
    >
      {(project) => (
        <SortableRow key={project.id} id={project.id} className="flex items-center gap-3 bg-surface px-3 py-3">
          <span className="hidden h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface-2 sm:block">
            {project.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.cover_url} alt="" className="h-full w-full object-cover" />
            ) : null}
          </span>

          <div className="min-w-0 flex-1">
            <Link href={`/admin/projects/${project.id}`} className="block truncate font-medium hover:text-signal">
              {project.title}
            </Link>
            <p className="truncate font-mono text-[0.6875rem] text-ink-faint">
              /work/{project.slug}
              {project.category ? ` · ${project.category}` : ""}
            </p>
          </div>

          <StatusBadge status={project.status} />

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={project.featured}
            aria-label={project.featured ? "Remove from featured" : "Mark as featured"}
            title={project.featured ? "Featured" : "Not featured"}
            disabled={pending}
            onClick={() => {
              patch(project.id, { featured: !project.featured });
              run(() => setProjectFeatured(project.id, !project.featured));
            }}
          >
            <Star className={cn(project.featured ? "fill-signal text-signal" : "text-ink-faint")} />
          </Button>

          <label className="hidden items-center gap-2 text-xs text-ink-dim md:flex">
            <Switch
              checked={project.status === "published"}
              disabled={pending}
              aria-label={`Published: ${project.title}`}
              onCheckedChange={(checked) => {
                const status = checked ? "published" : "draft";
                patch(project.id, { status });
                run(() => setProjectStatus(project.id, status));
              }}
            />
            Live
          </label>

          <Link
            href={`/admin/projects/${project.id}/preview`}
            target="_blank"
            aria-label={`Preview ${project.title}`}
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-ink-dim")}
          >
            <Eye />
          </Link>
          <Link
            href={`/admin/projects/${project.id}`}
            aria-label={`Edit ${project.title}`}
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-ink-dim")}
          >
            <Pencil />
          </Link>
          <ConfirmDelete
            iconOnly
            label="Delete project"
            title={`Delete "${project.title}"?`}
            description="The case study and its content sections will be removed from the site."
            pending={pending}
            onConfirm={() => run(() => deleteProject(project.id))}
          />
        </SortableRow>
      )}
    </SortableList>
  );
}
