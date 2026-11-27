"use client";

import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { ProjectCard } from "@/components/site/project-card";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Filterable, searchable project grid for /work. */
export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects) {
      if (project.category) counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    }
    return [{ name: "All", count: projects.length }, ...[...counts].map(([name, count]) => ({ name, count }))];
  }, [projects]);

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return projects.filter((project) => {
      if (category !== "All" && project.category !== category) return false;
      if (!q) return true;
      return [project.title, project.summary, project.category, project.role, ...project.technologies]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [projects, category, deferredQuery]);

  return (
    <div>
      <div className="iv-controls">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5">
          {categories.map((item) => {
            const active = item.name === category;
            return (
              <button
                key={item.name}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item.name)}
                className={cn(
                  "min-h-9 border px-3 py-1.5 font-mono text-[0.74rem] uppercase tracking-[0.06em] transition-colors",
                  active
                    ? "border-signal bg-signal text-background"
                    : "border-line bg-surface text-ink-dim hover:border-signal hover:text-signal",
                )}
              >
                {item.name} <span className="opacity-70">{item.count}</span>
              </button>
            );
          })}
        </div>
        <label className="iv-search relative flex items-center">
          <span className="sr-only">Search projects</span>
          <Search aria-hidden className="pointer-events-none absolute left-2.5 size-3.5 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or technology"
            className="!pl-8 !pr-8 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-1 flex size-8 items-center justify-center text-ink-faint hover:text-signal"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </label>
      </div>

      <p className="iv-count" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? "project" : "projects"}
        {category !== "All" ? ` · ${category}` : ""}
      </p>

      {results.length > 0 ? (
        <ul className="machine-grid !mt-4">
          {results.map((project, i) => (
            <li key={project.id}>
              <ProjectCard project={project} index={i} priority={i < 2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="iv-empty !p-0">No projects match.</p>
          <button
            type="button"
            className="btn mt-5"
            onClick={() => {
              setCategory("All");
              setQuery("");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
