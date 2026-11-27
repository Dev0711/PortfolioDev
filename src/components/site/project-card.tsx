import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Spotlight } from "@/components/motion/spotlight";
import { ProjectCover } from "@/components/site/project-cover";
import type { Project } from "@/lib/types";
import { cn, pad2 } from "@/lib/utils";

/**
 * Project card. Hover choreography is pure CSS: the visual scales and drifts,
 * the border and background light up under the pointer, the title shifts and
 * the arrow travels diagonally.
 */
export function ProjectCard({
  project,
  index,
  className,
  priority = false,
  wide = false,
}: {
  project: Project;
  index: number;
  className?: string;
  priority?: boolean;
  wide?: boolean;
}) {
  return (
    <Spotlight
      as="article"
      className={cn(
        "group border border-line bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-ink hover:shadow-[var(--shadow-hard)]",
        className,
      )}
    >
      <Link
        href={`/work/${project.slug}`}
        className="flex h-full flex-col"
        data-cursor="View"
        aria-label={`${project.title} — view case study`}
      >
        <div className={cn("relative overflow-hidden border-b border-line bg-base", wide ? "aspect-[16/9]" : "aspect-[16/10]")}>
          <div className="absolute inset-0 transition-transform duration-300 ease-out-expo group-hover:scale-[1.02]">
            <ProjectCover project={project} priority={priority} />
          </div>
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="chip !bg-base">{pad2(index + 1)}</span>
            {project.featured ? (
              <span className="chip !border-signal !bg-signal !text-background">Featured</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="label mb-2.5 !text-signal">
                {[project.category, project.timeframe].filter(Boolean).join(" · ") || "Project"}
              </p>
              <h3 className="title !text-[1.25rem] transition-colors group-hover:text-signal">
                {project.title}
              </h3>
            </div>
            <span className="icon-btn relative mt-0.5 overflow-hidden group-hover:border-signal group-hover:bg-signal group-hover:text-background">
              <ArrowUpRight aria-hidden className="size-4" />
            </span>
          </div>

          {project.summary ? (
            <p className="mt-3 max-w-xl text-[1rem] leading-[1.5] text-ink-dim">{project.summary}</p>
          ) : null}

          {project.technologies.length > 0 ? (
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-5" aria-label="Technologies">
              {project.technologies.slice(0, 5).map((tech) => (
                <li key={tech} className="chip">
                  {tech}
                </li>
              ))}
              {project.technologies.length > 5 ? (
                <li className="chip">+{project.technologies.length - 5}</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </Link>
    </Spotlight>
  );
}
