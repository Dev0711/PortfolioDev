"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { NavItem } from "@/lib/types";
import { cn, isExternal } from "@/lib/utils";

export function Header({ name, title, nav }: { name: string; title: string; nav: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const links = nav.filter((item) => item.visible);

  // Close the mobile menu on Escape or a click outside it; links close it on click.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const external = (href: string) => (isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-[var(--header-bg)] backdrop-blur-md">
      <div ref={menuRef} className="relative mx-auto flex h-14 max-w-[85rem] items-center gap-2.5 px-3 sm:h-16 sm:px-7">
        <Link
          href="/"
          className="group mr-auto flex min-w-0 items-center gap-2.5 font-display text-[1.1rem] font-semibold uppercase tracking-[-0.02em] transition-colors hover:text-signal"
        >
          <span aria-hidden className="relative block size-[1.1rem] shrink-0 border-[3px] border-signal">
            <span className="absolute inset-[3px] bg-ink transition-colors group-hover:bg-signal" />
          </span>
          <span className="truncate">{name}</span>
          <span className="sr-only"> — {title}</span>
        </Link>

        <nav aria-label="Primary" className="mr-2 hidden items-center gap-6 md:flex">
          {links.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="inline-flex min-h-9 items-center font-mono text-[0.78rem] font-medium uppercase tracking-[0.08em] text-ink-dim transition-colors hover:text-signal aria-[current=page]:text-signal"
              {...external(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />

        <button
          type="button"
          className={cn("icon-btn md:hidden", open && "!border-signal !text-signal")}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
        </button>

        {open ? (
          <nav
            id="site-menu"
            aria-label="Mobile"
            className="panel absolute right-3 top-[calc(100%+1px)] z-50 flex max-h-[calc(100svh-5rem)] w-[min(21rem,calc(100vw-1.5rem))] flex-col overflow-y-auto px-4 py-2 md:hidden"
          >
            {[{ label: "Home", href: "/", visible: true }, ...links].map((item, i) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center justify-between px-2 py-2 font-mono text-[0.8rem] font-medium uppercase tracking-[0.12em] text-ink-dim transition-colors hover:bg-[var(--signal-tint)] hover:text-signal aria-[current=page]:text-signal",
                  i > 0 && "border-t border-line",
                )}
                onClick={() => setOpen(false)}
                {...external(item.href)}
              >
                {item.label}
                <span aria-hidden>→</span>
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}

/** Light / dark switch. The choice is stored and applied before paint by the site layout. */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.dataset.theme === "dark",
    () => false,
  );

  const toggle = () => {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("site-theme", next ? "dark" : "light");
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this page view.
    }
  };

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
    >
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
