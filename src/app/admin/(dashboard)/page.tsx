import { ArrowRight, Briefcase, FileEdit, FolderKanban, Globe, Images, Plus, Send, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Panel, StatusBadge } from "@/components/admin/kit";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import type { ContactMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const DATE = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  const count = (table: string) => supabase.from(table).select("id", { count: "exact", head: true });

  const [projects, published, drafts, experience, unread, messages, recent] = await Promise.all([
    count("projects"),
    count("projects").eq("status", "published"),
    count("projects").eq("status", "draft"),
    count("experience"),
    count("contact_messages").eq("is_read", false),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("projects").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Projects", value: projects.count ?? 0, icon: FolderKanban, href: "/admin/projects" },
    { label: "Published", value: published.count ?? 0, icon: Globe, href: "/admin/projects" },
    { label: "Drafts", value: drafts.count ?? 0, icon: FileEdit, href: "/admin/projects" },
    { label: "Experience entries", value: experience.count ?? 0, icon: Briefcase, href: "/admin/experience" },
  ];

  const quick = [
    { label: "New project", href: "/admin/projects/new", icon: Plus },
    { label: "Add experience", href: "/admin/experience?new=1", icon: Briefcase },
    { label: "Upload media", href: "/admin/media", icon: Images },
    { label: "Edit profile", href: "/admin/profile", icon: UserRound },
  ];

  const inbox = (messages.data ?? []) as ContactMessage[];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything on the public site is managed from here. Changes go live as soon as you publish."
      />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link
              href={stat.href}
              className="group block rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong"
            >
              <div className="flex items-center justify-between text-ink-faint">
                <span className="text-xs">{stat.label}</span>
                <stat.icon className="size-4 transition-colors group-hover:text-signal" aria-hidden />
              </div>
              <p className="mt-4 text-3xl font-medium tabular-nums tracking-tight">{stat.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Recent messages"
          description={`${unread.count ?? 0} unread`}
          actions={
            <Link href="/admin/messages" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              View all <ArrowRight />
            </Link>
          }
        >
          {inbox.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-dim">No messages yet. Contact form submissions appear here.</p>
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {inbox.map((message) => (
                <li key={message.id}>
                  <Link href="/admin/messages" className="flex items-start gap-3 py-3 hover:opacity-80">
                    <span
                      aria-hidden
                      className={cn("mt-1.5 size-2 shrink-0 rounded-full", message.is_read ? "bg-line-strong" : "bg-signal")}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate font-medium">{message.name}</span>
                        <span className="shrink-0 text-xs text-ink-faint">{DATE.format(new Date(message.created_at))}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-ink-dim">{message.subject || message.message}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Quick actions">
          <ul className="-m-1.5 space-y-1">
            {quick.map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className="flex h-10 items-center gap-3 rounded-md px-2.5 text-ink-dim transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <action.icon className="size-4" aria-hidden />
                  {action.label}
                  <ArrowRight className="ml-auto size-3.5 opacity-50" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-6" title="Recently edited projects">
        {(recent.data ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="text-sm text-ink-dim">No projects yet.</p>
            <Link href="/admin/projects/new" className={cn(buttonVariants())}>
              <Send /> Create your first project
            </Link>
          </div>
        ) : (
          <ul className="-my-2 divide-y divide-line">
            {(recent.data ?? []).map((project) => (
              <li key={project.id}>
                <Link href={`/admin/projects/${project.id}`} className="flex items-center gap-4 py-3 hover:opacity-80">
                  <span className="min-w-0 flex-1 truncate font-medium">{project.title}</span>
                  <StatusBadge status={project.status as "draft" | "published"} />
                  <span className="hidden w-40 shrink-0 text-right text-xs text-ink-faint sm:block">
                    {DATE.format(new Date(project.updated_at as string))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
