"use client";

import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, type KeyboardEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ── Page scaffolding ─────────────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-ink-dim">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-line bg-surface", className)}>
      {title ? (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-medium">{title}</h2>
            {description ? <p className="mt-1 text-xs leading-relaxed text-ink-dim">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-ink-dim">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      {body ? <p className="mx-auto mt-2 max-w-md text-sm text-ink-dim">{body}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: "draft" | "published" | "hidden" }) {
  const styles = {
    published: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    draft: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    hidden: "border-line-strong bg-surface-2 text-ink-dim",
  }[status];
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full border px-2.5 text-[0.6875rem] font-medium capitalize", styles)}>
      {status}
    </span>
  );
}

/* ── Running server actions ───────────────────────────────────────────────── */

/**
 * Runs a server action with a pending state, toasts the outcome and refreshes
 * the current route so server-rendered admin data stays in sync.
 */
export function useAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run<T>(
    action: () => Promise<ActionResult<T>>,
    options: { onSuccess?: (data: T | undefined) => void; silent?: boolean } = {},
  ) {
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        if (result.message && !options.silent) toast.success(result.message);
        options.onSuccess?.(result.data);
        router.refresh();
      } catch (error) {
        // redirect() inside an action surfaces as a thrown NEXT_REDIRECT: let it through.
        if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return { run, pending };
}

/* ── Modal (native <dialog>: focus trap, Escape and backdrop for free) ─────── */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const width = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" }[size];

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] rounded-2xl border border-line-strong bg-popover p-0 text-ink shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm",
        width,
      )}
    >
      {open ? (
        <div className="flex max-h-[85vh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div>
              <h2 id={titleId} className="font-medium">
                {title}
              </h2>
              {description ? <p className="mt-1 text-sm text-ink-dim">{description}</p> : null}
            </div>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
              <X />
            </Button>
          </header>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer ? <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</footer> : null}
        </div>
      ) : null}
    </dialog>
  );
}

/** Destructive action behind an explicit confirmation dialog. */
export function ConfirmDelete({
  label = "Delete",
  title,
  description,
  onConfirm,
  pending,
  iconOnly = false,
}: {
  label?: string;
  title: string;
  description: string;
  onConfirm: () => void;
  pending?: boolean;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant={iconOnly ? "ghost" : "destructive"}
        size={iconOnly ? "icon-sm" : "default"}
        aria-label={iconOnly ? label : undefined}
        onClick={() => setOpen(true)}
        className={iconOnly ? "text-ink-dim hover:text-destructive" : undefined}
      >
        <Trash2 />
        {iconOnly ? null : label}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
              {label}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-dim">This cannot be undone.</p>
      </Modal>
    </>
  );
}

/* ── Inputs ───────────────────────────────────────────────────────────────── */

/** Chip input for lists of short strings (technologies, highlights). */
export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  id,
  max = 30,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
  max?: number;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const items = draft
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item && !value.includes(item));
    if (items.length > 0) onChange([...value, ...items].slice(0, max));
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="field-input flex min-h-10 flex-wrap items-center gap-1.5 !py-1.5 focus-within:border-signal">
      {value.map((item) => (
        <span key={item} className="inline-flex h-6 items-center gap-1 rounded-md bg-surface-2 pl-2 pr-1 text-xs">
          {item}
          <button
            type="button"
            aria-label={`Remove ${item}`}
            onClick={() => onChange(value.filter((v) => v !== item))}
            className="flex size-4 items-center justify-center rounded text-ink-faint hover:text-ink"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-ink-faint"
      />
    </div>
  );
}

/** Editable list of {a, b} rows, e.g. social links or title/body blocks. */
export function PairList<T extends Record<string, string>>({
  value,
  onChange,
  fields,
  blank,
  addLabel,
  max = 12,
}: {
  value: T[];
  onChange: (next: T[]) => void;
  fields: { key: keyof T & string; label: string; multiline?: boolean; placeholder?: string }[];
  blank: T;
  addLabel: string;
  max?: number;
}) {
  const update = (index: number, key: string, next: string) =>
    onChange(value.map((row, i) => (i === index ? { ...row, [key]: next } : row)));

  return (
    <div className="space-y-3">
      {value.map((row, index) => (
        <div key={index} className="flex gap-2 rounded-lg border border-line bg-base/40 p-3">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            {fields.map((field) =>
              field.multiline ? (
                <textarea
                  key={field.key}
                  aria-label={`${field.label} ${index + 1}`}
                  rows={2}
                  value={row[field.key]}
                  placeholder={field.placeholder ?? field.label}
                  onChange={(event) => update(index, field.key, event.target.value)}
                  className="field-input sm:col-span-2"
                />
              ) : (
                <input
                  key={field.key}
                  aria-label={`${field.label} ${index + 1}`}
                  value={row[field.key]}
                  placeholder={field.placeholder ?? field.label}
                  onChange={(event) => update(index, field.key, event.target.value)}
                  className={cn("field-input", fields.some((f) => f.multiline) && "sm:col-span-2")}
                />
              ),
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Move up"
              disabled={index === 0}
              onClick={() => onChange(move(value, index, index - 1))}
            >
              ↑
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Move down"
              disabled={index === value.length - 1}
              onClick={() => onChange(move(value, index, index + 1))}
            >
              ↓
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove"
              className="text-ink-dim hover:text-destructive"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      {value.length < max ? (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, { ...blank }])}>
          <Plus />
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Local, optimistically-editable copy of server data that resets whenever the
 * server sends a new value (after router.refresh()).
 */
export function useSyncedState<T>(source: T) {
  const [state, setState] = useState(source);
  const [previous, setPrevious] = useState(source);
  if (previous !== source) {
    setPrevious(source);
    setState(source);
  }
  return [state, setState] as const;
}

export function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function SaveBar({
  pending,
  dirty,
  children,
}: {
  pending: boolean;
  dirty?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-line bg-base/85 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
      <p className="text-xs text-ink-faint">{dirty ? "Unsaved changes" : "All changes saved"}</p>
      <div className="flex items-center gap-2">
        {children ?? (
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            Save changes
          </Button>
        )}
      </div>
    </div>
  );
}
