/**
 * Starter content.
 *
 * Used in two places:
 *   1. `npm run seed` writes it to Supabase as the initial, fully editable content.
 *   2. When Supabase is not configured, the public site renders it in a clearly
 *      labelled "preview" mode so the design can be reviewed before connecting.
 *
 * Nothing here is a claim about real employers, results or metrics. Entries that
 * need your own facts are explicit placeholders — replace them in the admin.
 */
import type {
  Certification,
  Education,
  Experience,
  Profile,
  Project,
  SiteSettings,
  SkillCategory,
} from "../../src/lib/types";

const EPOCH = "2026-01-01T00:00:00.000Z";

export const seedProfile: Profile = {
  name: "Your Name",
  title: "Software Engineer / Product Engineer",
  hero_headline: "I build the systems that keep enterprise AI *running in production.*",
  hero_description:
    "Backend and product engineering for enterprise AI platforms — distributed services, workflow orchestration and the reliability work that turns a capable model into a dependable product.",
  availability: "Open to conversations about backend and platform roles",
  location: "Add your city",
  timezone: "UTC",
  about_intro:
    "I work on enterprise AI platforms, mostly on the backend: the services, data models and orchestration layers that sit between a model and the people relying on it.",
  about_body:
    "<p>My work sits where product requirements meet production constraints. I design REST APIs and data models, break systems into services that can be deployed and reasoned about independently, and spend a fair amount of time on the unglamorous parts — timeouts, retries, idempotency, migrations, and the dashboards that tell you whether any of it is working.</p><p>I mostly write Java with Spring Boot and Python on the server, React and TypeScript on the client, and I am comfortable across PostgreSQL, MongoDB, Redis, Docker, Kubernetes and AWS.</p>",
  journey:
    "<p>This section is yours to write. Use it for the path that brought you here — what you studied, the first system you were responsible for, and what changed how you think about engineering. Edit it in <strong>Admin → Profile</strong>.</p>",
  interests: [
    { title: "Distributed systems", body: "Service boundaries, consistency trade-offs, and failure modes that only show up under real traffic." },
    { title: "Workflow orchestration", body: "Long-running, multi-step processes that have to survive restarts, retries and partial failure." },
    { title: "Enterprise AI applications", body: "Putting models behind APIs with the guardrails, auditability and latency budgets enterprises need." },
    { title: "Data modelling", body: "Schemas, indexes and migrations that stay workable as a product and its data grow." },
    { title: "Performance", body: "Measuring first, then removing the work a system does not need to do." },
    { title: "Production reliability", body: "Observability, safe rollouts, and designing for the day something goes wrong." },
  ],
  philosophy: [
    { title: "Reliability is a feature", body: "A system that is correct most of the time is a system people learn not to trust. I design for the failure path as deliberately as the happy path." },
    { title: "Boring where it counts", body: "Proven tools for the critical path, and experimentation where being wrong is cheap. Novelty has to earn its place in production." },
    { title: "Measure before optimising", body: "Profiles, traces and query plans come before opinions. Most performance work is finding the one thing that actually matters." },
    { title: "Interfaces outlive implementations", body: "APIs and schemas are the hardest things to change later, so they get the most care up front." },
    { title: "Operate what you build", body: "Good logs, metrics and runbooks are part of the feature. If it cannot be observed, it is not finished." },
  ],
  contact_intro:
    "If you are working on backend systems, AI platforms or anything where reliability matters, I would be glad to hear about it.",
  email: "you@example.com",
  socials: [
    { label: "GitHub", url: "https://github.com/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/" },
  ],
  avatar_url: null,
  resume_url: null,
};

export const seedSettings: SiteSettings = {
  nav: [
    { label: "Work", href: "/work", visible: true },
    { label: "About", href: "/about", visible: true },
    { label: "Contact", href: "/contact", visible: true },
  ],
  hero_cta: {
    primary_label: "View selected work",
    primary_href: "/work",
    secondary_label: "Get in touch",
    secondary_href: "/contact",
  },
  hero_media_url: null,
  hero_media_type: null,
  accent: "#FF6A3D",
  accent_alt: "#8B9CFF",
  home_sections: [
    { key: "stack", visible: true, eyebrow: "Stack", heading: "", body: "", cta_label: "", cta_href: "" },
    {
      key: "featured",
      visible: true,
      eyebrow: "Selected work",
      heading: "Systems, platforms and the engineering behind them.",
      body: "A small selection of projects, written up as case studies: the problem, the constraints, and the decisions that shaped the result.",
      cta_label: "All projects",
      cta_href: "/work",
    },
    {
      key: "principles",
      visible: true,
      eyebrow: "How I work",
      heading: "Principles I *engineer* by.",
      body: "",
      cta_label: "",
      cta_href: "",
    },
    {
      key: "capabilities",
      visible: true,
      eyebrow: "Capabilities",
      heading: "The tools I reach for, and what I use them to build.",
      body: "",
      cta_label: "More about me",
      cta_href: "/about",
    },
    {
      key: "experience",
      visible: true,
      eyebrow: "Experience",
      heading: "Where I have been building.",
      body: "",
      cta_label: "Full background",
      cta_href: "/about",
    },
    {
      key: "contact",
      visible: true,
      eyebrow: "Contact",
      heading: "Have a system that needs to *hold up* in production?",
      body: "I am always happy to talk about backend architecture, AI platforms and reliability.",
      cta_label: "Start a conversation",
      cta_href: "/contact",
    },
  ],
  footer: {
    headline: "Let's build something *dependable.*",
    note: "Designed and engineered as a Next.js + Supabase application.",
    links: [],
  },
  seo_title: "Your Name — Software Engineer / Product Engineer",
  seo_description:
    "Software Engineer / Product Engineer working on enterprise AI platforms: backend engineering, distributed systems, workflow orchestration and production reliability.",
};

const section = (id: string, heading: string, html: string) => ({ id, heading, html });

const SAMPLE_NOTE =
  "<p><em>This is a sample case study that shows the layout. Replace the text with your own project in Admin → Projects — do not publish it as-is.</em></p>";

function sampleProject(
  index: number,
  input: Pick<Project, "slug" | "title" | "summary" | "category" | "technologies" | "featured">,
): Project {
  return {
    id: `00000000-0000-4000-8000-00000000000${index}`,
    role: "Add your role",
    timeframe: "Add timeframe",
    status: "published",
    sort_order: index,
    cover_url: null,
    cover_video_url: null,
    gallery: [],
    github_url: null,
    live_url: null,
    published_at: EPOCH,
    created_at: EPOCH,
    updated_at: EPOCH,
    sections: [
      section("overview", "Overview", SAMPLE_NOTE + "<p>Describe the product or platform in two or three sentences: who uses it and what it does for them.</p>"),
      section("problem", "Problem", "<p>What was not working, or what did not exist yet? State the problem in terms of the people affected by it.</p>"),
      section("architecture", "Architecture", "<p>Outline the main components and how they communicate. Mention the service boundaries, data stores and any asynchronous paths.</p><ul><li>Service or component one — its responsibility</li><li>Service or component two — its responsibility</li><li>Data stores and why each was chosen</li></ul>"),
      section("decisions", "Key decisions", "<p>Pick two or three decisions that shaped the system and explain the trade-off behind each one.</p>"),
      section("outcome", "Outcome", "<p>Describe what changed once this shipped. Use real, verifiable results only.</p>"),
    ],
    ...input,
  };
}

export const seedProjects: Project[] = [
  sampleProject(1, {
    slug: "sample-workflow-orchestration",
    title: "Sample — Workflow orchestration service",
    summary: "Template case study for a long-running, multi-step workflow engine with retries and durable state.",
    category: "Platform",
    technologies: ["Java", "Spring Boot", "PostgreSQL", "Redis", "Kubernetes"],
    featured: true,
  }),
  sampleProject(2, {
    slug: "sample-enterprise-ai-gateway",
    title: "Sample — Enterprise AI gateway",
    summary: "Template case study for an API layer that puts models behind authentication, rate limits and audit logging.",
    category: "AI Platform",
    technologies: ["Python", "REST APIs", "MongoDB", "Docker", "AWS"],
    featured: true,
  }),
  sampleProject(3, {
    slug: "sample-microservices-migration",
    title: "Sample — Service decomposition",
    summary: "Template case study for splitting a monolith into independently deployable services.",
    category: "Backend",
    technologies: ["Java", "Spring Boot", "PostgreSQL", "Docker", "Kubernetes"],
    featured: true,
  }),
  sampleProject(4, {
    slug: "sample-operations-console",
    title: "Sample — Operations console",
    summary: "Template case study for an internal React application used to observe and operate backend workflows.",
    category: "Product",
    technologies: ["React", "TypeScript", "REST APIs", "PostgreSQL"],
    featured: false,
  }),
];

export const seedExperience: Experience[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    company: "Company name",
    role: "Software Engineer / Product Engineer",
    location: "",
    start_date: "2024-01-01",
    end_date: null,
    summary:
      "Placeholder entry. Add your real role, dates and responsibilities in Admin → Experience, then delete this one.",
    highlights: [],
    technologies: ["Java", "Spring Boot", "Python", "PostgreSQL", "AWS"],
    company_url: null,
    published: true,
    sort_order: 1,
  },
];

export const seedEducation: Education[] = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    institution: "Institution name",
    degree: "Degree",
    field: "Field of study",
    start_year: null,
    end_year: null,
    notes: "Placeholder — edit in Admin → Credentials.",
    sort_order: 1,
  },
];

export const seedCertifications: Certification[] = [];

type SeedCategory = Omit<SkillCategory, "skills"> & { skills: { name: string; icon: string }[] };

const categories: SeedCategory[] = [
  {
    id: "00000000-0000-4000-8000-000000000301",
    name: "Backend",
    description: "Services, APIs and the business logic behind them.",
    sort_order: 1,
    skills: [
      { name: "Java", icon: "coffee" },
      { name: "Spring Boot", icon: "leaf" },
      { name: "Python", icon: "terminal" },
      { name: "REST APIs", icon: "route" },
      { name: "Microservices", icon: "boxes" },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000302",
    name: "Data",
    description: "Modelling, querying and caching.",
    sort_order: 2,
    skills: [
      { name: "PostgreSQL", icon: "database" },
      { name: "MongoDB", icon: "layers" },
      { name: "Redis", icon: "zap" },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000303",
    name: "Frontend",
    description: "Product interfaces for the systems underneath.",
    sort_order: 3,
    skills: [
      { name: "React", icon: "atom" },
      { name: "TypeScript", icon: "braces" },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000304",
    name: "Cloud & infrastructure",
    description: "Shipping, running and observing software.",
    sort_order: 4,
    skills: [
      { name: "AWS", icon: "cloud" },
      { name: "Docker", icon: "container" },
      { name: "Kubernetes", icon: "ship-wheel" },
    ],
  },
];

export const seedSkillCategories: SkillCategory[] = categories.map((category, c) => ({
  ...category,
  skills: category.skills.map((skill, s) => ({
    id: `00000000-0000-4000-8000-0000000004${c}${s}`,
    category_id: category.id,
    sort_order: s + 1,
    ...skill,
  })),
}));
