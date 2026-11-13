import { ArrowLeft, ArrowUpRight, Code2, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Magnetic } from "@/components/motion/magnetic";
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
      <header className="shell pb-12 pt-32 md:pb-16 md:pt-44">
        <Reveal y={12}>
          <Link href="/work" className="label link-line inline-flex items-center gap-2 !text-ink-dim hover:!text-ink">
            <ArrowLeft className="size-3" aria-hidden />
            All work
          </Link>
        </Reveal>

        <RevealText as="h1" immediate delay={0.1} text={project.title} className="display mt-10 max-w-[20ch]" />

        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <Reveal delay={0.35} className="md:col-span-6">
            {project.summary ? <p className="lede !text-ink">{project.summary}</p> : null}
            {project.live_url || project.github_url ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {project.live_url ? (
                  <Magnetic>
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      <Globe className="size-4" aria-hidden />
                      Live demo
                      <ArrowUpRight className="arrow size-4" aria-hidden />
                    </a>
                  </Magnetic>
                ) : null}
                {project.github_url ? (
                  <Magnetic>
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                      <Code2 className="size-4" aria-hidden />
                      Source code
                    </a>
                  </Magnetic>
                ) : null}
              </div>
            ) : null}
          </Reveal>

          <Reveal delay={0.45} className="md:col-span-5 md:col-start-8">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-6">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="label mb-2">{item.label}</dt>
                  <dd className="text-[0.9375rem]">{item.value}</dd>
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
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line md:aspect-[21/9]">
          <Parallax className="absolute -inset-y-10 inset-x-0" amount={80}>
            <ProjectCover project={project} sizes="100vw" priority />
          </Parallax>
        </div>
      </Reveal>

      {sections.length > 0 ? (
        <div className="shell section grid gap-12 md:grid-cols-12">
          <aside className="hidden md:col-span-3 md:block">
            <nav aria-label="Case study sections" className="sticky top-28">
              <p className="label mb-5">Contents</p>
              <ol className="space-y-3 text-sm">
                {sections.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${anchor(section.heading, i)}`}
                      className="link-line flex gap-3 text-ink-dim transition-colors hover:text-ink"
                    >
                      <span className="font-mono text-xs text-ink-faint">{pad2(i + 1)}</span>
                      {section.heading || `Section ${i + 1}`}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="space-y-20 md:col-span-8 md:col-start-5 md:space-y-28">
            {sections.map((section, i) => (
              <Reveal as="section" key={section.id}>
                <div id={anchor(section.heading, i)} className="scroll-mt-28">
                  <p className="label mb-5 text-signal">{pad2(i + 1)}</p>
                  {section.heading ? <h2 className="headline !text-[clamp(1.75rem,3.2vw,3rem)]">{section.heading}</h2> : null}
                  {section.html ? (
                    // HTML is sanitised on write (lib/sanitize.ts) before it reaches the database.
                    <div className="prose-site mt-8" dangerouslySetInnerHTML={{ __html: section.html }} />
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-24" />
      )}

      {project.gallery.length > 0 ? (
        <section aria-label="Gallery" className="shell pb-24 md:pb-36">
          <p className="label mb-8">Gallery</p>
          <Stagger className="grid gap-5 md:grid-cols-2 md:gap-6">
            {project.gallery.map((image, i) => (
              <StaggerItem
                key={image.url + i}
                className={i % 3 === 0 ? "md:col-span-2" : undefined}
              >
                <figure className="group relative overflow-hidden rounded-2xl border border-line bg-surface">
                  <div className={i % 3 === 0 ? "relative aspect-[16/9]" : "relative aspect-[4/3]"}>
                    <Image
                      src={image.url}
                      alt={image.alt || `${project.title} — image ${i + 1}`}
                      fill
                      sizes={i % 3 === 0 ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                      className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.03]"
                    />
                  </div>
                  {image.alt ? <figcaption className="label px-5 py-4 normal-case tracking-normal">{image.alt}</figcaption> : null}
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
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-30">
            <ProjectCover project={next} sizes="100vw" />
          </div>
          <div className="shell relative flex flex-col gap-6 py-20 md:flex-row md:items-end md:justify-between md:py-28">
            <div>
              <p className="label mb-6">Next project</p>
              <p className="display !text-[clamp(2.25rem,6vw,6rem)] transition-transform duration-700 ease-out-expo group-hover:translate-x-3">
                {next.title}
              </p>
            </div>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-line-strong transition-colors duration-500 group-hover:border-signal group-hover:bg-signal group-hover:text-background">
              <ArrowUpRight className="size-6 transition-transform duration-500 ease-out-expo group-hover:rotate-45" aria-hidden />
            </span>
          </div>
        </Link>
      ) : null}
    </article>
  );
}
