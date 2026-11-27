import Link from "next/link";
import { AccentText } from "@/components/site/accent-text";
import { CopyChip } from "@/components/site/copy-chip";
import { CurrentYear, LocalClock } from "@/components/site/local-clock";
import type { Profile, SiteSettings } from "@/lib/types";
import { isExternal } from "@/lib/utils";

/** Reference colophon (label + text + copyable command) followed by the mono footer row. */
export function Footer({ profile, settings }: { profile: Profile; settings: SiteSettings }) {
  const links = [...profile.socials, ...settings.footer.links];
  const nav = [{ label: "Home", href: "/" }, ...settings.nav.filter((item) => item.visible)];

  return (
    <>
      <section className="colophon mt-auto border-t border-line" aria-label="Colophon">
        <div className="shell colophon-grid">
          <div className="eyebrow">Colophon</div>
          <div>
            {settings.footer.headline ? (
              <p className="section-title !mt-0 !text-[clamp(1.3rem,2vw,1.7rem)] !leading-[1.1] text-ink">
                <AccentText text={settings.footer.headline} />
              </p>
            ) : null}
            <p className="mt-3">
              {settings.footer.note || "Built by hand with Next.js and Supabase."}{" "}
              {profile.location ? `Based in ${profile.location}, ` : ""}
              local time <LocalClock timezone={profile.timezone} />.
            </p>
            {profile.email ? (
              <div className="colophon-cmd">
                <code>
                  <span className="text-ink-faint">$ </span>mail {profile.email}
                </code>
                <CopyChip value={profile.email} label="Copy email address" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <div className="footer-left">
            <p>
              © <CurrentYear /> · {profile.name}
              {profile.title ? ` · ${profile.title}` : ""}
            </p>
            {links.length > 0 || profile.resume_url ? (
              <div className="footer-socials" aria-label="Profiles">
                {links.map((link) => (
                  <a
                    key={link.url + link.label}
                    href={link.url}
                    className="social-link"
                    {...(isExternal(link.url) ? { target: "_blank", rel: "noopener noreferrer me" } : {})}
                  >
                    <span className="social-handle">{link.label}</span>
                  </a>
                ))}
                {profile.resume_url ? (
                  <a href={profile.resume_url} className="social-link" target="_blank" rel="noopener noreferrer">
                    <span className="social-handle">Résumé</span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
          <nav className="footer-links" aria-label="Footer">
            {nav.map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
