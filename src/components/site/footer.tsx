import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { CurrentYear, LocalClock } from "@/components/site/local-clock";
import type { Profile, SiteSettings } from "@/lib/types";
import { isExternal } from "@/lib/utils";

export function Footer({ profile, settings }: { profile: Profile; settings: SiteSettings }) {
  const links = [...profile.socials, ...settings.footer.links];
  const nav = settings.nav.filter((item) => item.visible);

  return (
    <footer className="relative mt-auto border-t border-line">
      <div className="shell pb-8 pt-12 md:pt-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="eyebrow mb-3">Contact</p>
            {settings.footer.headline ? (
              <p className="headline max-w-[24ch]">
                {settings.footer.headline.split(/(\*[^*]+\*)/).map((part, i) =>
                  part.startsWith("*") && part.endsWith("*") ? (
                    <span key={i} className="accent-serif">
                      {part.slice(1, -1)}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
            ) : null}
            {profile.email ? (
              <Reveal delay={0.1} y={6} className="mt-6">
                <a href={`mailto:${profile.email}`} className="btn btn-primary max-w-full">
                  <span className="truncate">{profile.email}</span>
                  <ArrowUpRight className="arrow size-4 shrink-0" aria-hidden />
                </a>
              </Reveal>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-4">
            <nav aria-label="Footer">
              <p className="label mb-3">Sitemap</p>
              <ul className="space-y-1 font-mono text-[0.78rem] uppercase tracking-[0.06em]">
                <li>
                  <Link href="/" className="inline-flex min-h-8 items-center text-ink-dim transition-colors hover:text-signal">
                    Home
                  </Link>
                </li>
                {nav.map((item) => (
                  <li key={item.href + item.label}>
                    <Link href={item.href} className="inline-flex min-h-8 items-center text-ink-dim transition-colors hover:text-signal">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {links.length > 0 ? (
              <div>
                <p className="label mb-3">Elsewhere</p>
                <ul className="space-y-1 font-mono text-[0.78rem] uppercase tracking-[0.06em]">
                  {links.map((link) => (
                    <li key={link.url + link.label}>
                      <a
                        href={link.url}
                        className="inline-flex min-h-8 items-center text-ink-dim transition-colors hover:text-signal"
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
                        className="inline-flex min-h-8 items-center text-ink-dim transition-colors hover:text-signal"
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

        <div className="label mt-12 flex flex-col gap-2 border-t border-line pt-5 md:flex-row md:items-center md:justify-between">
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
