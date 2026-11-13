"use client";

import {
  Award,
  Briefcase,
  ExternalLink,
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/admin/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    group: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/experience", label: "Experience", icon: Briefcase },
      { href: "/admin/skills", label: "Skills", icon: Wrench },
      { href: "/admin/credentials", label: "Credentials", icon: Award },
      { href: "/admin/media", label: "Media", icon: Images },
    ],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/profile", label: "Profile", icon: UserRound },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/messages", label: "Messages", icon: Inbox, badge: true },
    ],
  },
];

export function Sidebar({ email, unread }: { email: string; unread: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-base/90 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="text-sm font-medium">
          Portfolio <span className="text-ink-faint">CMS</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex size-9 items-center justify-center rounded-md hover:bg-surface-2"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open ? <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} aria-hidden /> : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-5">
          <span className="flex size-2 rounded-full bg-signal" aria-hidden />
          <span className="text-sm font-medium tracking-tight">
            Portfolio <span className="text-ink-faint">CMS</span>
          </span>
        </div>

        <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
          {NAV.map((section) => (
            <div key={section.group}>
              <p className="mb-1.5 px-2.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-faint">
                {section.group}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href, "exact" in item ? item.exact : false);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
                          active ? "bg-surface-2 text-ink" : "text-ink-dim hover:bg-surface-2/60 hover:text-ink",
                        )}
                      >
                        <item.icon className={cn("size-4", active && "text-signal")} aria-hidden />
                        {item.label}
                        {"badge" in item && unread > 0 ? (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1.5 text-[0.6875rem] font-medium text-background">
                            {unread}
                            <span className="sr-only"> unread</span>
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-line p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-ink-dim hover:bg-surface-2/60 hover:text-ink"
          >
            <ExternalLink className="size-4" aria-hidden />
            View site
          </a>
          <form action={signOut}>
            <button
              type="submit"
              className="flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-ink-dim hover:bg-surface-2/60 hover:text-ink"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
          <p className="truncate px-2.5 pt-2 font-mono text-[0.6875rem] text-ink-faint" title={email}>
            {email}
          </p>
        </div>
      </aside>
    </>
  );
}
