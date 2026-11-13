"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmDelete, Field, Modal, PageHeader, Panel, useAction, useSyncedState } from "@/components/admin/kit";
import { SortableList, SortableRow } from "@/components/admin/sortable";
import { Button } from "@/components/ui/button";
import { deleteCredential, reorder, saveCertification, saveEducation } from "@/lib/admin/actions/content";
import type { Certification, Education } from "@/lib/types";

type Kind = "education" | "certifications";
type Entry = { kind: "education"; item: Education | null } | { kind: "certifications"; item: Certification | null };

export function CredentialsManager({
  education,
  certifications,
}: {
  education: Education[];
  certifications: Certification[];
}) {
  const [editing, setEditing] = useState<Entry | null>(null);

  return (
    <>
      <PageHeader title="Credentials" description="Education and certifications shown on the About page." />

      <div className="grid gap-6 lg:grid-cols-2">
        <CredentialList
          kind="education"
          title="Education"
          items={education}
          primary={(item) => item.institution}
          secondary={(item) =>
            [[item.degree, item.field].filter(Boolean).join(", "), [item.start_year, item.end_year].filter(Boolean).join("–")]
              .filter(Boolean)
              .join(" · ")
          }
          onAdd={() => setEditing({ kind: "education", item: null })}
          onEdit={(item) => setEditing({ kind: "education", item })}
        />
        <CredentialList
          kind="certifications"
          title="Certifications"
          items={certifications}
          primary={(item) => item.name}
          secondary={(item) => [item.issuer, item.year].filter(Boolean).join(" · ")}
          onAdd={() => setEditing({ kind: "certifications", item: null })}
          onEdit={(item) => setEditing({ kind: "certifications", item })}
        />
      </div>

      <CredentialDialog
        key={editing ? `${editing.kind}-${editing.item?.id ?? "new"}` : "none"}
        entry={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}

function CredentialList<T extends { id: string }>({
  kind,
  title,
  items,
  primary,
  secondary,
  onAdd,
  onEdit,
}: {
  kind: Kind;
  title: string;
  items: T[];
  primary: (item: T) => string;
  secondary: (item: T) => string;
  onAdd: () => void;
  onEdit: (item: T) => void;
}) {
  const [rows, setRows] = useSyncedState(items);
  const { run, pending } = useAction();

  return (
    <Panel
      title={title}
      actions={
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus /> Add
        </Button>
      }
    >
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-dim">Nothing here yet.</p>
      ) : (
        <SortableList
          items={rows}
          className="-my-2 divide-y divide-line"
          onReorder={(next) => {
            setRows(next);
            run(() => reorder(kind, next.map((row) => row.id)));
          }}
        >
          {(item) => (
            <SortableRow key={item.id} id={item.id} className="flex items-center gap-2 bg-surface py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{primary(item)}</p>
                <p className="truncate text-xs text-ink-dim">{secondary(item)}</p>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${primary(item)}`} onClick={() => onEdit(item)}>
                <Pencil />
              </Button>
              <ConfirmDelete
                iconOnly
                label="Delete"
                title={`Delete "${primary(item)}"?`}
                description="This entry will be removed from the About page."
                pending={pending}
                onConfirm={() => run(() => deleteCredential(kind, item.id))}
              />
            </SortableRow>
          )}
        </SortableList>
      )}
    </Panel>
  );
}

function CredentialDialog({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  const { run, pending } = useAction();
  const education = entry?.kind === "education" ? entry.item : null;
  const certification = entry?.kind === "certifications" ? entry.item : null;

  const [values, setValues] = useState<Record<string, string>>((): Record<string, string> =>
    entry?.kind === "education"
      ? {
          institution: education?.institution ?? "",
          degree: education?.degree ?? "",
          field: education?.field ?? "",
          start_year: education?.start_year?.toString() ?? "",
          end_year: education?.end_year?.toString() ?? "",
          notes: education?.notes ?? "",
        }
      : {
          name: certification?.name ?? "",
          issuer: certification?.issuer ?? "",
          year: certification?.year?.toString() ?? "",
          url: certification?.url ?? "",
        },
  );

  const bind = (key: string) => ({
    id: `credential-${key}`,
    value: values[key] ?? "",
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((current) => ({ ...current, [key]: event.target.value })),
    className: "field-input",
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!entry) return;
    run(
      () =>
        entry.kind === "education"
          ? saveEducation(entry.item?.id ?? null, values)
          : saveCertification(entry.item?.id ?? null, values),
      { onSuccess: onClose },
    );
  }

  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      title={`${entry?.item ? "Edit" : "Add"} ${entry?.kind === "education" ? "education" : "certification"}`}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="credential-form" disabled={pending}>
            Save
          </Button>
        </>
      }
    >
      <form id="credential-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {entry?.kind === "education" ? (
          <>
            <Field label="Institution" htmlFor="credential-institution" className="sm:col-span-2">
              <input required maxLength={160} {...bind("institution")} />
            </Field>
            <Field label="Degree" htmlFor="credential-degree">
              <input maxLength={160} {...bind("degree")} />
            </Field>
            <Field label="Field of study" htmlFor="credential-field">
              <input maxLength={160} {...bind("field")} />
            </Field>
            <Field label="Start year" htmlFor="credential-start_year">
              <input type="number" min={1950} max={2100} {...bind("start_year")} />
            </Field>
            <Field label="End year" htmlFor="credential-end_year">
              <input type="number" min={1950} max={2100} {...bind("end_year")} />
            </Field>
            <Field label="Notes" htmlFor="credential-notes" className="sm:col-span-2">
              <textarea rows={3} maxLength={800} {...bind("notes")} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Name" htmlFor="credential-name" className="sm:col-span-2">
              <input required maxLength={200} {...bind("name")} />
            </Field>
            <Field label="Issuer" htmlFor="credential-issuer">
              <input maxLength={160} {...bind("issuer")} />
            </Field>
            <Field label="Year" htmlFor="credential-year">
              <input type="number" min={1950} max={2100} {...bind("year")} />
            </Field>
            <Field label="Credential URL" htmlFor="credential-url" className="sm:col-span-2">
              <input type="url" placeholder="https://…" {...bind("url")} />
            </Field>
          </>
        )}
      </form>
    </Modal>
  );
}
