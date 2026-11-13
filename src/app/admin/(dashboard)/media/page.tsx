import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/kit";
import { MediaLibrary } from "@/components/admin/media-library";
import { requireAdmin } from "@/lib/auth";
import type { MediaAsset } from "@/lib/types";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Media"
        description="Images, background videos and documents stored in Supabase Storage. Click a file to edit its description, replace it or delete it."
      />
      <MediaLibrary initial={(data ?? []) as MediaAsset[]} />
    </>
  );
}
