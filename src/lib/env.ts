/**
 * Environment access. Only NEXT_PUBLIC_* values are read here, so this module
 * is safe to import from both server and client code. The service-role key is
 * never read by the application — only by the scripts in /scripts.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
};

export const isSupabaseConfigured =
  /^https?:\/\//.test(env.supabaseUrl) && env.supabaseAnonKey.length > 20;

export const MEDIA_BUCKET = "media";
