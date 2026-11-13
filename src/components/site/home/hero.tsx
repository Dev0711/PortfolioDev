import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { LocalClock } from "@/components/site/local-clock";
import { MediaBackdrop } from "@/components/site/media-backdrop";
import type { Profile, SiteSettings } from "@/lib/types";

export function Hero({ profile, settings }: { profile: Profile; settings: SiteSettings }) {
  const cta = settings.hero_cta;

  return (
    <section
      id="top"
      data-section="Intro"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-10 pt-32 md:pb-14"
    >
      <MediaBackdrop url={settings.hero_media_url} type={settings.hero_media_type} priority />

      <div className="shell relative">
        <Reveal className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 md:mb-12" y={12}>
          {profile.availability ? (
            <p className="chip !h-8 !border-line-strong bg-base/50 !text-ink backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-signal [animation:pulse-dot_2.4s_ease-in-out_infinite]" />
              </span>
              {profile.availability}
            </p>
          ) : null}
          <p className="label">{profile.title}</p>
        </Reveal>

        <RevealText as="h1" immediate delay={0.15} text={profile.hero_headline} className="display max-w-[16ch]" />

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:items-end">
          <Reveal delay={0.5} className="md:col-span-6 lg:col-span-5">
            <p className="lede">{profile.hero_description}</p>
          </Reveal>

          <Reveal delay={0.6} className="flex flex-wrap gap-3 md:col-span-6 md:justify-end lg:col-span-7">
            {cta.primary_label && cta.primary_href ? (
              <Magnetic>
                <Link href={cta.primary_href} className="btn btn-primary">
                  {cta.primary_label}
                  <ArrowUpRight className="arrow size-4" aria-hidden />
                </Link>
              </Magnetic>
            ) : null}
            {cta.secondary_label && cta.secondary_href ? (
              <Magnetic>
                <Link href={cta.secondary_href} className="btn btn-ghost">
                  {cta.secondary_label}
                </Link>
              </Magnetic>
            ) : null}
          </Reveal>
        </div>

        <Reveal
          delay={0.8}
          y={0}
          className="label mt-14 flex items-center justify-between border-t border-line pt-5 md:mt-20"
        >
          <span className="flex items-center gap-2">
            <ArrowDown className="size-3 animate-bounce" aria-hidden />
            Scroll
          </span>
          <span className="hidden sm:inline">{profile.name}</span>
          <span>
            {profile.location ? `${profile.location} · ` : ""}
            <LocalClock timezone={profile.timezone} />
          </span>
        </Reveal>
      </div>
    </section>
  );
}
