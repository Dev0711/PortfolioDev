/** Cache tags for public content. Shared by the cached queries and admin mutations. */
export const CONTENT_TAGS = {
  profile: "content:profile",
  settings: "content:settings",
  projects: "content:projects",
  experience: "content:experience",
  credentials: "content:credentials",
  skills: "content:skills",
} as const;

export type ContentTag = keyof typeof CONTENT_TAGS;
