/**
 * Seeds starter content into Supabase. Safe to re-run: rows use fixed ids and
 * are upserted, and the profile/settings singletons are only written if they
 * do not exist yet (so it never overwrites what you edited in the admin),
 * unless you pass --force.
 *
 *   npm run seed
 *   npm run seed -- --force
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  seedCertifications,
  seedEducation,
  seedExperience,
  seedProfile,
  seedProjects,
  seedSettings,
  seedSkillCategories,
} from "../supabase/seed/content";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const force = process.argv.includes("--force");
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function check<T>(label: string, result: PromiseLike<{ error: { message: string } | null; data?: T }>) {
  const { error } = await result;
  if (error) {
    console.error(`✖ ${label}: ${error.message}`);
    process.exit(1);
  }
  console.log(`✔ ${label}`);
}

async function singleton(table: "profile" | "site_settings", row: Record<string, unknown>) {
  const { data } = await supabase.from(table).select("id").eq("id", 1).maybeSingle();
  if (data && !force) {
    console.log(`• ${table}: already exists, left untouched (use --force to overwrite)`);
    return;
  }
  await check(table, supabase.from(table).upsert({ id: 1, ...row }));
}

async function main() {
  await singleton("profile", seedProfile);
  await singleton("site_settings", seedSettings);

  const projects = seedProjects.map((project) => {
    const row: Record<string, unknown> = { ...project };
    delete row.created_at;
    delete row.updated_at;
    return row;
  });
  await check("projects", supabase.from("projects").upsert(projects, { onConflict: "id" }));
  await check("experience", supabase.from("experience").upsert(seedExperience, { onConflict: "id" }));
  await check("education", supabase.from("education").upsert(seedEducation, { onConflict: "id" }));
  if (seedCertifications.length > 0) {
    await check("certifications", supabase.from("certifications").upsert(seedCertifications, { onConflict: "id" }));
  }

  await check(
    "skill_categories",
    supabase
      .from("skill_categories")
      .upsert(
        seedSkillCategories.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          sort_order: category.sort_order,
        })),
        { onConflict: "id" },
      ),
  );
  await check(
    "skills",
    supabase.from("skills").upsert(seedSkillCategories.flatMap((category) => category.skills), { onConflict: "id" }),
  );

  console.log("\nDone. The seeded projects are SAMPLES — edit or delete them in /admin/projects.");
}

void main();
