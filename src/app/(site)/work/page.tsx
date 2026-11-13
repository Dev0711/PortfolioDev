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
        seed={31}
      />
      <section className="shell py-14 md:py-20" aria-label="Projects">
        {projects.length > 0 ? (
          <ProjectExplorer projects={projects} />
        ) : (
          <p className="lede">No projects have been published yet.</p>
        )}
      </section>
    </>
  );
}
