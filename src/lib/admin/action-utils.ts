import "server-only";
import type { ZodError } from "zod";
import type { ActionResult } from "@/lib/types";

export function invalid(error: ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  const first = error.issues[0];
  const where = first?.path.length ? `${first.path.join(" › ")}: ` : "";
  return { ok: false, error: `${where}${first?.message ?? "Invalid input"}`, fieldErrors };
}

type PostgrestLikeError = { message: string; code?: string };

export function dbError(error: PostgrestLikeError, scope: string): ActionResult<never> {
  console.error(`[admin] ${scope}: ${error.code ?? ""} ${error.message}`);
  if (error.code === "23505") {
    return { ok: false, error: "That value is already in use.", fieldErrors: { slug: ["This slug is already taken"] } };
  }
  if (error.code === "42501") {
    return { ok: false, error: "You do not have permission to do that." };
  }
  return { ok: false, error: "The change could not be saved. Please try again." };
}

export const idSchema = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const BAD_ID: ActionResult<never> = { ok: false, error: "Invalid identifier." };
