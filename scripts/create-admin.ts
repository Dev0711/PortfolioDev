/**
 * Creates the first administrator (or promotes an existing auth user).
 *
 *   npm run create-admin -- you@example.com "a-strong-password"
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Uses the service-role key, so run it only from your own machine.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const [email, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!email || !password || password.length < 12) {
  console.error('Usage: npm run create-admin -- <email> "<password, 12+ characters>"');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  let userId: string | undefined;

  const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.data.user) {
    userId = created.data.user.id;
    console.log(`✔ Created auth user ${email}`);
  } else {
    // Already registered: find it and update the password.
    const list = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const existing = list.data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (!existing) {
      console.error(`✖ Could not create user: ${created.error?.message}`);
      process.exit(1);
    }
    userId = existing.id;
    await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
    console.log(`• Auth user already existed; password updated`);
  }

  const { error } = await supabase.from("admins").upsert({ user_id: userId, role: "owner" });
  if (error) {
    console.error(`✖ Could not add to admins table: ${error.message} (did you run the migrations?)`);
    process.exit(1);
  }
  console.log(`✔ ${email} is now an administrator. Sign in at /admin/login`);
}

void main();
