"use client";

import { Check, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import { ConfirmDelete, EmptyState, Field, Modal, PageHeader, useAction, useSyncedState } from "@/components/admin/kit";
import { SortableList, SortableRow } from "@/components/admin/sortable";
import { Button } from "@/components/ui/button";
import {
  deleteSkill,
  deleteSkillCategory,
  reorder,
  saveSkill,
  saveSkillCategory,
} from "@/lib/admin/actions/content";
import { SKILL_ICON_KEYS, getSkillIcon } from "@/lib/icons";
import type { Skill, SkillCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SkillsManager({ categories }: { categories: SkillCategory[] }) {
  const [rows, setRows] = useSyncedState(categories);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | "new" | null>(null);
  const [editingSkill, setEditingSkill] = useState<{ skill: Skill | null; categoryId: string } | null>(null);
  const { run, pending } = useAction();

  const addCategory = (
    <Button type="button" onClick={() => setEditingCategory("new")}>
      <Plus /> Add category
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Skills"
        description="Group technologies into categories. Drag categories or individual skills to reorder them."
        actions={addCategory}
      />

      {rows.length === 0 ? (
        <EmptyState title="No skill categories" body="Create a category such as Backend or Data, then add technologies to it." action={addCategory} />
      ) : (
        <SortableList
          items={rows}
          className="space-y-4"
          onReorder={(next) => {
            setRows(next);
            run(() => reorder("skill_categories", next.map((row) => row.id)));
          }}
        >
          {(category) => (
            <SortableRow
              key={category.id}
              id={category.id}
              className="flex items-start gap-2 rounded-xl border border-line bg-surface p-4"
              handleLabel={`Reorder ${category.name}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium">{category.name}</h2>
                    {category.description ? <p className="mt-0.5 text-xs text-ink-dim">{category.description}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${category.name}`} onClick={() => setEditingCategory(category)}>
                      <Pencil />
                    </Button>
                    <ConfirmDelete
                      iconOnly
                      label="Delete category"
                      title={`Delete "${category.name}"?`}
                      description={`Its ${category.skills.length} skill(s) will be deleted as well.`}
                      pending={pending}
                      onConfirm={() => run(() => deleteSkillCategory(category.id))}
                    />
                  </div>
                </div>

                <SortableList
                  layout="grid"
                  items={category.skills}
                  className="mt-4 flex flex-wrap gap-2"
                  onReorder={(next) => {
                    setRows((current) => current.map((row) => (row.id === category.id ? { ...row, skills: next } : row)));
                    run(() => reorder("skills", next.map((skill) => skill.id)));
                  }}
                >
                  {(skill) => {
                    const Icon = getSkillIcon(skill.icon);
                    return (
                      <SortableRow
                        key={skill.id}
                        id={skill.id}
                        className="flex h-9 items-center rounded-lg border border-line bg-base/50 pr-1"
                        handleClassName="size-7"
                        handleLabel={`Reorder ${skill.name}`}
                      >
                        <button
                          type="button"
                          onClick={() => setEditingSkill({ skill, categoryId: category.id })}
                          className="flex items-center gap-2 px-1.5 text-sm hover:text-signal"
                          aria-label={`Edit ${skill.name}`}
                        >
                          <Icon className="size-3.5 text-ink-faint" aria-hidden />
                          {skill.name}
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${skill.name}`}
                          disabled={pending}
                          onClick={() => run(() => deleteSkill(skill.id))}
                          className="ml-1 flex size-6 items-center justify-center rounded text-ink-faint hover:text-destructive"
                        >
                          <X className="size-3" />
                        </button>
                      </SortableRow>
                    );
                  }}
                </SortableList>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setEditingSkill({ skill: null, categoryId: category.id })}
                >
                  <Plus /> Add skill
                </Button>
              </div>
            </SortableRow>
          )}
        </SortableList>
      )}

      <CategoryDialog
        key={editingCategory === "new" ? "new" : (editingCategory?.id ?? "none")}
        entry={editingCategory}
        onClose={() => setEditingCategory(null)}
      />
      <SkillDialog
        key={editingSkill ? (editingSkill.skill?.id ?? `new-${editingSkill.categoryId}`) : "none"}
        entry={editingSkill}
        onClose={() => setEditingSkill(null)}
      />
    </>
  );
}

function CategoryDialog({ entry, onClose }: { entry: SkillCategory | "new" | null; onClose: () => void }) {
  const existing = entry && entry !== "new" ? entry : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const { run, pending } = useAction();

  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      title={existing ? "Edit category" : "Add category"}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={pending || !name.trim()}>
            Save
          </Button>
        </>
      }
    >
      <form
        id="category-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          run(() => saveSkillCategory(existing?.id ?? null, { name, description }), { onSuccess: onClose });
        }}
      >
        <Field label="Name" htmlFor="category-name">
          <input id="category-name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="field-input" />
        </Field>
        <Field label="Description" htmlFor="category-description">
          <textarea id="category-description" rows={2} maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} className="field-input" />
        </Field>
      </form>
    </Modal>
  );
}

function SkillDialog({
  entry,
  onClose,
}: {
  entry: { skill: Skill | null; categoryId: string } | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(entry?.skill?.name ?? "");
  const [icon, setIcon] = useState(entry?.skill?.icon ?? "box");
  const { run, pending } = useAction();

  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      title={entry?.skill ? "Edit skill" : "Add skill"}
      size="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="skill-form" disabled={pending || !name.trim()}>
            Save
          </Button>
        </>
      }
    >
      <form
        id="skill-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!entry) return;
          run(() => saveSkill(entry.skill?.id ?? null, { category_id: entry.categoryId, name, icon }), { onSuccess: onClose });
        }}
      >
        <Field label="Name" htmlFor="skill-name">
          <input id="skill-name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className="field-input" placeholder="e.g. PostgreSQL" />
        </Field>
        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-ink-dim">Icon</legend>
          <div className="grid max-h-56 grid-cols-8 gap-1.5 overflow-y-auto rounded-lg border border-line bg-base/40 p-2 sm:grid-cols-9">
            {SKILL_ICON_KEYS.map((key) => {
              const Icon = getSkillIcon(key);
              const selected = key === icon;
              return (
                <button
                  key={key}
                  type="button"
                  title={key}
                  aria-label={key}
                  aria-pressed={selected}
                  onClick={() => setIcon(key)}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-md border transition-colors",
                    selected ? "border-signal bg-signal/10 text-signal" : "border-transparent text-ink-dim hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {selected ? <Check className="absolute right-0.5 top-0.5 size-2.5" aria-hidden /> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
