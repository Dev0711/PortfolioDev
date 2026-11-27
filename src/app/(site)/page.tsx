import type { ReactNode } from "react";
import { Hero } from "@/components/site/home/hero";
import {
  Capabilities,
  ContactCta,
  ExperienceSection,
  FeaturedWork,
  Principles,
  StackMarquee,
} from "@/components/site/home/sections";
import {
  getExperience,
  getProfile,
  getProjects,
  getSettings,
  getSkillCategories,
} from "@/lib/content/queries";
import type { HomeSection } from "@/lib/types";
import { pad2 } from "@/lib/utils";

export default async function HomePage() {
  const [profile, settings, projects, categories, experience] = await Promise.all([
    getProfile(),
    getSettings(),
    getProjects(),
    getSkillCategories(),
    getExperience(),
  ]);

  const featured = projects.filter((project) => project.featured);
  const showcase = (featured.length > 0 ? featured : projects).slice(0, 5);

  // Sections render in the order and visibility chosen in Admin → Settings.
  let counter = 0;
  const render = (config: HomeSection): ReactNode => {
    if (config.key === "stack") return <StackMarquee key={config.key} categories={categories} eyebrow={config.eyebrow} />;
    const index = pad2(++counter);
    switch (config.key) {
      case "featured":
        return <FeaturedWork key={config.key} config={config} index={index} projects={showcase} />;
      case "principles":
        return <Principles key={config.key} config={config} index={index} items={profile.philosophy} />;
      case "capabilities":
        return <Capabilities key={config.key} config={config} index={index} categories={categories} />;
      case "experience":
        return <ExperienceSection key={config.key} config={config} index={index} items={experience.slice(0, 4)} />;
      case "contact":
        return <ContactCta key={config.key} config={config} index={index} profile={profile} />;
    }
  };

  return (
    <>
      <Hero profile={profile} settings={settings} />
      {settings.home_sections.filter((section) => section.visible).map(render)}
    </>
  );
}
