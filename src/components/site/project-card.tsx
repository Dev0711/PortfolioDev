import Link from "next/link";
import { ProjectCover } from "@/components/site/project-cover";
import type { Project } from "@/lib/types";
import { cn, pad2 } from "@/lib/utils";

/** Project card in the reference "machine" style: figure on top, mono tag, pixel title, serif summary, accent CTA. */
export function ProjectCard({
  project,
  index,
  className,
  priority = false,
}: {
  project: Project;
  index: number;
  className?: string;
  priority?: boolean;
  /** Kept for call-site compatibility. */
  wide?: boolean;
}) {
  const tag = [`FIG_${pad2(index + 1)}`, project.category, project.timeframe].filter(Boolean).join(" · ");
  return (
    <Link href={`/work/${project.slug}`} className={cn("machine h-full", className)} aria-label={`${project.title} — read the case study`}>
      <div className="machine-figure relative aspect-[16/10] overflow-hidden">
        <ProjectCover project={project} priority={priority} />
        {project.featured ? (
          <span className="absolute left-2.5 top-2.5 bg-signal px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-background">
            Featured
          </span>
        ) : null}
      </div>
      <div className="machine-copy">
        <span className="eyebrow !text-[0.68rem]">{tag}</span>
        <h3>{project.title}</h3>
        {project.summary ? <p>{project.summary}</p> : <p />}
        {project.technologies.length > 0 ? (
          <p className="!mb-3 !flex-none font-mono !text-[0.72rem] uppercase tracking-[0.06em] !text-ink-faint">
            {project.technologies.slice(0, 5).join(" · ")}
          </p>
        ) : null}
        <span className="machine-cta">Read the case study →</span>
      </div>
    </Link>
  );
}
