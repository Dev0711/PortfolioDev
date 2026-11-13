import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProjectDetail } from "@/components/site/project-detail";
import { getProjectBySlug, getProjects } from "@/lib/content/queries";
import { env } from "@/lib/env";

type Props = PageProps<"/work/[slug]">;

/** Prerender every published project; new slugs are rendered on first visit and cached. */
export async function generateStaticParams() {
  const projects = await getProjects();
  // Cache Components needs at least one entry to validate the route at build time.
  return projects.length > 0 ? projects.map((project) => ({ slug: project.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found", robots: { index: false } };

  return {
    title: project.title,
    description: project.summary || undefined,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary || undefined,
      images: project.cover_url ? [{ url: project.cover_url }] : undefined,
    },
  };
}

async function ProjectContent({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const [project, projects] = await Promise.all([getProjectBySlug(slug), getProjects()]);
  if (!project) notFound();

  const position = projects.findIndex((item) => item.id === project.id);
  const next = projects.length > 1 ? projects[(position + 1) % projects.length] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `${env.siteUrl}/work/${project.slug}`,
    keywords: project.technologies.join(", "),
    datePublished: project.published_at ?? undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProjectDetail project={project} next={next} />
    </>
  );
}

export default function ProjectPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}
