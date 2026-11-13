import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content/queries";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();

  return [
    { url: `${env.siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${env.siteUrl}/work`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${env.siteUrl}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${env.siteUrl}/contact`, changeFrequency: "yearly", priority: 0.6 },
    ...projects.map((project) => ({
      url: `${env.siteUrl}/work/${project.slug}`,
      lastModified: project.updated_at || undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
