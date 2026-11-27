import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ProjectExplorer } from "@/components/site/project-explorer";
import { getProjects, getSettings } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects and case studies.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  const intro = settings.home_sections.find((section) => section.key === "featured");

  return (
    <>
      <PageHero
        index="01"
        eyebrow="Work"
        heading={intro?.heading || "Selected work."}
        body={intro?.body}
        stats={[
          { label: "Projects", value: projects.length },
          { label: "Areas", value: new Set(projects.map((p) => p.category).filter(Boolean)).size },
          { label: "Technologies", value: new Set(projects.flatMap((p) => p.technologies)).size },
        ]}
      />
      <section className="shell py-10 md:py-12" aria-label="Projects">
        {projects.length > 0 ? (
          <ProjectExplorer projects={projects} />
        ) : (
          <p className="lede">No projects have been published yet.</p>
        )}
      </section>
    </>
  );
}
