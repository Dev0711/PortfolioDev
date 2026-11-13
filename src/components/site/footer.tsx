import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { CurrentYear, LocalClock } from "@/components/site/local-clock";
import type { Profile, SiteSettings } from "@/lib/types";
import { isExternal } from "@/lib/utils";

export function Footer({ profile, settings }: { profile: Profile; settings: SiteSettings }) {
  const links = [...profile.socials, ...settings.footer.links];
  const nav = settings.nav.filter((item) => item.visible);

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-line">
      <div className="shell pb-10 pt-20 md:pt-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="label mb-6">Contact</p>
            {settings.footer.headline ? (
              <RevealText as="p" text={settings.footer.headline} className="headline max-w-3xl" />
            ) : null}
            {profile.email ? (
              <Reveal delay={0.15} className="mt-10">
                <Magnetic>
                  <a href={`mailto:${profile.email}`} className="btn btn-primary" data-cursor="Email">
                    {profile.email}
                    <ArrowUpRight className="arrow size-4" aria-hidden />
                  </a>
                </Magnetic>
              </Reveal>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-4">
            <nav aria-label="Footer">
              <p className="label mb-5">Sitemap</p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/" className="link-line text-ink-dim hover:text-ink">
                    Home
                  </Link>
                </li>
                {nav.map((item) => (
                  <li key={item.href + item.label}>
                    <Link href={item.href} className="link-line text-ink-dim hover:text-ink">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {links.length > 0 ? (
              <div>
                <p className="label mb-5">Elsewhere</p>
                <ul className="space-y-3 text-sm">
                  {links.map((link) => (
                    <li key={link.url + link.label}>
                      <a
                        href={link.url}
                        className="link-line text-ink-dim hover:text-ink"
                        {...(isExternal(link.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                  {profile.resume_url ? (
                    <li>
                      <a
                        href={profile.resume_url}
                        className="link-line text-ink-dim hover:text-ink"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Résumé
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="label mt-20 flex flex-col gap-3 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p>
            © <CurrentYear /> {profile.name}
          </p>
          {settings.footer.note ? <p className="normal-case tracking-normal">{settings.footer.note}</p> : null}
          <p>
            {profile.location ? `${profile.location} · ` : ""}
            <LocalClock timezone={profile.timezone} />
          </p>
        </div>
      </div>
    </footer>
  );
}
