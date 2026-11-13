"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { ConfirmDelete, EmptyState, Field, Modal, PageHeader, StatusBadge, TagInput, useAction, useSyncedState } from "@/components/admin/kit";
import { SortableList, SortableRow } from "@/components/admin/sortable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteExperience, reorder, saveExperience } from "@/lib/admin/actions/content";
import { experienceSchema } from "@/lib/schemas";
import type { Experience } from "@/lib/types";
import { formatRange } from "@/lib/utils";

type FormInput = z.input<typeof experienceSchema>;
type FormOutput = z.output<typeof experienceSchema>;

const blank: FormInput = {
  company: "",
  role: "",
  location: "",
  start_date: "",
  end_date: "",
  summary: "",
  highlights: [],
  technologies: [],
  company_url: "",
  published: true,
};

export function ExperienceManager({ items, openNew }: { items: Experience[]; openNew: boolean }) {
  const [rows, setRows] = useSyncedState(items);
  const [editing, setEditing] = useState<Experience | "new" | null>(openNew ? "new" : null);
  const { run, pending } = useAction();

  const addButton = (
    <Button type="button" onClick={() => setEditing("new")}>
      <Plus /> Add experience
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Experience"
        description="Professional history shown on the homepage and the About page. Drag to reorder."
        actions={addButton}
      />

      {rows.length === 0 ? (
        <EmptyState title="No experience entries" body="Add your roles, most recent first." action={addButton} />
      ) : (
        <SortableList
          items={rows}
          className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface"
          onReorder={(next) => {
            setRows(next);
            run(() => reorder("experience", next.map((row) => row.id)));
          }}
        >
          {(item) => (
            <SortableRow key={item.id} id={item.id} className="flex items-center gap-3 bg-surface px-3 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {item.role} <span className="text-ink-dim">· {item.company}</span>
                </p>
                <p className="font-mono text-[0.6875rem] text-ink-faint">{formatRange(item.start_date, item.end_date)}</p>
              </div>
              <StatusBadge status={item.published ? "published" : "hidden"} />
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${item.role}`} onClick={() => setEditing(item)}>
                <Pencil />
              </Button>
              <ConfirmDelete
                iconOnly
                label="Delete entry"
                title={`Delete "${item.role} · ${item.company}"?`}
                description="This entry will be removed from the site."
                pending={pending}
                onConfirm={() => run(() => deleteExperience(item.id))}
              />
            </SortableRow>
          )}
        </SortableList>
      )}

      <ExperienceDialog
        key={editing === "new" ? "new" : (editing?.id ?? "closed")}
        entry={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}

function ExperienceDialog({ entry, onClose }: { entry: Experience | "new" | null; onClose: () => void }) {
  const { run, pending } = useAction();
  const existing = entry && entry !== "new" ? entry : null;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: existing
      ? {
          company: existing.company,
          role: existing.role,
          location: existing.location,
          start_date: existing.start_date,
          end_date: existing.end_date ?? "",
          summary: existing.summary,
          highlights: existing.highlights,
          technologies: existing.technologies,
          company_url: existing.company_url ?? "",
          published: existing.published,
        }
      : blank,
  });

  const current = !useWatch({ control, name: "end_date" });

  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      title={existing ? "Edit experience" : "Add experience"}
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="experience-form" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            Save
          </Button>
        </>
      }
    >
      <form
        id="experience-form"
        noValidate
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={handleSubmit((values) => run(() => saveExperience(existing?.id ?? null, values), { onSuccess: onClose }))}
      >
        <Field label="Role" htmlFor="exp-role" error={errors.role?.message}>
          <input id="exp-role" className="field-input" aria-invalid={!!errors.role} {...register("role")} />
        </Field>
        <Field label="Company" htmlFor="exp-company" error={errors.company?.message}>
          <input id="exp-company" className="field-input" aria-invalid={!!errors.company} {...register("company")} />
        </Field>
        <Field label="Location" htmlFor="exp-location" error={errors.location?.message}>
          <input id="exp-location" className="field-input" {...register("location")} />
        </Field>
        <Field label="Company URL" htmlFor="exp-url" error={errors.company_url?.message}>
          <input id="exp-url" type="url" className="field-input" placeholder="https://…" {...register("company_url")} />
        </Field>
        <Field label="Start date" htmlFor="exp-start" error={errors.start_date?.message}>
          <input id="exp-start" type="date" className="field-input" aria-invalid={!!errors.start_date} {...register("start_date")} />
        </Field>
        <Field label="End date" htmlFor="exp-end" error={errors.end_date?.message} hint="Leave empty for a current role.">
          <div className="flex items-center gap-3">
            <input id="exp-end" type="date" className="field-input" {...register("end_date")} />
            <label className="flex shrink-0 items-center gap-2 text-xs text-ink-dim">
              <input
                type="checkbox"
                checked={current}
                onChange={(event) => event.target.checked && setValue("end_date", "", { shouldDirty: true })}
                className="size-3.5 accent-[var(--signal)]"
              />
              Present
            </label>
          </div>
        </Field>
        <Field label="Summary" htmlFor="exp-summary" error={errors.summary?.message} className="sm:col-span-2">
          <textarea id="exp-summary" rows={3} className="field-input" {...register("summary")} />
        </Field>
        <Field
          label="Highlights"
          htmlFor="exp-highlights"
          hint="One achievement or responsibility per entry. Press Enter to add."
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="highlights"
            render={({ field }) => (
              <HighlightList value={field.value ?? []} onChange={field.onChange} />
            )}
          />
        </Field>
        <Field label="Technologies" htmlFor="exp-tech" className="sm:col-span-2">
          <Controller
            control={control}
            name="technologies"
            render={({ field }) => <TagInput id="exp-tech" value={field.value ?? []} onChange={field.onChange} />}
          />
        </Field>
        <label className="flex items-center gap-3 sm:col-span-2">
          <Controller
            control={control}
            name="published"
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Visible on site" />}
          />
          <span className="text-sm">Visible on the site</span>
        </label>
      </form>
    </Modal>
  );
}

/** Full-sentence list items (TagInput splits on commas, which sentences contain). */
function HighlightList({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const text = draft.trim();
    if (text) onChange([...value, text]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            aria-label={`Highlight ${index + 1}`}
            value={item}
            onChange={(event) => onChange(value.map((v, i) => (i === index ? event.target.value : v)))}
            className="field-input"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove highlight ${index + 1}`}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            ×
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          id="exp-highlights"
          value={draft}
          placeholder="Add a highlight"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          className="field-input"
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}
