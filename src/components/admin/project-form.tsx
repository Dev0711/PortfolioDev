"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, Images, Loader2, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { ConfirmDelete, Field, Modal, PageHeader, Panel, StatusBadge, TagInput } from "@/components/admin/kit";
import { MediaField, MediaLibrary } from "@/components/admin/media-library";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SortableList, SortableRow } from "@/components/admin/sortable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteProject, saveProject } from "@/lib/admin/actions/content";
import { projectSchema } from "@/lib/schemas";
import type { Project } from "@/lib/types";
import { newId, slugify } from "@/lib/utils";

type FormInput = z.input<typeof projectSchema>;
type FormOutput = z.output<typeof projectSchema>;

const SECTION_PRESETS = ["Overview", "Problem", "Architecture", "Key decisions", "Challenges", "Outcome"];

function toDefaults(project: Project | null): FormInput {
  return {
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    summary: project?.summary ?? "",
    category: project?.category ?? "",
    role: project?.role ?? "",
    timeframe: project?.timeframe ?? "",
    status: project?.status ?? "draft",
    featured: project?.featured ?? false,
    cover_url: project?.cover_url ?? "",
    cover_video_url: project?.cover_video_url ?? "",
    gallery: project?.gallery ?? [],
    technologies: project?.technologies ?? [],
    github_url: project?.github_url ?? "",
    live_url: project?.live_url ?? "",
    sections: project?.sections ?? [],
  };
}

export function ProjectForm({ project, categories }: { project: Project | null; categories: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [intent, setIntent] = useState<"draft" | "published" | "preview" | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(project));

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(projectSchema),
    defaultValues: toDefaults(project),
  });

  const sections = useFieldArray({ control, name: "sections", keyName: "key" });
  const gallery = useFieldArray({ control, name: "gallery", keyName: "key" });
  const status = useWatch({ control, name: "status" });
  const slug = useWatch({ control, name: "slug" });

  function submit(next: "draft" | "published" | "preview") {
    setIntent(next);
    return handleSubmit(
      (values) =>
        startTransition(async () => {
          // "Preview" saves without changing the current publish state.
          const payload = { ...values, status: next === "preview" ? values.status : next };
          const result = await saveProject(project?.id ?? null, payload);
          if (!result.ok) {
            toast.error(result.error);
            if (result.fieldErrors?.slug) setError("slug", { message: result.fieldErrors.slug[0] });
            return;
          }
          toast.success(result.message ?? "Saved");
          reset({ ...values, status: payload.status });
          const id = result.data?.id ?? project?.id;
          if (next === "preview" && id) window.open(`/admin/projects/${id}/preview`, "_blank", "noopener");
          if (!project && id) router.replace(`/admin/projects/${id}`);
          else router.refresh();
        }),
      () => toast.error("Please fix the highlighted fields."),
    )();
  }

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()}>
      <PageHeader
        title={project ? "Edit project" : "New project"}
        description={project ? `/work/${slug}` : "Save as a draft first — nothing is public until you publish."}
        actions={
          <>
            <Link href="/admin/projects" className="mr-2 flex items-center gap-1.5 text-xs text-ink-dim hover:text-ink">
              <ArrowLeft className="size-3.5" /> All projects
            </Link>
            <StatusBadge status={status} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="title" error={errors.title?.message} className="sm:col-span-2">
                <input
                  id="title"
                  className="field-input"
                  aria-invalid={!!errors.title}
                  {...register("title", {
                    onChange: (event) => {
                      if (!slugTouched) setValue("slug", slugify(event.target.value), { shouldDirty: true });
                    },
                  })}
                />
              </Field>
              <Field
                label="Slug"
                htmlFor="slug"
                error={errors.slug?.message}
                hint="Used in the URL: /work/your-slug"
                className="sm:col-span-2"
              >
                <input
                  id="slug"
                  className="field-input font-mono"
                  aria-invalid={!!errors.slug}
                  {...register("slug", { onChange: () => setSlugTouched(true) })}
                />
              </Field>
              <Field
                label="Summary"
                htmlFor="summary"
                error={errors.summary?.message}
                hint="One or two sentences, shown on cards and at the top of the case study."
                className="sm:col-span-2"
              >
                <textarea id="summary" rows={3} className="field-input" {...register("summary")} />
              </Field>
              <Field label="Category" htmlFor="category" error={errors.category?.message} hint="Used for filtering on /work.">
                <input id="category" list="category-options" className="field-input" {...register("category")} />
                <datalist id="category-options">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </Field>
              <Field label="Your role" htmlFor="role" error={errors.role?.message}>
                <input id="role" className="field-input" placeholder="e.g. Backend engineer" {...register("role")} />
              </Field>
              <Field label="Timeframe" htmlFor="timeframe" error={errors.timeframe?.message}>
                <input id="timeframe" className="field-input" placeholder="e.g. 2025 — Present" {...register("timeframe")} />
              </Field>
              <Field label="Technologies" htmlFor="technologies" error={errors.technologies?.message as string | undefined}>
                <Controller
                  control={control}
                  name="technologies"
                  render={({ field }) => <TagInput id="technologies" value={field.value ?? []} onChange={field.onChange} />}
                />
              </Field>
            </div>
          </Panel>

          <Panel
            title="Content sections"
            description="The body of the case study. Drag to reorder; each section has its own heading and rich text."
          >
            {sections.fields.length === 0 ? (
              <p className="mb-4 text-sm text-ink-dim">No sections yet. Start with a suggested structure:</p>
            ) : null}

            <SortableList
              items={sections.fields.map((field) => ({ ...field, id: field.key }))}
              className="space-y-4"
              onReorder={(next) => {
                const before = sections.fields.map((field) => field.key);
                const after = next.map((item) => item.key);
                const moved = before.find((key) => isMoved(before, after, key));
                if (moved) sections.move(before.indexOf(moved), after.indexOf(moved));
              }}
            >
              {(field, index) => (
                <SortableRow
                  key={field.key}
                  id={field.key}
                  className="flex items-start gap-2 rounded-xl border border-line bg-base/40 p-3"
                  handleClassName="mt-0.5"
                  handleLabel={`Reorder section ${index + 1}`}
                >
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-ink-faint">{String(index + 1).padStart(2, "0")}</span>
                      <input
                        aria-label={`Section ${index + 1} heading`}
                        placeholder="Section heading"
                        className="field-input font-medium"
                        {...register(`sections.${index}.heading`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove section ${index + 1}`}
                        className="text-ink-dim hover:text-destructive"
                        onClick={() => sections.remove(index)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <Controller
                      control={control}
                      name={`sections.${index}.html`}
                      render={({ field: html }) => (
                        <RichTextEditor
                          value={html.value ?? ""}
                          onChange={html.onChange}
                          ariaLabel={`Section ${index + 1} content`}
                          placeholder="Write this section…"
                        />
                      )}
                    />
                  </div>
                </SortableRow>
              )}
            </SortableList>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => sections.append({ id: newId(), heading: "", html: "" })}
              >
                <Plus /> Add section
              </Button>
              {SECTION_PRESETS.filter((preset) => !sections.fields.some((field) => field.heading === preset)).map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-ink-dim"
                  onClick={() => sections.append({ id: newId(), heading: preset, html: "" })}
                >
                  <Plus /> {preset}
                </Button>
              ))}
            </div>
          </Panel>

          <Panel
            title="Gallery"
            description="Additional screenshots or diagrams shown after the content. Drag to reorder."
            actions={
              <Button type="button" variant="outline" size="sm" onClick={() => setGalleryOpen(true)}>
                <Images /> Add images
              </Button>
            }
          >
            {gallery.fields.length === 0 ? (
              <p className="text-sm text-ink-dim">No gallery images.</p>
            ) : (
              <SortableList
                layout="grid"
                items={gallery.fields.map((field) => ({ ...field, id: field.key }))}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                onReorder={(next) => {
                  const before = gallery.fields.map((field) => field.key);
                  const after = next.map((item) => item.key);
                  const moved = before.find((key) => isMoved(before, after, key));
                  if (moved) gallery.move(before.indexOf(moved), after.indexOf(moved));
                }}
              >
                {(field, index) => (
                  <SortableRow
                    key={field.key}
                    id={field.key}
                    className="overflow-hidden rounded-lg border border-line bg-base"
                    handleClassName="absolute left-1.5 top-1.5 z-10 bg-base/80 backdrop-blur"
                    handleLabel={`Reorder image ${index + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={field.url} alt="" className="aspect-[4/3] w-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove image ${index + 1}`}
                      onClick={() => gallery.remove(index)}
                      className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-md bg-base/80 text-ink-dim backdrop-blur hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                    <input
                      aria-label={`Caption for image ${index + 1}`}
                      placeholder="Caption / alt text"
                      className="w-full border-t border-line bg-transparent px-2.5 py-2 text-xs outline-none placeholder:text-ink-faint focus:bg-surface-2"
                      {...register(`gallery.${index}.alt`)}
                    />
                  </SortableRow>
                )}
              </SortableList>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-4">
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm">Featured</span>
                  <span className="block text-xs text-ink-faint">Show on the homepage</span>
                </span>
                <Controller
                  control={control}
                  name="featured"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Featured" />
                  )}
                />
              </label>

              <div className="space-y-2 border-t border-line pt-4">
                <Button type="button" className="w-full" disabled={pending} onClick={() => submit("published")}>
                  {pending && intent === "published" ? <Loader2 className="animate-spin" /> : null}
                  {status === "published" ? "Update live project" : "Publish"}
                </Button>
                <Button type="button" variant="outline" className="w-full" disabled={pending} onClick={() => submit("draft")}>
                  {pending && intent === "draft" ? <Loader2 className="animate-spin" /> : null}
                  {status === "published" ? "Unpublish (move to draft)" : "Save draft"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" disabled={pending} onClick={() => submit("preview")}>
                  {pending && intent === "preview" ? <Loader2 className="animate-spin" /> : <Eye />}
                  Save &amp; preview
                </Button>
              </div>
              <p className="text-xs text-ink-faint">{isDirty ? "Unsaved changes" : "No unsaved changes"}</p>
            </div>
          </Panel>

          <Panel title="Cover" description="Shown on cards and at the top of the case study. Without one, a generated diagram is used.">
            <div className="space-y-4">
              <Field label="Cover image">
                <Controller
                  control={control}
                  name="cover_url"
                  render={({ field }) => (
                    <MediaField label="Cover image" value={field.value || null} onChange={(url) => field.onChange(url ?? "")} />
                  )}
                />
              </Field>
              <Field label="Cover video (optional)" hint="A short muted loop. Replaces the image where video can play.">
                <Controller
                  control={control}
                  name="cover_video_url"
                  render={({ field }) => (
                    <MediaField
                      label="Cover video"
                      accept={["video"]}
                      value={field.value || null}
                      onChange={(url) => field.onChange(url ?? "")}
                    />
                  )}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Links">
            <div className="space-y-4">
              <Field label="GitHub URL" htmlFor="github_url" error={errors.github_url?.message}>
                <input id="github_url" type="url" className="field-input" placeholder="https://github.com/…" {...register("github_url")} />
              </Field>
              <Field label="Live demo URL" htmlFor="live_url" error={errors.live_url?.message}>
                <input id="live_url" type="url" className="field-input" placeholder="https://…" {...register("live_url")} />
              </Field>
            </div>
          </Panel>

          {project ? (
            <Panel title="Danger zone">
              <ConfirmDelete
                label="Delete project"
                title={`Delete "${project.title}"?`}
                description="The case study and its content sections will be removed."
                pending={pending}
                onConfirm={() =>
                  startTransition(async () => {
                    const result = await deleteProject(project.id);
                    if (!result.ok) return void toast.error(result.error);
                    toast.success("Project deleted");
                    router.replace("/admin/projects");
                  })
                }
              />
            </Panel>
          ) : null}
        </div>
      </div>

      <Modal open={galleryOpen} onClose={() => setGalleryOpen(false)} title="Add gallery images" size="xl">
        {galleryOpen ? (
          <MediaLibrary
            accept={["image"]}
            multiple
            onSelect={(assets) => {
              assets.forEach((asset) => gallery.append({ url: asset.url, alt: asset.alt }));
              setGalleryOpen(false);
            }}
          />
        ) : null}
      </Modal>
    </form>
  );
}

/** True when `key` is the single item that was dragged from `before` to `after`. */
function isMoved(before: string[], after: string[], key: string) {
  const without = (list: string[]) => list.filter((item) => item !== key);
  return before.indexOf(key) !== after.indexOf(key) && without(before).join() === without(after).join();
}
