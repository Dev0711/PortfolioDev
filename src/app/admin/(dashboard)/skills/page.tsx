import type { Metadata } from "next";
import { SkillsManager } from "@/components/admin/skills-manager";
import { requireAdmin } from "@/lib/auth";
import type { Skill, SkillCategory } from "@/lib/types";

export const metadata: Metadata = { title: "Skills" };

export default async function SkillsPage() {
  const { supabase } = await requireAdmin();
  const [categories, skills] = await Promise.all([
    supabase.from("skill_categories").select("*").order("sort_order"),
    supabase.from("skills").select("*").order("sort_order"),
  ]);

  const all = (skills.data ?? []) as Skill[];
  const grouped: SkillCategory[] = (categories.data ?? []).map((category) => ({
    ...(category as Omit<SkillCategory, "skills">),
    skills: all.filter((skill) => skill.category_id === category.id),
  }));

  return <SkillsManager categories={grouped} />;
}
