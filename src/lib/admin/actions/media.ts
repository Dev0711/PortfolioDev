"use server";

import { BAD_ID, dbError, idSchema, invalid } from "@/lib/admin/action-utils";
import { requireAdmin } from "@/lib/auth";
import { MEDIA_BUCKET } from "@/lib/env";
import { mediaRecordSchema, validateMediaFile } from "@/lib/schemas";
import type { ActionResult, MediaAsset } from "@/lib/types";

/**
 * Media library actions. Files are uploaded from the browser straight to
 * Supabase Storage (the storage policies only allow administrators), then
 * registered here so the library has searchable metadata.
 */

export async function listMedia(): Promise<ActionResult<MediaAsset[]>> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
  if (error) return dbError(error, "media list");
  return { ok: true, data: (data ?? []) as MediaAsset[] };
}

export async function registerMedia(input: unknown): Promise<ActionResult<MediaAsset>> {
  const { supabase } = await requireAdmin();
  const parsed = mediaRecordSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { path, name, mime_type, size_bytes } = parsed.data;
  const problem = validateMediaFile({ type: mime_type, size: size_bytes });
  if (problem) return { ok: false, error: problem };

  // Confirm the object really exists in the bucket before recording it.
  const folder = path.split("/").slice(0, -1).join("/");
  const file = path.split("/").pop() ?? "";
  const { data: found, error: listError } = await supabase.storage.from(MEDIA_BUCKET).list(folder, { search: file });
  if (listError || !found?.some((object) => object.name === file)) {
    return { ok: false, error: "The uploaded file could not be found in storage." };
  }

  const url = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  const { data, error } = await supabase
    .from("media")
    .upsert({ path, url, name, mime_type, size_bytes }, { onConflict: "path" })
    .select("*")
    .single();
  if (error) return dbError(error, "media register");
  return { ok: true, data: data as MediaAsset, message: "Uploaded" };
}

export async function updateMediaAlt(id: string, alt: unknown): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id) || typeof alt !== "string" || alt.length > 300) return BAD_ID;
  const { error } = await supabase.from("media").update({ alt: alt.trim() }).eq("id", id);
  if (error) return dbError(error, "media alt");
  return { ok: true, message: "Description saved" };
}

/** Where is this URL referenced? Used to stop in-use assets being deleted. */
async function findUsage(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], url: string) {
  const [projects, profile, settings] = await Promise.all([
    supabase.from("projects").select("title, cover_url, cover_video_url, gallery, sections"),
    supabase.from("profile").select("avatar_url, resume_url, about_body, journey").eq("id", 1).maybeSingle(),
    supabase.from("site_settings").select("hero_media_url").eq("id", 1).maybeSingle(),
  ]);

  const usage: string[] = [];
  for (const project of projects.data ?? []) {
    if (JSON.stringify(project).includes(url)) usage.push(`Project: ${project.title}`);
  }
  if (profile.data && JSON.stringify(profile.data).includes(url)) usage.push("Profile");
  if (settings.data?.hero_media_url === url) usage.push("Settings: hero background");
  return usage;
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id)) return BAD_ID;

  const { data: asset, error: readError } = await supabase.from("media").select("*").eq("id", id).maybeSingle();
  if (readError) return dbError(readError, "media read");
  if (!asset) return { ok: false, error: "Asset not found." };

  const usage = await findUsage(supabase, asset.url as string);
  if (usage.length > 0) {
    return { ok: false, error: `This file is still in use (${usage.join(", ")}). Remove it there first.` };
  }

  const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([asset.path as string]);
  if (storageError) {
    console.error(`[admin] media storage delete: ${storageError.message}`);
    return { ok: false, error: "The file could not be removed from storage." };
  }

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return dbError(error, "media delete");
  return { ok: true, message: "Asset deleted" };
}

/** After a file is replaced in place (same path, same URL), refresh its metadata. */
export async function touchMedia(id: string, size_bytes: unknown, name: unknown): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!idSchema(id) || typeof size_bytes !== "number" || size_bytes <= 0 || typeof name !== "string") return BAD_ID;
  const { error } = await supabase
    .from("media")
    .update({ size_bytes: Math.round(size_bytes), name: name.slice(0, 200) })
    .eq("id", id);
  if (error) return dbError(error, "media touch");
  return { ok: true, message: "File replaced. It can take a few minutes for the CDN to refresh." };
}
