import {
  HOME_SECTION_KEYS,
  type HomeSection,
  type Profile,
  type Project,
  type SiteSettings,
} from "@/lib/types";

/** Defensive readers for jsonb columns, so a malformed row cannot break rendering. */

type Row = Record<string, unknown>;

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const strOrNull = (v: unknown) => (typeof v === "string" && v.length > 0 ? v : null);
const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const obj = (v: unknown): Row => (v && typeof v === "object" && !Array.isArray(v) ? (v as Row) : {});
const HEX = /^#[0-9A-Fa-f]{6}$/;

function blankSection(key: HomeSection["key"]): HomeSection {
  return { key, visible: true, eyebrow: "", heading: "", body: "", cta_label: "", cta_href: "" };
}

export const emptyProfile: Profile = {
  name: "",
  title: "",
  hero_headline: "",
  hero_description: "",
  availability: "",
  location: "",
  timezone: "UTC",
  about_intro: "",
  about_body: "",
  journey: "",
  interests: [],
  philosophy: [],
  contact_intro: "",
  email: "",
  socials: [],
  avatar_url: null,
  resume_url: null,
};

export const emptySettings: SiteSettings = {
  nav: [
    { label: "Work", href: "/work", visible: true },
    { label: "About", href: "/about", visible: true },
    { label: "Contact", href: "/contact", visible: true },
  ],
  home_sections: HOME_SECTION_KEYS.map((key) => blankSection(key)),
  hero_cta: { primary_label: "", primary_href: "", secondary_label: "", secondary_href: "" },
  hero_media_url: null,
  hero_media_type: null,
  accent: "#EC4D36",
  accent_alt: "#8B9CFF",
  footer: { headline: "", note: "", links: [] },
  seo_title: "",
  seo_description: "",
};

export function normalizeProfile(row: Row): Profile {
  return {
    name: str(row.name),
    title: str(row.title),
    hero_headline: str(row.hero_headline),
    hero_description: str(row.hero_description),
    availability: str(row.availability),
    location: str(row.location),
    timezone: str(row.timezone, "UTC"),
    about_intro: str(row.about_intro),
    about_body: str(row.about_body),
    journey: str(row.journey),
    interests: list(row.interests),
    philosophy: list(row.philosophy),
    contact_intro: str(row.contact_intro),
    email: str(row.email),
    socials: list(row.socials),
    avatar_url: strOrNull(row.avatar_url),
    resume_url: strOrNull(row.resume_url),
  };
}

export function normalizeSettings(row: Row): SiteSettings {
  const stored = list<HomeSection>(row.home_sections).filter(
    (s) => !!s && HOME_SECTION_KEYS.includes(s.key),
  );
  // Keep the stored order, then append any section keys added in a later release.
  const missing = HOME_SECTION_KEYS.filter((key) => !stored.some((s) => s.key === key));
  const hero = obj(row.hero_cta);
  const footer = obj(row.footer);
  const mediaType = row.hero_media_type === "image" || row.hero_media_type === "video" ? row.hero_media_type : null;

  return {
    nav: list(row.nav),
    home_sections: [
      ...stored.map((s) => ({ ...blankSection(s.key), ...s })),
      ...missing.map((key) => ({ ...blankSection(key), visible: false })),
    ],
    hero_cta: {
      primary_label: str(hero.primary_label),
      primary_href: str(hero.primary_href),
      secondary_label: str(hero.secondary_label),
      secondary_href: str(hero.secondary_href),
    },
    hero_media_url: strOrNull(row.hero_media_url),
    hero_media_type: mediaType,
    accent: HEX.test(str(row.accent)) ? str(row.accent) : emptySettings.accent,
    accent_alt: HEX.test(str(row.accent_alt)) ? str(row.accent_alt) : emptySettings.accent_alt,
    footer: { headline: str(footer.headline), note: str(footer.note), links: list(footer.links) },
    seo_title: str(row.seo_title),
    seo_description: str(row.seo_description),
  };
}

export function normalizeProject(row: Row): Project {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    summary: str(row.summary),
    category: str(row.category),
    role: str(row.role),
    timeframe: str(row.timeframe),
    status: row.status === "published" ? "published" : "draft",
    featured: row.featured === true,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    cover_url: strOrNull(row.cover_url),
    cover_video_url: strOrNull(row.cover_video_url),
    gallery: list(row.gallery),
    technologies: list(row.technologies),
    github_url: strOrNull(row.github_url),
    live_url: strOrNull(row.live_url),
    sections: list(row.sections),
    published_at: strOrNull(row.published_at),
    created_at: str(row.created_at),
    updated_at: str(row.updated_at),
  };
}
