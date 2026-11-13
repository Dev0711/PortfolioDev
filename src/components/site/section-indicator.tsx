"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn, pad2 } from "@/lib/utils";

export type IndicatorSection = { id: string; label: string };

/**
 * Fixed side rail on the homepage showing which section is in view.
 * The list of sections comes from the server (it mirrors the order chosen in
 * the admin); an IntersectionObserver tracks the active one. Desktop only.
 */
export function SectionIndicator({ sections }: { sections: IndicatorSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav aria-label="Sections" className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <ul className="pointer-events-auto flex flex-col items-end gap-3">
        {sections.map((section, i) => {
          const current = section.id === active;
          return (
            <li key={section.id}>
              <a href={`#${section.id}`} aria-current={current ? "true" : undefined} className="group flex items-center gap-3 py-0.5">
                <span
                  className={cn(
                    "label transition-all duration-500",
                    current
                      ? "translate-x-0 !text-ink opacity-100"
                      : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                  )}
                >
                  {pad2(i + 1)} {section.label}
                </span>
                <span className="relative flex h-3 w-6 items-center justify-end">
                  <motion.span
                    className="block h-px bg-ink"
                    animate={{ width: current ? 24 : 10, opacity: current ? 1 : 0.35 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
