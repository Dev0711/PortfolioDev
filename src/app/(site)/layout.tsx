import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { plainHeadline } from "@/lib/content/text";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PreviewBanner } from "@/components/site/preview-banner";
import { Cursor, MotionProvider, ScrollProgress } from "@/components/site/site-chrome";
import { getProfile, getSettings } from "@/lib/content/queries";
import { isSupabaseConfigured } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);
  const title = settings.seo_title || [profile.name, profile.title].filter(Boolean).join(" — ") || "Portfolio";
  const description = settings.seo_description || plainHeadline(profile.hero_description);

  return {
    title: { default: title, template: `%s — ${profile.name || "Portfolio"}` },
    description,
    openGraph: { type: "website", title, description, siteName: profile.name || undefined },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: "/" },
  };
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);

  // Accent colours come from site settings and feed the whole design system.
  const theme = { "--signal": settings.accent, "--signal-alt": settings.accent_alt } as CSSProperties;

  return (
    <MotionProvider>
      <div style={theme} className="relative flex min-h-screen flex-col">
        {/* Without JavaScript, show everything that would otherwise animate in. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-curtain]{display:none!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-background"
        >
          Skip to content
        </a>
        <ScrollProgress />
        <Header name={profile.name} title={profile.title} nav={settings.nav} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer profile={profile} settings={settings} />
        {!isSupabaseConfigured ? <PreviewBanner /> : null}
        <Cursor />
        <div aria-hidden className="grain" />
      </div>
    </MotionProvider>
  );
}
