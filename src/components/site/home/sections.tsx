import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, RevealText, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { AmbientCanvas } from "@/components/site/ambient-canvas";
import { PrinciplesRail } from "@/components/site/principles-rail";
import { ProjectCard } from "@/components/site/project-card";
import { SectionHeading } from "@/components/site/section-heading";
import { getSkillIcon } from "@/lib/icons";
import type { Experience, HomeSection, Profile, Project, SkillCategory, TextBlock } from "@/lib/types";
import { formatRange, pad2 } from "@/lib/utils";

type SectionProps = { config: HomeSection; index: string };

/** Technology marquee, two rows drifting in opposite directions. */
export function StackMarquee({ categories }: { categories: SkillCategory[] }) {
  const names = categories.flatMap((c) => c.skills.map((s) => s.name));
  if (names.length === 0) return null;
  const rows = [names, [...names].reverse()];

  return (
    <section aria-label="Technologies" className="border-y border-line py-6 md:py-8">
      {/* Accessible, non-duplicated list for assistive tech */}
      <ul className="sr-only">
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <div aria-hidden className="space-y-4">
        {rows.map((row, r) => (
          <div key={r} className="marquee overflow-hidden">
            <div
              className="marquee-track"
              style={{
                ["--marquee-duration" as string]: `${Math.max(30, row.length * 4)}s`,
                animationDirection: r === 1 ? "reverse" : "normal",
              }}
            >
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center">
                  {row.map((name, i) => (
                    <span key={name + i} className="flex items-center">
                      <span
                        className={
                          r === 0
                            ? "px-6 text-3xl font-medium tracking-tight md:text-5xl"
                            : "px-6 font-serif text-3xl italic text-ink-dim md:text-5xl"
                        }
                      >
                        {name}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeaturedWork({ config, index, projects }: SectionProps & { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section id="work" data-section="Work" className="section">
      <div className="shell">
        <SectionHeading
          index={index}
          eyebrow={config.eyebrow}
          heading={config.heading}
          body={config.body}
          ctaLabel={config.cta_label}
          ctaHref={config.cta_href}
        />
        <Stagger className="mt-16 grid gap-5 md:mt-24 md:grid-cols-2 md:gap-6" stagger={0.12}>
          {projects.map((project, i) => (
            <StaggerItem key={project.id} className={i === 0 ? "md:col-span-2" : undefined}>
              <ProjectCard project={project} index={i} wide={i === 0} priority={i === 0} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Principles({ config, index, items }: SectionProps & { items: TextBlock[] }) {
  if (items.length === 0) return null;
  return (
    <section id="principles" data-section="Principles" className="border-y border-line bg-surface/30 pt-24 md:pt-32 lg:pt-0">
      <div className="shell pb-12 lg:pb-0 lg:pt-32">
        <SectionHeading index={index} eyebrow={config.eyebrow} heading={config.heading} body={config.body} />
      </div>
      <PrinciplesRail items={items} />
      <div className="h-20 lg:h-0" />
    </section>
  );
}

export function Capabilities({ config, index, categories }: SectionProps & { categories: SkillCategory[] }) {
  if (categories.length === 0) return null;
  return (
    <section id="capabilities" data-section="Capabilities" className="section">
      <div className="shell">
        <SectionHeading
          index={index}
          eyebrow={config.eyebrow}
          heading={config.heading}
          body={config.body}
          ctaLabel={config.cta_label}
          ctaHref={config.cta_href}
        />
        <Stagger className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:mt-24 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, i) => (
            <StaggerItem key={category.id} className="bg-base">
              <Spotlight className="flex h-full flex-col p-7 md:p-8">
                <p className="label mb-10 flex items-center justify-between">
                  <span>{pad2(i + 1)}</span>
                  <span>{category.skills.length} tools</span>
                </p>
                <h3 className="title">{category.name}</h3>
                {category.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-ink-dim">{category.description}</p>
                ) : null}
                <ul className="mt-10 space-y-px">
                  {category.skills.map((skill) => {
                    const Icon = getSkillIcon(skill.icon);
                    return (
                      <li
                        key={skill.id}
                        className="group/skill flex items-center gap-3 border-t border-line py-3 text-[0.9375rem] transition-colors hover:text-signal"
                      >
                        <Icon aria-hidden className="size-4 text-ink-faint transition-colors group-hover/skill:text-signal" />
                        {skill.name}
                      </li>
                    );
                  })}
                </ul>
              </Spotlight>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function ExperienceList({ items }: { items: Experience[] }) {
  return (
    <Stagger as="ol" className="border-t border-line" stagger={0.1}>
      {items.map((item) => (
        <StaggerItem
          as="li"
          key={item.id}
          className="group grid gap-4 border-b border-line py-8 transition-colors hover:bg-surface/40 md:grid-cols-12 md:gap-6 md:py-10"
        >
          <p className="label pt-1.5 md:col-span-3">{formatRange(item.start_date, item.end_date)}</p>
          <div className="md:col-span-4">
            <h3 className="title">{item.role}</h3>
            <p className="mt-2 text-ink-dim">
              {item.company_url ? (
                <a href={item.company_url} target="_blank" rel="noopener noreferrer" className="link-line">
                  {item.company}
                </a>
              ) : (
                item.company
              )}
              {item.location ? ` · ${item.location}` : ""}
            </p>
          </div>
          <div className="md:col-span-5">
            {item.summary ? <p className="leading-relaxed text-ink-dim">{item.summary}</p> : null}
            {item.highlights.length > 0 ? (
              <ul className="mt-4 space-y-2 text-[0.9375rem] text-ink-dim">
                {item.highlights.map((highlight, i) => (
                  <li key={i} className="relative pl-5">
                    <span aria-hidden className="absolute left-0 top-[0.7em] h-px w-2.5 bg-signal" />
                    {highlight}
                  </li>
                ))}
              </ul>
            ) : null}
            {item.technologies.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
                {item.technologies.map((tech) => (
                  <li key={tech} className="chip">
                    {tech}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function ExperienceSection({ config, index, items }: SectionProps & { items: Experience[] }) {
  if (items.length === 0) return null;
  return (
    <section id="experience" data-section="Experience" className="section">
      <div className="shell">
        <SectionHeading
          index={index}
          eyebrow={config.eyebrow}
          heading={config.heading}
          body={config.body}
          ctaLabel={config.cta_label}
          ctaHref={config.cta_href}
        />
        <div className="mt-16 md:mt-24">
          <ExperienceList items={items} />
        </div>
      </div>
    </section>
  );
}

export function ContactCta({ config, index, profile }: SectionProps & { profile: Profile }) {
  return (
    <section id="contact" data-section="Contact" className="relative overflow-hidden border-t border-line">
      <Parallax className="pointer-events-none absolute inset-0 opacity-70" amount={120}>
        <AmbientCanvas seed={23} />
      </Parallax>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--base)_75%)]" />

      <div className="shell section relative flex flex-col items-center text-center">
        <Reveal>
          <p className="label mb-8 flex items-center gap-3">
            <span className="text-signal">{index}</span>
            <span className="h-px w-8 bg-line-strong" aria-hidden />
            {config.eyebrow}
          </p>
        </Reveal>
        <RevealText text={config.heading} className="display max-w-[18ch] !text-[clamp(2.5rem,7vw,7rem)]" />
        {config.body ? (
          <Reveal delay={0.15}>
            <p className="lede mx-auto mt-8">{config.body}</p>
          </Reveal>
        ) : null}
        <Reveal delay={0.25} className="mt-12 flex flex-wrap justify-center gap-3">
          {config.cta_label && config.cta_href ? (
            <Magnetic>
              <Link href={config.cta_href} className="btn btn-primary">
                {config.cta_label}
                <ArrowUpRight className="arrow size-4" aria-hidden />
              </Link>
            </Magnetic>
          ) : null}
          {profile.email ? (
            <Magnetic>
              <a href={`mailto:${profile.email}`} className="btn btn-ghost">
                {profile.email}
              </a>
            </Magnetic>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
