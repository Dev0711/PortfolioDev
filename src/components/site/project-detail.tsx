import Image from "next/image";
import Link from "next/link";
import { ProjectCover } from "@/components/site/project-cover";
import type { Profile, Project } from "@/lib/types";
import { isExternal, pad2, slugify } from "@/lib/utils";

/**
 * Case-study view in the reference "lesson page" layout: sticky sidebar with
 * contents, crumbs, pixel title, motto, meta strip, § sections, byline and
 * pager. Shared by /work/[slug] and the admin draft preview.
 */
export function ProjectDetail({
  project,
  next,
  previous,
  author,
}: {
  project: Project;
  next?: Project | null;
  previous?: Project | null;
  author?: Profile;
}) {
  const sections = project.sections.filter((section) => section.heading || section.html);
  const anchor = (heading: string, i: number) => `${slugify(heading) || "section"}-${i + 1}`;

  const meta = [
    { label: "Role", value: project.role },
    { label: "Timeframe", value: project.timeframe },
    { label: "Category", value: project.category },
    { label: "Stack", value: project.technologies.length ? `${project.technologies.length} technologies` : "" },
  ].filter((item) => item.value);

  return (
    <div className="lesson-layout shell">
      <aside className="lesson-aside" aria-label="Case study navigation">
        <div className="aside-block">
          <p className="aside-title">Work</p>
          <Link href="/work" className="aside-phase">
            <span className="aside-phase-name">← All projects</span>
          </Link>
        </div>
        {sections.length > 0 ? (
          <nav className="aside-block" aria-label="On this page">
            <p className="aside-title">On this page</p>
            <ul className="aside-toc">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a href={`#${anchor(section.heading, i)}`}>
                    <span className="mr-2 font-mono text-[0.7rem] text-signal">{pad2(i + 1)}</span>
                    {section.heading || `Section ${i + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {project.live_url || project.github_url ? (
          <div className="aside-block">
            <p className="aside-title">Links</p>
            <ul className="aside-files">
              {project.live_url ? (
                <li>
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                    live demo ↗
                  </a>
                </li>
              ) : null}
              {project.github_url ? (
                <li>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    source code ↗
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </aside>

      <article className="lesson">
        <nav className="lesson-crumbs" aria-label="Breadcrumb">
          <Link href="/work">Work</Link>
          <span aria-hidden>/</span>
          {project.category ? (
            <>
              <span>{project.category}</span>
              <span aria-hidden>/</span>
            </>
          ) : null}
          <span aria-current="page">{project.title}</span>
        </nav>

        <header className="lesson-head">
          <h1 className="lesson-title">{project.title}</h1>
          {project.summary ? <p className="lesson-motto">{project.summary}</p> : null}
          {meta.length > 0 ? (
            <dl className="lesson-meta">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {project.live_url || project.github_url ? (
            <div className="lesson-actions">
              {project.live_url ? (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Live demo ↗
                </a>
              ) : null}
              {project.github_url ? (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn">
                  Source code ↗
                </a>
              ) : null}
            </div>
          ) : null}
        </header>

        <figure className="relative mb-8 aspect-[16/9] overflow-hidden border border-ink shadow-[var(--shadow-hard)]">
          <ProjectCover project={project} sizes="(min-width: 1024px) 780px, 100vw" priority />
        </figure>

        {sections.length > 0 ? (
          <div className="prose-site">
            {sections.map((section, i) => (
              <section key={section.id} id={anchor(section.heading, i)} className="scroll-mt-24">
                {section.heading ? <h2>{section.heading}</h2> : null}
                {section.html ? (
                  // HTML is sanitised on write (lib/sanitize.ts) before it reaches the database.
                  <div dangerouslySetInnerHTML={{ __html: section.html }} />
                ) : null}
              </section>
            ))}
          </div>
        ) : null}

        {project.technologies.length > 0 ? (
          <div className="mt-10 border-t border-line pt-4">
            <p className="aside-title">Built with</p>
            <ul className="iv-row-meta">
              {project.technologies.map((tech) => (
                <li key={tech} className="iv-type">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {project.gallery.length > 0 ? (
          <section aria-label="Gallery" className="mt-10">
            <p className="aside-title">Gallery</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.gallery.map((image, i) => (
                <figure key={image.url + i} className={i % 3 === 0 ? "border border-line bg-surface sm:col-span-2" : "border border-line bg-surface"}>
                  <div className={i % 3 === 0 ? "relative aspect-[16/9]" : "relative aspect-[4/3]"}>
                    <Image
                      src={image.url}
                      alt={image.alt || `${project.title} — image ${i + 1}`}
                      fill
                      sizes={i % 3 === 0 ? "780px" : "(min-width: 640px) 390px, 100vw"}
                      className="object-cover"
                    />
                  </div>
                  {image.alt ? (
                    <figcaption className="border-t border-line px-3 py-2 font-mono text-[0.72rem] text-ink-faint">
                      FIG_{pad2(i + 1)} · {image.alt}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {author?.name ? (
          <div className="byline">
            {author.avatar_url ? (
              <Image src={author.avatar_url} alt="" width={56} height={56} />
            ) : (
              <span aria-hidden className="flex size-14 items-center justify-center border border-ink bg-signal font-mono text-lg text-background">
                {author.name.slice(0, 1)}
              </span>
            )}
            <div>
              <p className="label">Written by</p>
              <p className="byline-name">{author.name}</p>
              {author.title ? <p className="byline-role">{author.title}</p> : null}
            </div>
            {author.socials.length > 0 ? (
              <div className="byline-socials">
                {author.socials.map((social) => (
                  <a
                    key={social.url}
                    href={social.url}
                    className="social-link"
                    {...(isExternal(social.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <span className="social-handle">{social.label}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {previous || next ? (
          <nav className="pager" aria-label="More projects">
            {previous ? (
              <Link href={`/work/${previous.slug}`} className="pager-card">
                <span className="label">← Previous</span>
                <span className="pager-title">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/work/${next.slug}`} className="pager-card pager-next">
                <span className="label">Next →</span>
                <span className="pager-title">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </article>
    </div>
  );
}
