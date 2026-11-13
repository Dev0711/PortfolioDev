import { ArrowUpRight, Download } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Magnetic } from "@/components/motion/magnetic";
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
      <section className="shell section grid gap-12 md:grid-cols-12" aria-labelledby="about-intro">
        <Reveal className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-surface">
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
            <p id="about-intro" className="label mb-6">
              Introduction
            </p>
            <h2 className="title">
              {profile.name}
              {profile.title ? <span className="text-ink-dim"> — {profile.title}</span> : null}
            </h2>
          </Reveal>
          {profile.about_body ? (
            <Reveal delay={0.1}>
              <div className="prose-site mt-8" dangerouslySetInnerHTML={{ __html: profile.about_body }} />
            </Reveal>
          ) : null}
          <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
            {profile.resume_url ? (
              <Magnetic>
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <Download className="size-4" aria-hidden />
                  Download résumé
                </a>
              </Magnetic>
            ) : null}
            <Magnetic>
              <Link href="/contact" className="btn btn-ghost">
                Get in touch
                <ArrowUpRight className="arrow size-4" aria-hidden />
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      {/* Career journey */}
      {profile.journey ? (
        <section className="border-t border-line">
          <div className="shell section grid gap-10 md:grid-cols-12">
            <Reveal className="md:col-span-3">
              <p className="label flex items-center gap-3">
                <span className="text-signal">01</span>
                <span className="h-px w-8 bg-line-strong" aria-hidden />
                Career journey
              </p>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-8">
              <div className="prose-site !max-w-3xl !text-[clamp(1.125rem,1.6vw,1.5rem)] !leading-[1.5]" dangerouslySetInnerHTML={{ __html: profile.journey }} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Areas of interest */}
      {profile.interests.length > 0 ? (
        <section className="border-t border-line">
          <div className="shell section">
            <SectionHeading index="02" eyebrow="Areas of interest" heading="What I like *working on.*" />
            <Stagger className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {profile.interests.map((interest, i) => (
                <StaggerItem key={interest.title + i} className="bg-base">
                  <Spotlight className="h-full p-7 md:p-9">
                    <p className="label mb-12">{pad2(i + 1)}</p>
                    <h3 className="title">{interest.title}</h3>
                    {interest.body ? <p className="mt-3 leading-relaxed text-ink-dim">{interest.body}</p> : null}
                  </Spotlight>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Technical philosophy */}
      {profile.philosophy.length > 0 ? (
        <section className="border-t border-line bg-surface/30">
          <div className="shell section">
            <SectionHeading index="03" eyebrow="Technical philosophy" heading="How I think about *engineering.*" />
            <Stagger as="ol" className="mt-16 border-t border-line">
              {profile.philosophy.map((item, i) => (
                <StaggerItem
                  as="li"
                  key={item.title + i}
                  className="grid gap-4 border-b border-line py-8 md:grid-cols-12 md:gap-6 md:py-10"
                >
                  <span className="font-mono text-sm text-signal md:col-span-1">{pad2(i + 1)}</span>
                  <h3 className="font-serif text-3xl italic leading-tight md:col-span-5 md:text-4xl">{item.title}</h3>
                  <p className="leading-relaxed text-ink-dim md:col-span-6">{item.body}</p>
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
            <div className="mt-16">
              <ExperienceList items={experience} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Education & certifications */}
      {education.length > 0 || certifications.length > 0 ? (
        <section className="border-t border-line">
          <div className="shell section grid gap-16 md:grid-cols-2 md:gap-10">
            {education.length > 0 ? (
              <div>
                <Reveal>
                  <p className="label mb-8 flex items-center gap-3">
                    <span className="text-signal">05</span>
                    <span className="h-px w-8 bg-line-strong" aria-hidden />
                    Education
                  </p>
                </Reveal>
                <Stagger as="ul" className="border-t border-line">
                  {education.map((item) => (
                    <StaggerItem as="li" key={item.id} className="border-b border-line py-7">
                      <p className="label mb-3">
                        {[item.start_year, item.end_year].filter(Boolean).join(" — ")}
                      </p>
                      <h3 className="title">{item.institution}</h3>
                      <p className="mt-2 text-ink-dim">{[item.degree, item.field].filter(Boolean).join(", ")}</p>
                      {item.notes ? <p className="mt-3 text-sm leading-relaxed text-ink-dim">{item.notes}</p> : null}
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            ) : null}

            {certifications.length > 0 ? (
              <div>
                <Reveal>
                  <p className="label mb-8 flex items-center gap-3">
                    <span className="text-signal">06</span>
                    <span className="h-px w-8 bg-line-strong" aria-hidden />
                    Certifications
                  </p>
                </Reveal>
                <Stagger as="ul" className="border-t border-line">
                  {certifications.map((item) => (
                    <StaggerItem as="li" key={item.id} className="border-b border-line py-7">
                      <p className="label mb-3">{[item.issuer, item.year].filter(Boolean).join(" · ")}</p>
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
