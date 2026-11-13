"use client";

import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { ProjectCard } from "@/components/site/project-card";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

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
      <div className="flex flex-col gap-5 border-y border-line py-5 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter by category" className="-mx-1 flex flex-wrap gap-1">
          {categories.map((item) => {
            const active = item.name === category;
            return (
              <button
                key={item.name}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item.name)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm transition-colors duration-300",
                  active ? "text-background" : "text-ink-dim hover:text-ink",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="category-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative">
                  {item.name}
                  <sup className="ml-1 font-mono text-[0.625rem] opacity-70">{item.count}</sup>
                </span>
              </button>
            );
          })}
        </div>

        <label className="relative flex items-center md:w-72">
          <span className="sr-only">Search projects</span>
          <Search aria-hidden className="pointer-events-none absolute left-0 size-4 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or technology"
            className="h-10 w-full border-b border-line-strong bg-transparent pl-7 pr-8 text-sm text-ink placeholder:text-ink-faint focus:border-signal focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-0 flex size-8 items-center justify-center text-ink-faint hover:text-ink"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </label>
      </div>

      <p className="label mt-6" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? "project" : "projects"}
      </p>

      {results.length > 0 ? (
        <motion.ul layout className="mt-6 grid gap-5 md:grid-cols-2 md:gap-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((project, i) => (
              <motion.li
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <ProjectCard project={project} index={i} className="h-full" priority={i < 2} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong px-6 py-20 text-center">
          <p className="title">No projects match.</p>
          <p className="mt-3 text-ink-dim">Try a different category or search term.</p>
          <button
            type="button"
            className="btn btn-ghost mt-8"
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
