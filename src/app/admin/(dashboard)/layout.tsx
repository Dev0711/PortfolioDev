import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";

/**
 * Authenticated shell. `requireAdmin()` runs on the server for every request
 * to any /admin page: it verifies the session with Supabase Auth and checks
 * the admins allow-list, redirecting to /admin/login otherwise. Nothing below
 * this boundary is rendered or streamed for an unauthorised visitor.
 */
async function AdminShell({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const { count } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);

  return (
    <>
      <Sidebar email={user.email ?? ""} unread={count ?? 0} />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-ink-faint" role="status" aria-label="Loading">
          <Loader2 className="size-5 animate-spin" />
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
