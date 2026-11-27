import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { plainHeadline } from "@/lib/content/text";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PreviewBanner } from "@/components/site/preview-banner";
import { MotionProvider, ScrollProgress } from "@/components/site/site-chrome";
import { getProfile, getProjects, getSettings } from "@/lib/content/queries";
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
  const [profile, settings, projects] = await Promise.all([getProfile(), getSettings(), getProjects()]);
  const search = [
    { label: "Home", href: "/", group: "Page" },
    ...settings.nav.filter((item) => item.visible && item.href.startsWith("/")).map((item) => ({ label: item.label, href: item.href, group: "Page" })),
    ...projects.map((project) => ({
      label: project.title,
      href: `/work/${project.slug}`,
      group: "Project",
      meta: project.category,
    })),
  ];

  // Accent colours come from site settings and feed the whole design system.
  const theme = { "--signal": settings.accent, "--signal-alt": settings.accent_alt } as CSSProperties;

  return (
    <MotionProvider>
      {/* Apply the saved light/dark choice (or the device setting) before first paint. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=null;try{t=localStorage.getItem("site-theme")}catch(e){}if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t})()`,
        }}
      />
      <div style={theme} className="site relative flex min-h-screen flex-col">
        {/* Without JavaScript, show everything that would otherwise animate in. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-curtain]{display:none!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:bg-signal focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-background"
        >
          Skip to content
        </a>
        <ScrollProgress />
        <Header name={profile.name} title={profile.title} nav={settings.nav} search={search} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer profile={profile} settings={settings} />
        {!isSupabaseConfigured ? <PreviewBanner /> : null}
      </div>
    </MotionProvider>
  );
}
