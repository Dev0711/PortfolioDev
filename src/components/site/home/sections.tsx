import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { PrinciplesRail } from "@/components/site/principles-rail";
import { ProjectCard } from "@/components/site/project-card";
import { SectionHeading } from "@/components/site/section-heading";
import { getSkillIcon } from "@/lib/icons";
import type { Experience, HomeSection, Profile, Project, SkillCategory, TextBlock } from "@/lib/types";
import { formatRange, pad2 } from "@/lib/utils";

type SectionProps = { config: HomeSection; index: string };

/** Technology marquee: one slow row of uppercase names, each marked with an accent square. */
export function StackMarquee({ categories, eyebrow }: { categories: SkillCategory[]; eyebrow?: string }) {
  const names = categories.flatMap((c) => c.skills.map((s) => s.name));
  if (names.length === 0) return null;

  return (
    <section aria-label="Technologies" className="overflow-hidden border-b border-line pb-8 pt-9">
      <p className="label mb-4 text-center !text-[0.66rem] !tracking-[0.18em]">{eyebrow || "Tools I work with"}</p>
      {/* Accessible, non-duplicated list for assistive tech */}
      <ul className="sr-only">
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <div aria-hidden className="marquee overflow-hidden">
        <div className="marquee-track" style={{ ["--marquee-duration" as string]: `${Math.max(30, names.length * 3.5)}s` }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-11 pr-11">
              {names.map((name, i) => (
                <span
                  key={name + i}
                  className="inline-flex items-center gap-2.5 whitespace-nowrap font-display text-[1.15rem] font-semibold uppercase tracking-[-0.02em] text-ink-dim"
                >
                  <span className="size-[7px] border border-signal" />
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedWork({ config, index, projects }: SectionProps & { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section id="work" data-section="Work" className="section border-b border-line">
      <div className="shell">
        <SectionHeading
          index={index}
          eyebrow={config.eyebrow}
          heading={config.heading}
          body={config.body}
          ctaLabel={config.cta_label}
          ctaHref={config.cta_href}
        />
        <Stagger className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2" stagger={0.08}>
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
    <section id="principles" data-section="Principles" className="border-b border-line pt-10 md:pt-14 lg:pt-0">
      <div className="shell pb-8 lg:pb-0 lg:pt-14">
        <SectionHeading index={index} eyebrow={config.eyebrow} heading={config.heading} body={config.body} />
      </div>
      <PrinciplesRail items={items} />
      <div className="h-10 lg:h-0" />
    </section>
  );
}

export function Capabilities({ config, index, categories }: SectionProps & { categories: SkillCategory[] }) {
  if (categories.length === 0) return null;
  return (
    <section id="capabilities" data-section="Capabilities" className="section border-b border-line">
      <div className="shell">
        <SectionHeading
          index={index}
          eyebrow={config.eyebrow}
          heading={config.heading}
          body={config.body}
          ctaLabel={config.cta_label}
          ctaHref={config.cta_href}
        />
        <Stagger className="mt-8 grid gap-3.5 md:mt-10 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, i) => (
            <StaggerItem key={category.id} className="h-full">
              <Spotlight className="flex h-full flex-col border border-line bg-surface p-5 transition-colors hover:border-signal">
                <p className="label mb-6 flex items-center justify-between">
                  <span className="text-signal">{pad2(i + 1)}</span>
                  <span>{category.skills.length} tools</span>
                </p>
                <h3 className="title">{category.name}</h3>
                {category.description ? (
                  <p className="mt-2 text-[0.95rem] leading-[1.45] text-ink-dim">{category.description}</p>
                ) : null}
                <ul className="mt-6">
                  {category.skills.map((skill) => {
                    const Icon = getSkillIcon(skill.icon);
                    return (
                      <li
                        key={skill.id}
                        className="group/skill flex items-center gap-3 border-t border-line py-2.5 font-mono text-[0.8rem] transition-colors hover:text-signal"
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
          className="group grid gap-3 border-b border-line py-7 transition-colors hover:bg-[var(--signal-tint)] md:grid-cols-12 md:gap-6 md:px-3"
        >
          <p className="label pt-1 !text-signal md:col-span-3">{formatRange(item.start_date, item.end_date)}</p>
          <div className="md:col-span-4">
            <h3 className="title">{item.role}</h3>
            <p className="mt-1.5 text-ink-dim">
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
            {item.summary ? <p className="leading-[1.6]">{item.summary}</p> : null}
            {item.highlights.length > 0 ? (
              <ul className="mt-3 space-y-1.5 text-[1rem] leading-[1.5] text-ink-dim">
                {item.highlights.map((highlight, i) => (
                  <li key={i} className="relative pl-5">
                    <span aria-hidden className="absolute left-0.5 top-[0.6em] size-[7px] border border-signal" />
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
    <section id="experience" data-section="Experience" className="section border-b border-line">
      <div className="shell">
        <SectionHeading
          index={index}
          eyebrow={config.eyebrow}
          heading={config.heading}
          body={config.body}
          ctaLabel={config.cta_label}
          ctaHref={config.cta_href}
        />
        <div className="mt-8 md:mt-10">
          <ExperienceList items={items} />
        </div>
      </div>
    </section>
  );
}

export function ContactCta({ config, index, profile }: SectionProps & { profile: Profile }) {
  return (
    <section id="contact" data-section="Contact" className="section">
      <div className="shell">
        <Reveal y={8} className="panel grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10 md:p-9">
          <div>
            <p className="eyebrow">
              {index} · {config.eyebrow}
            </p>
            <h2 className="headline mt-3 max-w-[24ch]">
              <AccentText text={config.heading} />
            </h2>
            {config.body ? <p className="mt-4 max-w-[60ch] text-[1.05rem] leading-[1.6]">{config.body}</p> : null}
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col">
            {config.cta_label && config.cta_href ? (
              <Link href={config.cta_href} className="btn btn-primary">
                {config.cta_label}
                <ArrowUpRight className="arrow size-4" aria-hidden />
              </Link>
            ) : null}
            {profile.email ? (
              <a href={`mailto:${profile.email}`} className="btn">
                {profile.email}
              </a>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Renders *accent* words in the accent colour without the word-by-word animation. */
function AccentText({ text }: { text: string }) {
  return text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <span key={i} className="accent-serif">
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    ),
  );
}
