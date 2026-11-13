import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import {
  emptyProfile,
  emptySettings,
  normalizeProfile,
  normalizeProject,
  normalizeSettings,
} from "@/lib/content/normalize";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  seedCertifications,
  seedEducation,
  seedExperience,
  seedProfile,
  seedProjects,
  seedSettings,
  seedSkillCategories,
} from "../../../supabase/seed/content";
import type {
  Certification,
  Education,
  Experience,
  Profile,
  Project,
  SiteSettings,
  Skill,
  SkillCategory,
} from "@/lib/types";

/**
 * Public content queries.
 *
 * Every function is cached with `use cache` and tagged, so pages are served
 * from the static shell and refreshed on demand when the admin publishes
 * (see lib/admin/revalidate.ts). They use the cookie-less anon client, so the
 * cache can never contain draft or private data: RLS filters it out.
 *
 * Without Supabase credentials the starter content from /supabase/seed is
 * returned instead and the site shows a "preview mode" banner.
 */

function report(scope: string, error: { message: string } | null) {
  if (error) console.error(`[content] ${scope}: ${error.message}`);
}

export async function getProfile(): Promise<Profile> {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAGS.profile);
  if (!isSupabaseConfigured) return seedProfile;

  const { data, error } = await createPublicClient().from("profile").select("*").eq("id", 1).maybeSingle();
  report("profile", error);
  return data ? normalizeProfile(data) : emptyProfile;
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAGS.settings);
  if (!isSupabaseConfigured) return seedSettings;

  const { data, error } = await createPublicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
  report("settings", error);
  return data ? normalizeSettings(data) : emptySettings;
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAGS.projects);
  if (!isSupabaseConfigured) return seedProjects;

  const { data, error } = await createPublicClient()
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  report("projects", error);
  return (data ?? []).map(normalizeProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAGS.projects);
  if (!isSupabaseConfigured) return seedProjects.find((p) => p.slug === slug) ?? null;

  const { data, error } = await createPublicClient()
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  report("project", error);
  return data ? normalizeProject(data) : null;
}

export async function getExperience(): Promise<Experience[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAGS.experience);
  if (!isSupabaseConfigured) return seedExperience;

  const { data, error } = await createPublicClient()
    .from("experience")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  report("experience", error);
  return (data ?? []) as Experience[];
}

export async function getEducation(): Promise<Education[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAGS.credentials);
  if (!isSupabaseConfigured) return seedEducation;

  const { data, error } = await createPublicClient().from("education").select("*").order("sort_order");
  report("education", error);
  return (data ?? []) as Education[];
}

export async function getCertifications(): Promise<Certification[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAGS.credentials);
  if (!isSupabaseConfigured) return seedCertifications;

  const { data, error } = await createPublicClient().from("certifications").select("*").order("sort_order");
  report("certifications", error);
  return (data ?? []) as Certification[];
}

export async function getSkillCategories(): Promise<SkillCategory[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAGS.skills);
  if (!isSupabaseConfigured) return seedSkillCategories;

  const client = createPublicClient();
  const [categories, skills] = await Promise.all([
    client.from("skill_categories").select("*").order("sort_order"),
    client.from("skills").select("*").order("sort_order"),
  ]);
  report("skill_categories", categories.error);
  report("skills", skills.error);

  const all = (skills.data ?? []) as Skill[];
  return (categories.data ?? []).map((category) => ({
    ...(category as Omit<SkillCategory, "skills">),
    skills: all.filter((skill) => skill.category_id === category.id),
  }));
}
