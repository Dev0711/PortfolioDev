import { ArrowUpRight, Download } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { ExperienceList } from "@/components/site/home/sections";
import { PageHero } from "@/components/site/page-hero";
import { GenerativeCover } from "@/components/site/project-cover";
import { SectionHeading } from "@/components/site/section-heading";
import {
  getCertifications,
  getEducation,
  getExperience,
  getProfile,
} from "@/lib/content/queries";
import { pad2 } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: "Background, experience and engineering philosophy.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [profile, experience, education, certifications] = await Promise.all([
    getProfile(),
    getExperience(),
    getEducation(),
    getCertifications(),
  ]);

  return (
    <>
      <PageHero index="02" eyebrow="About" heading={profile.about_intro || profile.title} seed={41} />

      {/* Introduction */}
      <section className="shell section grid gap-10 md:grid-cols-12" aria-labelledby="about-intro">
        <Reveal className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden border border-ink bg-surface shadow-[var(--shadow-hard)]">
            <Parallax className="absolute -inset-y-8 inset-x-0" amount={60}>
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={`Portrait of ${profile.name}`}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <GenerativeCover seed={`about-${profile.name}`} label={profile.title} />
              )}
            </Parallax>
          </div>
        </Reveal>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p id="about-intro" className="eyebrow mb-3">
              Introduction
            </p>
            <h2 className="headline">
              {profile.name}
              
            </h2>
            {profile.title ? <p className="mt-2 font-mono text-[0.8rem] text-signal">{profile.title}</p> : null}
          </Reveal>
          {profile.about_body ? (
            <Reveal delay={0.1}>
              <div className="prose-site mt-6" dangerouslySetInnerHTML={{ __html: profile.about_body }} />
            </Reveal>
          ) : null}
          <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-2.5">
            {profile.resume_url ? (
                              <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <Download className="size-4" aria-hidden />
                  Download résumé
                </a>
                          ) : null}
                          <Link href="/contact" className="btn">
                Get in touch
                <ArrowUpRight className="arrow size-4" aria-hidden />
              </Link>
                      </Reveal>
        </div>
      </section>

      {/* Career journey */}
      {profile.journey ? (
        <section className="border-t border-line">
          <div className="shell section grid gap-10 md:grid-cols-12">
            <Reveal className="md:col-span-3">
              <p className="eyebrow">01 · Career journey</p>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-8">
              <div className="prose-site !text-[clamp(1.08rem,1.4vw,1.2rem)]" dangerouslySetInnerHTML={{ __html: profile.journey }} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Areas of interest */}
      {profile.interests.length > 0 ? (
        <section className="border-t border-line">
          <div className="shell section">
            <SectionHeading index="02" eyebrow="Areas of interest" heading="What I like *working on.*" />
            <Stagger className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {profile.interests.map((interest, i) => (
                <StaggerItem key={interest.title + i} className="h-full">
                  <Spotlight className="h-full border border-line bg-surface p-5 transition-colors hover:border-signal">
                    <p className="label mb-5 !text-signal">{pad2(i + 1)}</p>
                    <h3 className="title">{interest.title}</h3>
                    {interest.body ? <p className="mt-2 text-[1rem] leading-[1.5] text-ink-dim">{interest.body}</p> : null}
                  </Spotlight>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Technical philosophy */}
      {profile.philosophy.length > 0 ? (
        <section className="border-t border-line">
          <div className="shell section">
            <SectionHeading index="03" eyebrow="Technical philosophy" heading="How I think about *engineering.*" />
            <Stagger as="ol" className="mt-8 border-t border-line">
              {profile.philosophy.map((item, i) => (
                <StaggerItem
                  as="li"
                  key={item.title + i}
                  className="grid gap-2 border-b border-line py-6 md:grid-cols-12 md:gap-6"
                >
                  <span className="pt-1 font-mono text-[0.8rem] text-signal md:col-span-1">{pad2(i + 1)}</span>
                  <h3 className="title !text-[1.3rem] md:col-span-5">{item.title}</h3>
                  <p className="leading-[1.6] text-ink-dim md:col-span-6">{item.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Experience */}
      {experience.length > 0 ? (
        <section className="border-t border-line">
          <div className="shell section">
            <SectionHeading index="04" eyebrow="Experience" heading="Where I have been *building.*" />
            <div className="mt-8">
              <ExperienceList items={experience} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Education & certifications */}
      {education.length > 0 || certifications.length > 0 ? (
        <section className="border-t border-line">
          <div className="shell section grid gap-12 md:grid-cols-2 md:gap-10">
            {education.length > 0 ? (
              <div>
                <Reveal>
                  <p className="eyebrow mb-4">05 · Education</p>
                </Reveal>
                <Stagger as="ul" className="border-t border-line">
                  {education.map((item) => (
                    <StaggerItem as="li" key={item.id} className="border-b border-line py-5">
                      <p className="label mb-2">
                        {[item.start_year, item.end_year].filter(Boolean).join(" — ")}
                      </p>
                      <h3 className="title">{item.institution}</h3>
                      <p className="mt-2 text-ink-dim">{[item.degree, item.field].filter(Boolean).join(", ")}</p>
                      {item.notes ? <p className="mt-2 text-[0.98rem] leading-[1.5] text-ink-dim">{item.notes}</p> : null}
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            ) : null}

            {certifications.length > 0 ? (
              <div>
                <Reveal>
                  <p className="eyebrow mb-4">06 · Certifications</p>
                </Reveal>
                <Stagger as="ul" className="border-t border-line">
                  {certifications.map((item) => (
                    <StaggerItem as="li" key={item.id} className="border-b border-line py-5">
                      <p className="label mb-2">{[item.issuer, item.year].filter(Boolean).join(" · ")}</p>
                      <h3 className="title">
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="link-line">
                            {item.name}
                          </a>
                        ) : (
                          item.name
                        )}
                      </h3>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
