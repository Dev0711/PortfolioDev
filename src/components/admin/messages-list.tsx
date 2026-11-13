"use client";

import { Mail, MailOpen, Reply } from "lucide-react";
import { useState } from "react";
import { ConfirmDelete, EmptyState, useAction, useSyncedState } from "@/components/admin/kit";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteMessage, setMessageRead } from "@/lib/admin/actions/content";
import type { ContactMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const DATE = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export function MessagesList({ messages }: { messages: ContactMessage[] }) {
  const [rows, setRows] = useSyncedState(messages);
  const [openId, setOpenId] = useState<string | null>(null);
  const { run, pending } = useAction();

  if (rows.length === 0) {
    return <EmptyState title="Inbox is empty" body="Messages sent through the contact form will appear here." />;
  }

  function markRead(message: ContactMessage, is_read: boolean) {
    setRows((current) => current.map((row) => (row.id === message.id ? { ...row, is_read } : row)));
    run(() => setMessageRead(message.id, is_read), { silent: true });
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {rows.map((message) => {
        const open = openId === message.id;
        return (
          <li key={message.id}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => {
                setOpenId(open ? null : message.id);
                if (!open && !message.is_read) markRead(message, true);
              }}
              className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-surface-2/50"
            >
              <span
                aria-hidden
                className={cn("mt-1.5 size-2 shrink-0 rounded-full", message.is_read ? "bg-line-strong" : "bg-signal")}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className={cn("truncate", !message.is_read && "font-medium")}>
                    {message.name} <span className="font-normal text-ink-faint">&lt;{message.email}&gt;</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-faint">{DATE.format(new Date(message.created_at))}</span>
                </span>
                <span className="mt-0.5 block truncate text-ink-dim">
                  {message.subject || message.message}
                  {!message.is_read ? <span className="sr-only"> (unread)</span> : null}
                </span>
              </span>
            </button>

            {open ? (
              <div className="border-t border-line bg-base/40 px-4 py-4 pl-9">
                {message.subject ? <p className="mb-2 font-medium">{message.subject}</p> : null}
                <p className="max-w-3xl whitespace-pre-wrap leading-relaxed text-ink-dim">{message.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "Your message"}`)}`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    <Reply /> Reply by email
                  </a>
                  <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => markRead(message, !message.is_read)}>
                    {message.is_read ? <Mail /> : <MailOpen />}
                    Mark as {message.is_read ? "unread" : "read"}
                  </Button>
                  <ConfirmDelete
                    label="Delete"
                    title="Delete this message?"
                    description={`From ${message.name}.`}
                    pending={pending}
                    onConfirm={() => run(() => deleteMessage(message.id))}
                  />
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
