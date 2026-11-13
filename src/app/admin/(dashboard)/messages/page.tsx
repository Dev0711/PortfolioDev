import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/kit";
import { MessagesList } from "@/components/admin/messages-list";
import { requireAdmin } from "@/lib/auth";
import type { ContactMessage } from "@/lib/types";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <>
      <PageHeader title="Messages" description="Submissions from the contact form. Only administrators can read these." />
      <MessagesList messages={(data ?? []) as ContactMessage[]} />
    </>
  );
}
