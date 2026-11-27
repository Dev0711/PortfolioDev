"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type PaletteItem = {
  label: string;
  href: string;
  group: string;
  meta?: string;
};

/** Reference command palette: ⌘K / Ctrl+K or the header button, arrow keys to move, Enter to open. */
export function SearchPalette({ items }: { items: PaletteItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.label, item.group, item.meta].join(" ").toLowerCase().includes(q),
    );
  }, [items, query]);

  const show = (value: boolean) => {
    setOpen(value);
    setQuery("");
    setActive(0);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        show(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (item: PaletteItem | undefined) => {
    if (!item) return;
    show(false);
    router.push(item.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") show(false);
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    }
  };

  return (
    <>
      <button
        type="button"
        className="icon-btn"
        aria-label="Search (⌘K)"
        title="Search (⌘K)"
        onClick={() => show(true)}
      >
        <Search className="size-4" aria-hidden />
      </button>

      {open
        ? createPortal(
            <div
              className={cn("overlay palette-overlay", open && "open")}
              aria-hidden={!open}
              onMouseDown={(event) =>
                event.target === event.currentTarget && show(false)
              }
            >
              {open ? (
                <div
                  className="palette"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Search"
                  onKeyDown={onKeyDown}
                >
                  <input
                    ref={inputRef}
                    className="palette-input"
                    placeholder="Search projects and pages…"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActive(0);
                    }}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls="palette-list"
                    aria-activedescendant={
                      results[active] ? `palette-${active}` : undefined
                    }
                  />
                  {results.length > 0 ? (
                    <ul
                      className="palette-list"
                      id="palette-list"
                      role="listbox"
                    >
                      {results.map((item, i) => (
                        <li
                          key={item.href}
                          id={`palette-${i}`}
                          role="option"
                          aria-selected={i === active}
                          className="palette-item"
                          onMouseEnter={() => setActive(i)}
                          onClick={() => go(item)}
                        >
                          <span className="pi-phase">{item.group}</span>
                          <span className="pi-name">{item.label}</span>
                          <span className="pi-time">{item.meta}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="palette-empty">Nothing matches “{query}”.</p>
                  )}
                  <div className="palette-foot">
                    <span>
                      <kbd>↑</kbd> <kbd>↓</kbd> move
                    </span>
                    <span>
                      <kbd>↵</kbd> open
                    </span>
                    <span>
                      <kbd>esc</kbd> close
                    </span>
                  </div>
                </div>
              ) : null}
            </div>,
            document.querySelector(".site") ?? document.body,
          )
        : null}
    </>
  );
}
