"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/lib/types";
import { cn, isExternal, pad2 } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header({ name, title, nav }: { name: string; title: string; nav: NavItem[] }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const links = nav.filter((item) => item.visible);

  // Hide on scroll down, reveal on scroll up.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 160);
    setScrolled(latest > 24);
  });

  // Lock scroll while the mobile menu is open; close with Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled && !open ? "border-b border-line bg-base/70 backdrop-blur-xl" : "border-b border-transparent",
        )}
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="shell flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="group flex items-baseline gap-3" onClick={() => setOpen(false)}>
            <span className="relative flex h-2 w-2 self-center">
              <span className="absolute inset-0 rounded-full bg-signal [animation:pulse-dot_2.4s_ease-in-out_infinite]" />
            </span>
            <span className="text-[0.9375rem] font-medium tracking-tight">{name}</span>
            <span className="label hidden lg:inline">{title}</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
            {links.map((item, i) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="link-line text-sm text-ink-dim transition-colors hover:text-ink aria-[current=page]:text-ink"
                {...(isExternal(item.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span className="label mr-2 !text-[0.625rem]">{pad2(i + 1)}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="relative -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span
              className={cn(
                "absolute h-px w-6 bg-ink transition-transform duration-500 ease-out-expo",
                open ? "rotate-45" : "-translate-y-1",
              )}
            />
            <span
              className={cn(
                "absolute h-px w-6 bg-ink transition-transform duration-500 ease-out-expo",
                open ? "-rotate-45" : "translate-y-1",
              )}
            />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col bg-base px-5 pb-10 pt-28 md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {[{ label: "Home", href: "/", visible: true }, ...links].map((item, i) => (
                <motion.div
                  key={item.href + item.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}
                  className="border-b border-line"
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="flex items-baseline justify-between py-5 text-4xl font-medium tracking-tight aria-[current=page]:text-signal"
                  >
                    {item.label}
                    <span className="label">{pad2(i)}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <p className="label mt-auto">{title}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
