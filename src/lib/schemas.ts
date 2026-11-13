import { z } from "zod";
import { HOME_SECTION_KEYS } from "@/lib/types";

/** Zod schemas — the single source of validation for forms and server actions. */

const trimmed = (max: number) => z.string().trim().max(max);
const required = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required`).max(max);

/** Accepts http(s) URLs, or an empty value which becomes null. */
const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Enter a full URL starting with https://")
  .transform((v) => (v === "" ? null : v))
  .nullable();

/** Internal path (/work), anchor, mailto or http(s) URL. Blocks javascript: etc. */
const href = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^(\/|#|mailto:|https?:\/\/)/i.test(v), "Use a path like /work or a full URL");

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex colour, e.g. #FF6A3D");

const linkItem = z.object({ label: required(60, "Label"), url: href.min(1, "URL is required") });
const textBlock = z.object({ title: required(120, "Title"), body: trimmed(1200) });

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only");

// ── Contact ────────────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: required(120, "Name"),
  email: z.string().trim().email("Enter a valid email address").max(254),
  subject: trimmed(200),
  message: z.string().trim().min(10, "Please write at least a couple of sentences").max(5000),
  /** Honeypot — must stay empty. */
  company_website: z.string().max(0).optional().or(z.literal("")),
  /** Milliseconds between render and submit, measured on the client. */
  elapsed_ms: z.coerce.number().int().min(0),
});
export type ContactInput = z.infer<typeof contactSchema>;

// ── Auth ───────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ── Projects ───────────────────────────────────────────────────────────────
export const projectSectionSchema = z.object({
  id: z.string().min(1).max(64),
  heading: trimmed(160),
  html: z.string().max(60_000),
});

export const projectSchema = z.object({
  title: required(160, "Title"),
  slug: slugSchema,
  summary: trimmed(600),
  category: trimmed(60),
  role: trimmed(120),
  timeframe: trimmed(60),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  cover_url: optionalUrl,
  cover_video_url: optionalUrl,
  gallery: z.array(z.object({ url: z.string().url(), alt: trimmed(200) })).max(24),
  technologies: z.array(required(40)).max(30),
  github_url: optionalUrl,
  live_url: optionalUrl,
  sections: z.array(projectSectionSchema).max(30),
});
export type ProjectInput = z.infer<typeof projectSchema>;

// ── Experience / credentials ───────────────────────────────────────────────
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");

export const experienceSchema = z
  .object({
    company: required(120, "Company"),
    role: required(120, "Role"),
    location: trimmed(120),
    start_date: isoDate,
    end_date: isoDate.nullable().or(z.literal("").transform(() => null)),
    summary: trimmed(1500),
    highlights: z.array(required(400)).max(12),
    technologies: z.array(required(40)).max(30),
    company_url: optionalUrl,
    published: z.boolean(),
  })
  .refine((v) => !v.end_date || v.end_date >= v.start_date, {
    path: ["end_date"],
    message: "End date must be after the start date",
  });
export type ExperienceInput = z.infer<typeof experienceSchema>;

const optionalYear = z
  .union([z.coerce.number().int().min(1950).max(2100), z.literal("").transform(() => null), z.null()])
  .nullable();

export const educationSchema = z.object({
  institution: required(160, "Institution"),
  degree: trimmed(160),
  field: trimmed(160),
  start_year: optionalYear,
  end_year: optionalYear,
  notes: trimmed(800),
});
export type EducationInput = z.infer<typeof educationSchema>;

export const certificationSchema = z.object({
  name: required(200, "Name"),
  issuer: trimmed(160),
  year: optionalYear,
  url: optionalUrl,
});
export type CertificationInput = z.infer<typeof certificationSchema>;

// ── Skills ─────────────────────────────────────────────────────────────────
export const skillCategorySchema = z.object({
  name: required(80, "Name"),
  description: trimmed(300),
});
export const skillSchema = z.object({
  category_id: z.string().uuid(),
  name: required(60, "Name"),
  icon: required(40, "Icon"),
});

// ── Profile ────────────────────────────────────────────────────────────────
export const profileSchema = z.object({
  name: required(120, "Name"),
  title: required(160, "Title"),
  hero_headline: required(240, "Headline"),
  hero_description: trimmed(600),
  availability: trimmed(160),
  location: trimmed(120),
  timezone: required(60, "Timezone"),
  about_intro: trimmed(800),
  about_body: z.string().max(60_000),
  journey: z.string().max(60_000),
  interests: z.array(textBlock).max(12),
  philosophy: z.array(textBlock).max(12),
  contact_intro: trimmed(800),
  email: z.string().trim().email("Enter a valid email address").or(z.literal("")),
  socials: z.array(linkItem).max(10),
  avatar_url: optionalUrl,
  resume_url: optionalUrl,
});
export type ProfileInput = z.infer<typeof profileSchema>;

// ── Settings ───────────────────────────────────────────────────────────────
export const settingsSchema = z.object({
  nav: z
    .array(z.object({ label: required(40, "Label"), href: href.min(1, "Link is required"), visible: z.boolean() }))
    .max(8),
  home_sections: z
    .array(
      z.object({
        key: z.enum(HOME_SECTION_KEYS),
        visible: z.boolean(),
        eyebrow: trimmed(80),
        heading: trimmed(240),
        body: trimmed(800),
        cta_label: trimmed(60),
        cta_href: href,
      }),
    )
    .max(HOME_SECTION_KEYS.length)
    .refine((list) => new Set(list.map((s) => s.key)).size === list.length, "Duplicate section"),
  hero_cta: z.object({
    primary_label: trimmed(60),
    primary_href: href,
    secondary_label: trimmed(60),
    secondary_href: href,
  }),
  hero_media_url: optionalUrl,
  hero_media_type: z.enum(["image", "video"]).nullable(),
  accent: hexColor,
  accent_alt: hexColor,
  footer: z.object({
    headline: trimmed(200),
    note: trimmed(300),
    links: z.array(linkItem).max(10),
  }),
  seo_title: trimmed(120),
  seo_description: trimmed(300),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const reorderSchema = z.array(z.string().uuid()).max(500);

// ── Media ──────────────────────────────────────────────────────────────────
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];
export const VIDEO_TYPES = ["video/mp4", "video/webm"];
export const DOCUMENT_TYPES = ["application/pdf"];
export const ALLOWED_MEDIA_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES, ...DOCUMENT_TYPES];

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export function validateMediaFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
    return "Unsupported file type. Use JPG, PNG, WebP, AVIF, GIF, SVG, MP4, WebM or PDF.";
  }
  const limit = IMAGE_TYPES.includes(file.type)
    ? MAX_IMAGE_BYTES
    : VIDEO_TYPES.includes(file.type)
      ? MAX_VIDEO_BYTES
      : MAX_DOCUMENT_BYTES;
  if (file.size > limit) {
    return `File is too large. The limit for this type is ${Math.round(limit / 1024 / 1024)} MB.`;
  }
  if (file.size === 0) return "File is empty.";
  return null;
}

export const mediaRecordSchema = z.object({
  path: z.string().min(1).max(400).regex(/^[a-z0-9/_.-]+$/i),
  name: required(200, "Name"),
  mime_type: z.enum(ALLOWED_MEDIA_TYPES as [string, ...string[]]),
  size_bytes: z.number().int().positive(),
});
