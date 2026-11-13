/** Domain types shared by the public site, the admin CMS and the seed script. */

export type LinkItem = { label: string; url: string };
export type TextBlock = { title: string; body: string };

export type Profile = {
  name: string;
  title: string;
  hero_headline: string;
  hero_description: string;
  availability: string;
  location: string;
  timezone: string;
  about_intro: string;
  about_body: string;
  journey: string;
  interests: TextBlock[];
  philosophy: TextBlock[];
  contact_intro: string;
  email: string;
  socials: LinkItem[];
  avatar_url: string | null;
  resume_url: string | null;
};

export type NavItem = { label: string; href: string; visible: boolean };

export const HOME_SECTION_KEYS = [
  "stack",
  "featured",
  "principles",
  "capabilities",
  "experience",
  "contact",
] as const;
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export type HomeSection = {
  key: HomeSectionKey;
  visible: boolean;
  eyebrow: string;
  heading: string;
  body: string;
  cta_label: string;
  cta_href: string;
};

export type HeroCta = {
  primary_label: string;
  primary_href: string;
  secondary_label: string;
  secondary_href: string;
};

export type Footer = { headline: string; note: string; links: LinkItem[] };

export type SiteSettings = {
  nav: NavItem[];
  home_sections: HomeSection[];
  hero_cta: HeroCta;
  hero_media_url: string | null;
  hero_media_type: "image" | "video" | null;
  accent: string;
  accent_alt: string;
  footer: Footer;
  seo_title: string;
  seo_description: string;
};

export type ProjectSection = { id: string; heading: string; html: string };
export type GalleryItem = { url: string; alt: string };
export type PublishStatus = "draft" | "published";

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  role: string;
  timeframe: string;
  status: PublishStatus;
  featured: boolean;
  sort_order: number;
  cover_url: string | null;
  cover_video_url: string | null;
  gallery: GalleryItem[];
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  sections: ProjectSection[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string | null;
  summary: string;
  highlights: string[];
  technologies: string[];
  company_url: string | null;
  published: boolean;
  sort_order: number;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_year: number | null;
  end_year: number | null;
  notes: string;
  sort_order: number;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: number | null;
  url: string | null;
  sort_order: number;
};

export type Skill = {
  id: string;
  category_id: string;
  name: string;
  icon: string;
  sort_order: number;
};

export type SkillCategory = {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  skills: Skill[];
};

export type MediaAsset = {
  id: string;
  path: string;
  url: string;
  name: string;
  mime_type: string;
  size_bytes: number;
  alt: string;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

/** Result envelope returned by every server action. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
