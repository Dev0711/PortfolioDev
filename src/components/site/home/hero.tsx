import Image from "next/image";
import Link from "next/link";
import { AccentText } from "@/components/site/accent-text";
import { CopyChip } from "@/components/site/copy-chip";
import { LocalClock } from "@/components/site/local-clock";
import { BackgroundVideo } from "@/components/site/media-backdrop";
import { plainHeadline } from "@/lib/content/text";
import type { Profile, Project, SiteSettings, SkillCategory } from "@/lib/types";
import { cn, isExternal, pad2 } from "@/lib/utils";

/**
 * Masthead in the reference layout: pixel title, serif tagline, italic
 * attribution, square buttons, a "Start here" box of featured projects and a
 * terminal-style contact box with a copy button.
 */
export function Hero({
  profile,
  settings,
  projects,
  categories,
}: {
  profile: Profile;
  settings: SiteSettings;
  projects: Project[];
  categories: SkillCategory[];
}) {
  const cta = settings.hero_cta;
  const long = plainHeadline(profile.hero_headline).length > 34;
  const start = projects.slice(0, 4);
  const tools = categories.flatMap((c) => c.skills.map((s) => s.name)).slice(0, 4);
  const attribution = [profile.availability, profile.location ? `Based in ${profile.location}` : ""].filter(Boolean);

  return (
    <section id="top" data-section="Intro" className="border-b border-line">
      <div className="masthead shell border-b-0">
        <h1 className={cn("masthead-title", long && "!text-[clamp(2.2rem,5.4vw,3.9rem)]")}>
          <AccentText text={profile.hero_headline} />
          <span className="cursor" aria-hidden />
        </h1>

        {profile.hero_description ? <p className="masthead-tagline">{profile.hero_description}</p> : null}
        {attribution.length > 0 ? (
          <p className="masthead-attribution">
            {attribution.join(". ")}
            {profile.timezone ? (
              <>
                . Local time <LocalClock timezone={profile.timezone} />.
              </>
            ) : null}
          </p>
        ) : null}

        <div className="masthead-cta">
          {cta.primary_label && cta.primary_href ? (
            <Link href={cta.primary_href} className="btn btn-primary">
              {cta.primary_label}
            </Link>
          ) : null}
          {cta.secondary_label && cta.secondary_href ? (
            <Link href={cta.secondary_href} className="btn">
              {cta.secondary_label}
            </Link>
          ) : null}
          {profile.socials.slice(0, 3).map((social) => (
            <a
              key={social.url}
              href={social.url}
              className="btn btn--quiet"
              {...(isExternal(social.url) ? { target: "_blank", rel: "noopener noreferrer me" } : {})}
            >
              {social.label} ↗
            </a>
          ))}
        </div>

        {start.length > 0 ? (
          <nav className="start-box" aria-labelledby="start-title">
            <p className="start-box-title" id="start-title">
              Start here
            </p>
            <ul className="start-list">
              {start.map((project, i) => (
                <li key={project.id}>
                  <Link className="start-row" href={`/work/${project.slug}`}>
                    <span className="start-who">{project.category || "Project"}</span>
                    <span className="start-lesson">
                      <span className="start-phase">{pad2(i + 1)}</span>
                      {project.title}
                    </span>
                    <span className="start-time">{project.timeframe ? `${project.timeframe} →` : "Read →"}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="start-more" href="/work">
              Browse all projects →
            </Link>
          </nav>
        ) : null}

        {profile.email ? (
          <div className="terminal">
            <div className="terminal-bar">
              <span>Get in touch</span>
              <CopyChip value={profile.email} label="Copy email address" />
            </div>
            <pre>
              <span>mailto:{profile.email}</span>
              {"\n"}
              <span className="p">&gt;</span>{" "}
              <span className="b">{profile.availability || "Replies within a couple of days."}</span>
            </pre>
            {tools.length > 0 ? (
              <div className="terminal-agents" aria-label="Main tools">
                {tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
                <span>+ more below</span>
              </div>
            ) : null}
          </div>
        ) : null}
        {profile.email ? (
          <p className="terminal-caption">
            {profile.title ? `${profile.title}. ` : ""}
            <Link href="/contact">Send a message →</Link>
          </p>
        ) : null}
      </div>

      {settings.hero_media_url && settings.hero_media_type ? (
        <div className="shell pb-11">
          <figure className="relative aspect-[16/9] overflow-hidden border border-line bg-surface md:aspect-[21/9]">
            {settings.hero_media_type === "video" ? (
              <BackgroundVideo src={settings.hero_media_url} className="!opacity-100" />
            ) : (
              <Image src={settings.hero_media_url} alt="" fill priority sizes="100vw" className="object-cover" />
            )}
          </figure>
        </div>
      ) : null}
    </section>
  );
}
