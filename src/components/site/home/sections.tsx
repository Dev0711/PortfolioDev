import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { AccentText } from "@/components/site/accent-text";
import { ProjectCard } from "@/components/site/project-card";
import type { Experience, HomeSection, Profile, Project, SkillCategory, TextBlock } from "@/lib/types";
import { formatRange, isExternal, pad2 } from "@/lib/utils";

type SectionProps = { config: HomeSection; index: string };

/** Reference section header: accent eyebrow + pixel title on the left, lede on the right. */
export function SectionHead({
  index,
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  id,
}: {
  index?: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  id?: string;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow ? (
          <p className="eyebrow">
            {index ? `${index} · ` : ""}
            {eyebrow}
          </p>
        ) : null}
        {heading ? (
          <h2 className="section-title" id={id}>
            <AccentText text={heading} />
          </h2>
        ) : null}
      </div>
      {body || (ctaLabel && ctaHref) ? (
        <div>
          {body ? <p className="section-lede">{body}</p> : null}
          {ctaLabel && ctaHref ? (
            <p className="section-foot !mt-3">
              <Link href={ctaHref}>{ctaLabel} →</Link>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** "Built with" strip: one row of uppercase names plus a quoted principle. */
export function StackMarquee({
  categories,
  eyebrow,
  quote,
}: {
  categories: SkillCategory[];
  eyebrow?: string;
  quote?: string;
}) {
  const names = categories.flatMap((c) => c.skills.map((s) => s.name));
  if (names.length === 0) return null;

  return (
    <section className="stack-strip" aria-label="Technologies">
      <div className="stack-eyebrow">{eyebrow || "Tools I work with"}</div>
      <ul className="sr-only">
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <div aria-hidden className="marquee overflow-hidden">
        <div className="marquee-track" style={{ ["--marquee-duration" as string]: `${Math.max(30, names.length * 3.5)}s` }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-half">
              {names.map((name, i) => (
                <span key={name + i} className="marquee-item">
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      {quote ? (
        <p className="stack-quote">
          &ldquo;{quote}&rdquo; <span>· principle №1</span>
        </p>
      ) : null}
    </section>
  );
}

export function FeaturedWork({ config, index, projects }: SectionProps & { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section id="work" data-section="Work" className="bp-section">
      <div className="shell">
        <SectionHead
          index={index}
          eyebrow={config.eyebrow}
          heading={config.heading}
          body={config.body}
          ctaLabel={config.cta_label}
          ctaHref={config.cta_href}
        />
        <div className="machine-grid">
          {projects.map((project, i) => (
            <Reveal key={project.id} y={8} delay={i * 0.04} className="h-full">
              <ProjectCard project={project} index={i} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Numbered step cards (reference "your agent is the tutor" steps). */
export function StepCards({ items }: { items: TextBlock[] }) {
  return (
    <ol className="steps">
      {items.map((item, i) => (
        <li key={item.title + i} className="step">
          <span className="step-num">{pad2(i + 1)}</span>
          <h3 className="step-title">{item.title}</h3>
          {item.body ? <p className="step-text">{item.body}</p> : null}
        </li>
      ))}
    </ol>
  );
}

export function Principles({ config, index, items }: SectionProps & { items: TextBlock[] }) {
  if (items.length === 0) return null;
  return (
    <section id="principles" data-section="Principles" className="bp-section">
      <div className="shell">
        <SectionHead index={index} eyebrow={config.eyebrow} heading={config.heading} body={config.body} />
        <StepCards items={items} />
      </div>
    </section>
  );
}

/** Skill areas drawn as the reference "learning paths" diagram: a root box joined to up to four nodes. */
export function Capabilities({ config, index, categories }: SectionProps & { categories: SkillCategory[] }) {
  if (categories.length === 0) return null;
  const tools = categories.reduce((sum, c) => sum + c.skills.length, 0);
  const diagram = categories.length <= 4;
  const ends: [number, number][] = [
    [18, 16],
    [82, 16],
    [18, 84],
    [82, 84],
  ];

  return (
    <section id="capabilities" data-section="Capabilities" className="bp-section">
      <div className="shell">
        <div className="paths-header">
          <div>
            <p className="eyebrow mb-3">
              {index} · {config.eyebrow}
            </p>
            <h2>
              <AccentText text={config.heading} />
            </h2>
          </div>
          <div>
            {config.body ? <p>{config.body}</p> : null}
            <div className="paths-links">
              {config.cta_label && config.cta_href ? <Link href={config.cta_href}>{config.cta_label}</Link> : null}
              <Link href="/work">See it in projects</Link>
            </div>
          </div>
        </div>

        {diagram ? (
          <figure className="paths-figure">
            <svg className="paths-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {categories.map((c, i) => (
                <line key={c.id} x1="50" y1="50" x2={ends[i][0]} y2={ends[i][1]} />
              ))}
            </svg>
            <div className="paths-root">
              <strong>{config.eyebrow || "Toolkit"}</strong>
              <span>
                {tools} tools · {categories.length} areas
              </span>
            </div>
            {categories.map((category, i) => (
              <article key={category.id} className="path-node">
                <span className="path-node-tag">Area {pad2(i + 1)}</span>
                <span className="path-node-name">{category.name}</span>
                {category.description ? <span className="path-node-desc">{category.description}</span> : null}
                <span className="path-node-phases">{category.skills.map((s) => s.name).join(" · ")}</span>
              </article>
            ))}
          </figure>
        ) : (
          <div className="phase-grid">
            {categories.map((category, i) => (
              <div key={category.id} className="phase-card">
                <div className="phase-card-top">
                  <span className="phase-card-num">Area {pad2(i + 1)}</span>
                  <span>{category.skills.length} tools</span>
                </div>
                <h3 className="phase-card-name">{category.name}</h3>
                <p className="phase-card-desc">{category.description}</p>
                <div className="phase-card-bar">
                  <span style={{ width: `${Math.round((category.skills.length / Math.max(1, tools)) * 100)}%` }} />
                </div>
                <div className="phase-card-foot">
                  <span>{category.skills.map((s) => s.name).slice(0, 3).join(" · ")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Full experience list (About page): rows with dates, role, summary, highlights and tags. */
export function ExperienceList({ items }: { items: Experience[] }) {
  return (
    <ol className="iv-list">
      {items.map((item, i) => (
        <li key={item.id} className="grid gap-x-6 gap-y-2 border-b border-line px-1 py-6 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="iv-row-num">{pad2(i + 1)}</p>
            <p className="label mt-1">{formatRange(item.start_date, item.end_date)}</p>
          </div>
          <div className="md:col-span-4">
            <h3 className="pager-title !text-[1.15rem]">{item.role}</h3>
            <p className="mt-1.5 text-ink-dim">
              {item.company_url ? (
                <a href={item.company_url} target="_blank" rel="noopener noreferrer" className="text-signal">
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
              <ul className="mt-2 list-[square] space-y-1 pl-5 text-ink-dim marker:text-signal">
                {item.highlights.map((highlight, h) => (
                  <li key={h}>{highlight}</li>
                ))}
              </ul>
            ) : null}
            {item.technologies.length > 0 ? (
              <ul className="iv-row-meta mt-3" aria-label="Technologies">
                {item.technologies.map((tech) => (
                  <li key={tech} className="iv-type">
                    {tech}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Experience as the reference "how every lesson works" loop figure: up to four roles joined by arrows. */
export function ExperienceSection({ config, index, items }: SectionProps & { items: Experience[] }) {
  if (items.length === 0) return null;
  const steps = items.slice(0, 4);
  return (
    <section id="experience" data-section="Experience" className="bp-section">
      <div className="shell">
        <SectionHead index={index} eyebrow={config.eyebrow} heading={config.heading} body={config.body} />
        <figure className="loop-figure">
          <ol className="loop-steps" style={{ ["--n" as string]: steps.length }}>
            {steps.map((item) => (
              <li key={item.id} className="loop-step">
                <span className="loop-step-label">{formatRange(item.start_date, item.end_date)}</span>
                <h3>{item.role}</h3>
                <p>
                  <strong className="font-semibold text-ink">{item.company}</strong>
                  {item.summary ? ` — ${item.summary}` : ""}
                </p>
                {item.technologies.length > 0 ? (
                  <pre>
                    <span className="k">stack</span> = [{item.technologies.slice(0, 4).map((t) => `"${t}"`).join(", ")}]
                  </pre>
                ) : null}
              </li>
            ))}
          </ol>
          {config.cta_label && config.cta_href ? (
            <figcaption>
              The full history, with highlights for each role, is on the{" "}
              <Link href={config.cta_href}>{config.cta_label.toLowerCase()} page</Link>.
            </figcaption>
          ) : null}
        </figure>
      </div>
    </section>
  );
}

/** Contact in the reference "capstone" layout: rotating seal, copy with proof numbers, actions. */
export function ContactCta({
  config,
  index,
  profile,
  stats,
}: SectionProps & { profile: Profile; stats: { label: string; value: number }[] }) {
  const seal = `${profile.name || "portfolio"} · ${profile.availability ? "available" : "say hello"} · `.toLowerCase();
  return (
    <section id="contact" data-section="Contact" className="capstone">
      <div className="shell">
        <div className="spotlight-grid">
          <svg className="seal" viewBox="0 0 180 180" aria-hidden>
            <defs>
              <path id="sealPath" d="M90 90m-68 0a68 68 0 1 1 136 0a68 68 0 1 1 -136 0" />
            </defs>
            <circle cx="90" cy="90" r="86" className="ring" />
            <circle cx="90" cy="90" r="56" className="ring-d" />
            <g className="seal-spin">
              <text>
                <textPath href="#sealPath">{seal.repeat(2)}</textPath>
              </text>
            </g>
            <rect x="44" y="66" width="92" height="48" className="core" />
            <text x="90" y="97" textAnchor="middle" className="big">
              HELLO
            </text>
          </svg>
          <div className="spotlight-copy">
            <span className="eyebrow">
              {index} · {config.eyebrow}
            </span>
            <h2>
              <AccentText text={config.heading} />
            </h2>
            {config.body ? <p>{config.body}</p> : null}
            {stats.length > 0 ? (
              <div className="proof">
                {stats.map((stat) => (
                  <span key={stat.label}>
                    <strong>{stat.value}</strong>
                    {stat.label}
                  </span>
                ))}
              </div>
            ) : null}
            {profile.location ? <p className="spotlight-note">Based in {profile.location}. Remote-friendly.</p> : null}
          </div>
          <div className="spotlight-actions">
            {config.cta_label && config.cta_href ? (
              <Link href={config.cta_href} className="btn btn-primary">
                {config.cta_label}
              </Link>
            ) : null}
            {profile.email ? (
              <a href={`mailto:${profile.email}`} className="btn">
                Email me
              </a>
            ) : null}
            {profile.socials.slice(0, 1).map((social) => (
              <a
                key={social.url}
                href={social.url}
                className="btn"
                {...(isExternal(social.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {social.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
