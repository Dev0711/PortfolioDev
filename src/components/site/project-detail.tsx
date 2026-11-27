import { ArrowLeft, ArrowUpRight, Code2, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, RevealText, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProjectCover } from "@/components/site/project-cover";
import type { Project } from "@/lib/types";
import { pad2, slugify } from "@/lib/utils";

/**
 * Case-study view. Shared by the public route (/work/[slug]) and the admin
 * draft preview, so a preview is pixel-identical to the published page.
 */
export function ProjectDetail({ project, next }: { project: Project; next?: Project | null }) {
  const sections = project.sections.filter((section) => section.heading || section.html);
  const anchor = (heading: string, i: number) => `${slugify(heading) || "section"}-${i + 1}`;

  const meta = [
    { label: "Role", value: project.role },
    { label: "Timeframe", value: project.timeframe },
    { label: "Category", value: project.category },
  ].filter((item) => item.value);

  return (
    <article>
      <header className="shell pb-10 pt-24 sm:pt-32">
        <Reveal y={12}>
          <Link href="/work" className="label inline-flex min-h-8 items-center gap-2 !text-ink-dim transition-colors hover:!text-signal">
            <ArrowLeft className="size-3" aria-hidden />
            All work
          </Link>
        </Reveal>

        <RevealText as="h1" immediate delay={0.1} text={project.title} className="display mt-5 max-w-[22ch]" />

        <div className="mt-8 grid gap-8 md:grid-cols-12">
          <Reveal delay={0.35} className="md:col-span-6">
            {project.summary ? <p className="lede">{project.summary}</p> : null}
            {project.live_url || project.github_url ? (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {project.live_url ? (
                                      <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      <Globe className="size-4" aria-hidden />
                      Live demo
                      <ArrowUpRight className="arrow size-4" aria-hidden />
                    </a>
                                  ) : null}
                {project.github_url ? (
                                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn">
                      <Code2 className="size-4" aria-hidden />
                      Source code
                    </a>
                                  ) : null}
              </div>
            ) : null}
          </Reveal>

          <Reveal delay={0.45} className="md:col-span-5 md:col-start-8">
            <dl className="panel grid grid-cols-2 gap-x-6 gap-y-5 p-5">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="label mb-2">{item.label}</dt>
                  <dd className="text-[1.02rem] leading-snug">{item.value}</dd>
                </div>
              ))}
              {project.technologies.length > 0 ? (
                <div className="col-span-2">
                  <dt className="label mb-3">Technologies</dt>
                  <dd>
                    <ul className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <li key={tech} className="chip">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>
          </Reveal>
        </div>
      </header>

      <Reveal className="shell" y={40}>
        <div className="relative aspect-[16/10] overflow-hidden border border-line md:aspect-[21/9]">
          <Parallax className="absolute -inset-y-10 inset-x-0" amount={80}>
            <ProjectCover project={project} sizes="100vw" priority />
          </Parallax>
        </div>
      </Reveal>

      {sections.length > 0 ? (
        <div className="shell section grid gap-12 md:grid-cols-12">
          <aside className="hidden md:col-span-3 md:block">
            <nav aria-label="Case study sections" className="sticky top-24">
              <p className="eyebrow mb-3 !text-[0.68rem]">Contents</p>
              <ol className="text-[0.9rem]">
                {sections.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${anchor(section.heading, i)}`}
                      className="flex gap-3 border-l border-line py-1 pl-3 text-ink-dim transition-colors hover:border-signal hover:text-signal"
                    >
                      <span className="pt-0.5 font-mono text-xs text-signal">{pad2(i + 1)}</span>
                      {section.heading || `Section ${i + 1}`}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="space-y-14 md:col-span-8 md:col-start-5 md:space-y-16">
            {sections.map((section, i) => (
              <Reveal as="section" key={section.id}>
                <div id={anchor(section.heading, i)} className="scroll-mt-24">
                  <p className="eyebrow mb-2">{pad2(i + 1)}</p>
                  {section.heading ? <h2 className="headline">{section.heading}</h2> : null}
                  {section.html ? (
                    // HTML is sanitised on write (lib/sanitize.ts) before it reaches the database.
                    <div className="prose-site mt-5" dangerouslySetInnerHTML={{ __html: section.html }} />
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-16" />
      )}

      {project.gallery.length > 0 ? (
        <section aria-label="Gallery" className="shell pb-16 md:pb-20">
          <p className="eyebrow mb-5">Gallery</p>
          <Stagger className="grid gap-4 md:grid-cols-2">
            {project.gallery.map((image, i) => (
              <StaggerItem
                key={image.url + i}
                className={i % 3 === 0 ? "md:col-span-2" : undefined}
              >
                <figure className="group relative overflow-hidden border border-line bg-surface">
                  <div className={i % 3 === 0 ? "relative aspect-[16/9]" : "relative aspect-[4/3]"}>
                    <Image
                      src={image.url}
                      alt={image.alt || `${project.title} — image ${i + 1}`}
                      fill
                      sizes={i % 3 === 0 ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                      className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.02]"
                    />
                  </div>
                  {image.alt ? <figcaption className="border-t border-line px-4 py-3 text-[0.95rem] text-ink-dim">{image.alt}</figcaption> : null}
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}

      {next ? (
        <Link
          href={`/work/${next.slug}`}
          data-cursor="Next"
          className="group relative block overflow-hidden border-t border-line"
        >
          <div className="shell relative flex items-end justify-between gap-6 py-12 transition-colors group-hover:bg-[var(--signal-tint)] md:py-16">
            <div>
              <p className="eyebrow mb-3">Next project</p>
              <p className="display transition-colors group-hover:text-signal">
                {next.title}
              </p>
            </div>
            <span className="flex size-12 shrink-0 items-center justify-center border border-ink transition-colors group-hover:border-signal group-hover:bg-signal group-hover:text-background">
              <ArrowUpRight className="size-5" aria-hidden />
            </span>
          </div>
        </Link>
      ) : null}
    </article>
  );
}
