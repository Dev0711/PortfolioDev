"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { env, isSupabaseConfigured } from "@/lib/env";
import { contactSchema } from "@/lib/schemas";
import { createPublicClient } from "@/lib/supabase/public";
import type { ActionResult } from "@/lib/types";

/** A real person needs more than this long to fill in the form. */
const MIN_FILL_TIME_MS = 2500;

/**
 * Contact form submission.
 *
 * Layers of protection:
 *   1. Zod validation on the server (the client schema is not trusted)
 *   2. honeypot field + minimum fill time → bots get a silent "success"
 *   3. per-sender and global rate limits inside the database function
 *   4. the table itself is not writable by the anon role (RLS, no policy)
 */
export async function submitContact(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, subject, message, company_website, elapsed_ms } = parsed.data;

  // Bots: pretend it worked so they do not adapt, but store nothing.
  if (company_website || elapsed_ms < MIN_FILL_TIME_MS) {
    return { ok: true };
  }

  if (!isSupabaseConfigured) {
    return {
      ok: false,
      error: "The contact form is not connected to a database yet. Please use the email address instead.",
    };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  const salt = process.env.CONTACT_HASH_SALT || env.supabaseUrl;
  const ipHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex");

  const { data, error } = await createPublicClient().rpc("submit_contact_message", {
    p_name: name,
    p_email: email,
    p_subject: subject,
    p_message: message,
    p_ip_hash: ipHash,
  });

  if (error) {
    console.error(`[contact] ${error.message}`);
    return { ok: false, error: "Something went wrong while sending your message. Please try again or use email." };
  }
  if (data === "rate_limited") {
    return { ok: false, error: "Too many messages in a short time. Please try again later or use email." };
  }
  if (data !== "ok") {
    return { ok: false, error: "Your message could not be accepted. Please check the fields and try again." };
  }

  return { ok: true };
}
