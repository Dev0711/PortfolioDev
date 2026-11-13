import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { AmbientCanvas } from "@/components/site/ambient-canvas";
import { getAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

/** Already signed in as an admin? Skip the form. */
async function RedirectIfSignedIn() {
  const admin = await getAdmin();
  if (admin) redirect("/admin");
  return null;
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="blueprint absolute inset-0" />
        <AmbientCanvas className="absolute inset-0 opacity-40" seed={3} />
      </div>

      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex size-2 rounded-full bg-signal" aria-hidden />
          <span className="text-sm font-medium tracking-tight">
            Portfolio <span className="text-ink-faint">CMS</span>
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-surface/90 p-7 shadow-2xl backdrop-blur">
          <h1 className="text-xl font-medium tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-ink-dim">Administrator access only. There is no public registration.</p>

          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <div role="status" className="mt-6 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-200">
              <p className="font-medium">Supabase is not connected.</p>
              <p className="mt-1.5 text-amber-200/80">
                Add <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to{" "}
                <code className="font-mono text-xs">.env.local</code>, run the migrations and create the admin user.
                The steps are in the README.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          <Link href="/" className="hover:text-ink">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
