"use server";

import { BAD_ID, dbError, idSchema, invalid } from "@/lib/admin/action-utils";
import { publish } from "@/lib/admin/revalidate";
import { requireAdmin } from "@/lib/auth";
import type { ContentTag } from "@/lib/content/tags";
import {
  certificationSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  reorderSchema,
  settingsSchema,
  skillCategorySchema,
  skillSchema,
} from "@/lib/schemas";
import { sanitizeRichText } from "@/lib/sanitize";
import type { ActionResult } from "@/lib/types";

/**
 * Content mutations. Every action:
 *   1. re-checks the session and admin row on the server (requireAdmin)
 *   2. validates the payload with Zod
 *   3. sanitises rich text
 *   4. writes through the user's own session, so RLS is the final gate
 *   5. expires the affected public cache tags
 */

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

async function nextSortOrder(supabase: Supabase, table: string) {
  const { data } = await supabase
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data?.sort_order as number | undefined) ?? 0) + 1;
}

// ── Projects ────────────────────────────────────────────────────────────────

export async function saveProject(id: string | null, input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  const { supabase } = await requireAdmin();
  if (id !== null && !idSchema(id)) return BAD_ID;

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const values = {
    ...parsed.data,
    sections: parsed.data.sections.map((section) => ({ ...section, html: sanitizeRichText(section.html) })),
  };

  if (id) {
    const { data, error } = await supabase.from("projects").update(values).eq("id", id).select("id, slug").maybeSingle();
    if (error) return dbError(error, "project update");
    if (!data) return { ok: false, error: "Project not found." };
    publish("projects");
    return { ok: true, data, message: values.status === "published" ? "Published" : "Draft saved" };
  }

  const sort_order = await nextSortOrder(supabase, "projects");
  const { data, error } = await supabase.from("projects").insert({ ...values, sort_order }).select("id, slug").single();
  if (error) return dbError(error, "project insert");
  publish("projects");
  return { ok: true, data, message: "Project created" };
}

export async function setProjectStatus(id: string, status: "draft" | "published"): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id) || (status !== "draft" && status !== "published")) return BAD_ID;
  const { error } = await supabase.from("projects").update({ status }).eq("id", id);
  if (error) return dbError(error, "project status");
  publish("projects");
  return { ok: true, message: status === "published" ? "Published" : "Moved to drafts" };
}

export async function setProjectFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id) || typeof featured !== "boolean") return BAD_ID;
  const { error } = await supabase.from("projects").update({ featured }).eq("id", id);
  if (error) return dbError(error, "project featured");
  publish("projects");
  return { ok: true, message: featured ? "Marked as featured" : "Removed from featured" };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id)) return BAD_ID;
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return dbError(error, "project delete");
  publish("projects");
  return { ok: true, message: "Project deleted" };
}

// ── Reordering (shared) ─────────────────────────────────────────────────────

const REORDERABLE: Record<string, ContentTag> = {
  projects: "projects",
  experience: "experience",
  education: "credentials",
  certifications: "credentials",
  skill_categories: "skills",
  skills: "skills",
};

export async function reorder(table: string, ids: unknown): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const tag = REORDERABLE[table];
  if (!tag) return { ok: false, error: "This list cannot be reordered." };

  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return invalid(parsed.error);

  const results = await Promise.all(
    parsed.data.map((id, index) => supabase.from(table).update({ sort_order: index + 1 }).eq("id", id)),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) return dbError(failed.error, `${table} reorder`);

  publish(tag);
  return { ok: true, message: "Order updated" };
}

// ── Experience ──────────────────────────────────────────────────────────────

export async function saveExperience(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  if (id !== null && !idSchema(id)) return BAD_ID;
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const query = id
    ? supabase.from("experience").update(parsed.data).eq("id", id)
    : supabase.from("experience").insert({ ...parsed.data, sort_order: await nextSortOrder(supabase, "experience") });
  const { data, error } = await query.select("id").maybeSingle();
  if (error) return dbError(error, "experience save");
  if (!data) return { ok: false, error: "Entry not found." };
  publish("experience");
  return { ok: true, data, message: "Experience saved" };
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id)) return BAD_ID;
  const { error } = await supabase.from("experience").delete().eq("id", id);
  if (error) return dbError(error, "experience delete");
  publish("experience");
  return { ok: true, message: "Experience deleted" };
}

// ── Education & certifications ──────────────────────────────────────────────

export async function saveEducation(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  if (id !== null && !idSchema(id)) return BAD_ID;
  const parsed = educationSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const query = id
    ? supabase.from("education").update(parsed.data).eq("id", id)
    : supabase.from("education").insert({ ...parsed.data, sort_order: await nextSortOrder(supabase, "education") });
  const { data, error } = await query.select("id").maybeSingle();
  if (error) return dbError(error, "education save");
  if (!data) return { ok: false, error: "Entry not found." };
  publish("credentials");
  return { ok: true, data, message: "Education saved" };
}

export async function saveCertification(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  if (id !== null && !idSchema(id)) return BAD_ID;
  const parsed = certificationSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const query = id
    ? supabase.from("certifications").update(parsed.data).eq("id", id)
    : supabase
        .from("certifications")
        .insert({ ...parsed.data, sort_order: await nextSortOrder(supabase, "certifications") });
  const { data, error } = await query.select("id").maybeSingle();
  if (error) return dbError(error, "certification save");
  if (!data) return { ok: false, error: "Entry not found." };
  publish("credentials");
  return { ok: true, data, message: "Certification saved" };
}

export async function deleteCredential(kind: "education" | "certifications", id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id) || (kind !== "education" && kind !== "certifications")) return BAD_ID;
  const { error } = await supabase.from(kind).delete().eq("id", id);
  if (error) return dbError(error, `${kind} delete`);
  publish("credentials");
  return { ok: true, message: "Deleted" };
}

// ── Skills ──────────────────────────────────────────────────────────────────

export async function saveSkillCategory(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  if (id !== null && !idSchema(id)) return BAD_ID;
  const parsed = skillCategorySchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const query = id
    ? supabase.from("skill_categories").update(parsed.data).eq("id", id)
    : supabase
        .from("skill_categories")
        .insert({ ...parsed.data, sort_order: await nextSortOrder(supabase, "skill_categories") });
  const { data, error } = await query.select("id").maybeSingle();
  if (error) return dbError(error, "skill category save");
  if (!data) return { ok: false, error: "Category not found." };
  publish("skills");
  return { ok: true, data, message: "Category saved" };
}

export async function deleteSkillCategory(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id)) return BAD_ID;
  const { error } = await supabase.from("skill_categories").delete().eq("id", id);
  if (error) return dbError(error, "skill category delete");
  publish("skills");
  return { ok: true, message: "Category deleted" };
}

export async function saveSkill(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  if (id !== null && !idSchema(id)) return BAD_ID;
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const query = id
    ? supabase.from("skills").update(parsed.data).eq("id", id)
    : supabase.from("skills").insert({ ...parsed.data, sort_order: await nextSortOrder(supabase, "skills") });
  const { data, error } = await query.select("id").maybeSingle();
  if (error) return dbError(error, "skill save");
  if (!data) return { ok: false, error: "Skill not found." };
  publish("skills");
  return { ok: true, data, message: "Skill saved" };
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id)) return BAD_ID;
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) return dbError(error, "skill delete");
  publish("skills");
  return { ok: true, message: "Skill deleted" };
}

// ── Profile & settings (singletons) ─────────────────────────────────────────

export async function saveProfile(input: unknown): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const values = {
    ...parsed.data,
    about_body: sanitizeRichText(parsed.data.about_body),
    journey: sanitizeRichText(parsed.data.journey),
  };
  const { error } = await supabase.from("profile").upsert({ id: 1, ...values });
  if (error) return dbError(error, "profile save");
  publish("profile");
  return { ok: true, message: "Profile saved" };
}

export async function saveSettings(input: unknown): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const values = {
    ...parsed.data,
    hero_media_type: parsed.data.hero_media_url ? parsed.data.hero_media_type : null,
  };
  const { error } = await supabase.from("site_settings").upsert({ id: 1, ...values });
  if (error) return dbError(error, "settings save");
  publish("settings");
  return { ok: true, message: "Settings saved" };
}

// ── Contact messages ────────────────────────────────────────────────────────

export async function setMessageRead(id: string, is_read: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id) || typeof is_read !== "boolean") return BAD_ID;
  const { error } = await supabase.from("contact_messages").update({ is_read }).eq("id", id);
  if (error) return dbError(error, "message update");
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id)) return BAD_ID;
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return dbError(error, "message delete");
  return { ok: true, message: "Message deleted" };
}
