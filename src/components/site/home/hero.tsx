import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { LocalClock } from "@/components/site/local-clock";
import { BackgroundVideo } from "@/components/site/media-backdrop";
import { plainHeadline } from "@/lib/content/text";
import type { Profile, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Masthead: pixel-type headline, serif intro, square buttons, and an
 * "at a glance" panel beside it on wide screens (below it on phones).
 */
export function Hero({ profile, settings }: { profile: Profile; settings: SiteSettings }) {
  const cta = settings.hero_cta;
  const long = plainHeadline(profile.hero_headline).length > 34;

  const facts = [
    profile.title ? { label: "Role", value: profile.title } : null,
    profile.availability ? { label: "Status", value: profile.availability, live: true } : null,
    profile.location ? { label: "Based in", value: profile.location } : null,
    profile.timezone ? { label: "Local time", value: <LocalClock timezone={profile.timezone} /> } : null,
  ].filter((fact) => fact !== null);

  return (
    <section id="top" data-section="Intro" className="border-b border-line">
      <div className="shell pb-11 pt-24 sm:pt-32 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-center lg:gap-12">
        <div>
          <RevealText
            as="h1"
            immediate
            delay={0.05}
            text={profile.hero_headline}
            className={cn("display-pixel max-w-[22ch]", long && "!text-[clamp(2.2rem,5.4vw,3.7rem)]")}
          />

          {profile.hero_description ? (
            <Reveal delay={0.2} y={8}>
              <p className="lede mb-2 mt-7">{profile.hero_description}</p>
            </Reveal>
          ) : null}

          <Reveal delay={0.3} y={8} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2.5">
            {cta.primary_label && cta.primary_href ? (
              <Link href={cta.primary_href} className="btn btn-primary max-sm:w-full">
                {cta.primary_label}
                <ArrowUpRight className="arrow size-4" aria-hidden />
              </Link>
            ) : null}
            {cta.secondary_label && cta.secondary_href ? (
              <Link href={cta.secondary_href} className="btn max-sm:w-full">
                {cta.secondary_label}
              </Link>
            ) : null}
            {profile.email ? (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex min-h-8 items-center px-1.5 font-mono text-[0.82rem] text-ink-dim transition-colors hover:text-signal"
              >
                {profile.email}
              </a>
            ) : null}
          </Reveal>
        </div>

        {facts.length > 0 ? (
          <Reveal delay={0.35} y={8} className="mt-8 lg:mt-0">
            <aside className="panel" aria-labelledby="glance-title">
              <p id="glance-title" className="eyebrow border-b border-line px-4 py-3 !text-[0.7rem] !tracking-[0.14em]">
                At a glance
              </p>
              <dl>
                {facts.map((fact) => (
                  <div key={fact.label} className="border-b border-line px-4 py-3.5 last:border-b-0">
                    <dt className="label !text-[0.68rem] !tracking-[0.08em] !text-ink-dim">{fact.label}</dt>
                    <dd className="mt-0.5 flex items-center gap-2 text-[1.05rem] leading-snug">
                      {"live" in fact && fact.live ? (
                        <span aria-hidden className="size-2 shrink-0 bg-signal [animation:pulse-dot_2.4s_ease-in-out_infinite]" />
                      ) : null}
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </Reveal>
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
