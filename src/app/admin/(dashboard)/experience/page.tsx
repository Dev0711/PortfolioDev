import type { Metadata } from "next";
import { ExperienceManager } from "@/components/admin/experience-manager";
import { requireAdmin } from "@/lib/auth";
import type { Experience } from "@/lib/types";

export const metadata: Metadata = { title: "Experience" };

export default async function ExperiencePage({ searchParams }: PageProps<"/admin/experience">) {
  const { supabase } = await requireAdmin();
  const [{ data }, query] = await Promise.all([
    supabase.from("experience").select("*").order("sort_order", { ascending: true }),
    searchParams,
  ]);

  return <ExperienceManager items={(data ?? []) as Experience[]} openNew={query.new === "1"} />;
}
