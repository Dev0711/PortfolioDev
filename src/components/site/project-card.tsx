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
        "group rounded-2xl border border-line bg-surface/60 transition-colors duration-500 hover:border-line-strong",
        className,
      )}
    >
      <Link
        href={`/work/${project.slug}`}
        className="flex h-full flex-col rounded-2xl p-3 md:p-4"
        data-cursor="View"
        aria-label={`${project.title} — view case study`}
      >
        <div className={cn("relative overflow-hidden rounded-xl", wide ? "aspect-[16/9]" : "aspect-[4/3]")}>
          <div className="absolute inset-0 transition-transform duration-[1.2s] ease-out-expo group-hover:-translate-y-1 group-hover:scale-[1.06]">
            <ProjectCover project={project} priority={priority} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-base/70 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-40" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="chip !border-line-strong bg-base/60 backdrop-blur">{pad2(index + 1)}</span>
            {project.featured ? (
              <span className="chip !border-signal/40 bg-base/60 !text-signal backdrop-blur">Featured</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-2 pb-3 pt-6 md:px-3">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="label mb-3">
                {[project.category, project.timeframe].filter(Boolean).join(" · ") || "Project"}
              </p>
              <h3 className="title transition-transform duration-700 ease-out-expo group-hover:translate-x-1.5">
                {project.title}
              </h3>
            </div>
            <span className="relative mt-1 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong transition-colors duration-500 group-hover:border-signal group-hover:bg-signal group-hover:text-background">
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-6 group-hover:-translate-y-6"
              />
              <ArrowUpRight
                aria-hidden
                className="absolute size-4 -translate-x-6 translate-y-6 transition-transform duration-500 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0"
              />
            </span>
          </div>

          {project.summary ? (
            <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink-dim">{project.summary}</p>
          ) : null}

          {project.technologies.length > 0 ? (
            <ul className="mt-auto flex flex-wrap gap-2 pt-6" aria-label="Technologies">
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
