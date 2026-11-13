"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { Field, PageHeader, PairList, Panel, SaveBar, useAction } from "@/components/admin/kit";
import { MediaField } from "@/components/admin/media-library";
import { SortableList, SortableRow } from "@/components/admin/sortable";
import { Switch } from "@/components/ui/switch";
import { saveSettings } from "@/lib/admin/actions/content";
import { settingsSchema } from "@/lib/schemas";
import type { HomeSectionKey, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

type FormInput = z.input<typeof settingsSchema>;
type FormOutput = z.output<typeof settingsSchema>;

const SECTION_INFO: Record<HomeSectionKey, { name: string; note: string; fields: ("eyebrow" | "heading" | "body" | "cta")[] }> = {
  stack: { name: "Technology marquee", note: "Scrolling band of your skills. No text to edit.", fields: [] },
  featured: { name: "Featured work", note: "Featured projects grid.", fields: ["eyebrow", "heading", "body", "cta"] },
  principles: { name: "Principles rail", note: "Horizontal scroll of your technical philosophy.", fields: ["eyebrow", "heading", "body"] },
  capabilities: { name: "Capabilities", note: "Skill categories grid.", fields: ["eyebrow", "heading", "body", "cta"] },
  experience: { name: "Experience", note: "Most recent roles.", fields: ["eyebrow", "heading", "body", "cta"] },
  contact: { name: "Contact call-to-action", note: "Closing section before the footer.", fields: ["eyebrow", "heading", "body", "cta"] },
};

const PRESETS = [
  { name: "Ember", accent: "#FF6A3D", alt: "#8B9CFF" },
  { name: "Lime", accent: "#C8F560", alt: "#7DD3FC" },
  { name: "Ion", accent: "#7C8CFF", alt: "#F0ABFC" },
  { name: "Amber", accent: "#FFB224", alt: "#5EEAD4" },
  { name: "Mint", accent: "#5EEAD4", alt: "#FDA4AF" },
];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { run, pending } = useAction();
  const [expanded, setExpanded] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { ...settings, hero_media_url: settings.hero_media_url ?? "" },
  });

  const sections = useFieldArray({ control, name: "home_sections", keyName: "rowId" });
  const nav = useFieldArray({ control, name: "nav", keyName: "rowId" });
  const accent = useWatch({ control, name: "accent" });
  const accentAlt = useWatch({ control, name: "accent_alt" });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        run(() => saveSettings(values), {
          onSuccess: () => reset({ ...values, hero_media_url: values.hero_media_url ?? "" }),
        }),
      )}
    >
      <PageHeader title="Settings" description="Navigation, homepage layout, colours, footer and search metadata." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel
            title="Homepage sections"
            description="Drag to change the order, switch sections on or off, and expand a section to edit its text. The hero is always first."
          >
            <SortableList
              items={sections.fields.map((field) => ({ ...field, id: field.rowId }))}
              className="space-y-2"
              onReorder={(next) => {
                const before = sections.fields.map((field) => field.rowId);
                const after = next.map((item) => item.rowId);
                const moved = before.find(
                  (key) =>
                    before.indexOf(key) !== after.indexOf(key) &&
                    before.filter((k) => k !== key).join() === after.filter((k) => k !== key).join(),
                );
                if (moved) sections.move(before.indexOf(moved), after.indexOf(moved));
              }}
            >
              {(field, index) => {
                const info = SECTION_INFO[field.key];
                const open = expanded === field.key;
                return (
                  <SortableRow
                    key={field.rowId}
                    id={field.rowId}
                    className="flex items-start gap-2 rounded-lg border border-line bg-base/40 p-2.5"
                    handleLabel={`Reorder ${info.name}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex min-h-8 items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{info.name}</p>
                          <p className="truncate text-xs text-ink-faint">{info.note}</p>
                        </div>
                        <Controller
                          control={control}
                          name={`home_sections.${index}.visible`}
                          render={({ field: visible }) => (
                            <Switch checked={visible.value} onCheckedChange={visible.onChange} aria-label={`Show ${info.name}`} />
                          )}
                        />
                        {info.fields.length > 0 ? (
                          <button
                            type="button"
                            aria-expanded={open}
                            aria-label={`Edit ${info.name} text`}
                            onClick={() => setExpanded(open ? null : field.key)}
                            className="flex size-8 items-center justify-center rounded-md text-ink-dim hover:bg-surface-2 hover:text-ink"
                          >
                            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
                          </button>
                        ) : (
                          <span className="size-8" />
                        )}
                      </div>

                      {/* Kept mounted so values register; hidden when collapsed. */}
                      <div className={cn("mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2", !open && "hidden")}>
                        {info.fields.includes("eyebrow") ? (
                          <Field label="Eyebrow label" htmlFor={`s-${index}-eyebrow`}>
                            <input id={`s-${index}-eyebrow`} className="field-input" {...register(`home_sections.${index}.eyebrow`)} />
                          </Field>
                        ) : null}
                        {info.fields.includes("heading") ? (
                          <Field label="Heading" htmlFor={`s-${index}-heading`} hint="*asterisks* = italic accent" className="sm:col-span-2">
                            <input id={`s-${index}-heading`} className="field-input" {...register(`home_sections.${index}.heading`)} />
                          </Field>
                        ) : null}
                        {info.fields.includes("body") ? (
                          <Field label="Supporting text" htmlFor={`s-${index}-body`} className="sm:col-span-2">
                            <textarea id={`s-${index}-body`} rows={2} className="field-input" {...register(`home_sections.${index}.body`)} />
                          </Field>
                        ) : null}
                        {info.fields.includes("cta") ? (
                          <>
                            <Field label="Button label" htmlFor={`s-${index}-cta`}>
                              <input id={`s-${index}-cta`} className="field-input" {...register(`home_sections.${index}.cta_label`)} />
                            </Field>
                            <Field
                              label="Button link"
                              htmlFor={`s-${index}-href`}
                              error={errors.home_sections?.[index]?.cta_href?.message}
                            >
                              <input id={`s-${index}-href`} className="field-input font-mono" placeholder="/work" {...register(`home_sections.${index}.cta_href`)} />
                            </Field>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </SortableRow>
                );
              }}
            </SortableList>
          </Panel>

          <Panel title="Hero buttons" description="Leave a label empty to hide that button.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary label" htmlFor="cta-pl">
                <input id="cta-pl" className="field-input" {...register("hero_cta.primary_label")} />
              </Field>
              <Field label="Primary link" htmlFor="cta-ph" error={errors.hero_cta?.primary_href?.message}>
                <input id="cta-ph" className="field-input font-mono" {...register("hero_cta.primary_href")} />
              </Field>
              <Field label="Secondary label" htmlFor="cta-sl">
                <input id="cta-sl" className="field-input" {...register("hero_cta.secondary_label")} />
              </Field>
              <Field label="Secondary link" htmlFor="cta-sh" error={errors.hero_cta?.secondary_href?.message}>
                <input id="cta-sh" className="field-input font-mono" {...register("hero_cta.secondary_href")} />
              </Field>
            </div>
          </Panel>

          <Panel title="Navigation" description="Links in the header and footer. Drag to reorder.">
            <SortableList
              items={nav.fields.map((field) => ({ ...field, id: field.rowId }))}
              className="space-y-2"
              onReorder={(next) => {
                const before = nav.fields.map((field) => field.rowId);
                const after = next.map((item) => item.rowId);
                const moved = before.find(
                  (key) =>
                    before.indexOf(key) !== after.indexOf(key) &&
                    before.filter((k) => k !== key).join() === after.filter((k) => k !== key).join(),
                );
                if (moved) nav.move(before.indexOf(moved), after.indexOf(moved));
              }}
            >
              {(field, index) => (
                <SortableRow key={field.rowId} id={field.rowId} className="flex items-center gap-2">
                  <input
                    aria-label={`Navigation label ${index + 1}`}
                    placeholder="Label"
                    aria-invalid={!!errors.nav?.[index]?.label}
                    className="field-input"
                    {...register(`nav.${index}.label`)}
                  />
                  <input
                    aria-label={`Navigation link ${index + 1}`}
                    placeholder="/path or https://…"
                    aria-invalid={!!errors.nav?.[index]?.href}
                    className="field-input font-mono"
                    {...register(`nav.${index}.href`)}
                  />
                  <Controller
                    control={control}
                    name={`nav.${index}.visible`}
                    render={({ field: visible }) => (
                      <Switch checked={visible.value} onCheckedChange={visible.onChange} aria-label={`Show navigation item ${index + 1}`} />
                    )}
                  />
                  <button
                    type="button"
                    aria-label={`Remove navigation item ${index + 1}`}
                    onClick={() => nav.remove(index)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-ink-dim hover:text-destructive"
                  >
                    ×
                  </button>
                </SortableRow>
              )}
            </SortableList>
            {nav.fields.length < 8 ? (
              <button
                type="button"
                onClick={() => nav.append({ label: "", href: "", visible: true })}
                className="mt-3 text-xs text-ink-dim underline-offset-4 hover:text-ink hover:underline"
              >
                + Add link
              </button>
            ) : null}
            {errors.nav ? <p className="mt-2 text-xs text-destructive">Each link needs a label and a path (/work) or full URL.</p> : null}
          </Panel>

          <Panel title="Footer">
            <div className="space-y-4">
              <Field label="Headline" htmlFor="footer-headline" hint="*asterisks* = italic accent">
                <input id="footer-headline" className="field-input" {...register("footer.headline")} />
              </Field>
              <Field label="Small print" htmlFor="footer-note">
                <input id="footer-note" className="field-input" {...register("footer.note")} />
              </Field>
              <Field label="Extra links" hint="Shown after your social profiles.">
                <Controller
                  control={control}
                  name="footer.links"
                  render={({ field }) => (
                    <PairList
                      value={field.value ?? []}
                      onChange={field.onChange}
                      blank={{ label: "", url: "" }}
                      addLabel="Add link"
                      fields={[
                        { key: "label", label: "Label" },
                        { key: "url", label: "URL", placeholder: "https://…" },
                      ]}
                    />
                  )}
                />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Accent colours" description="Drive links, highlights, buttons and the generative artwork across the whole site.">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setValue("accent", preset.accent, { shouldDirty: true });
                      setValue("accent_alt", preset.alt, { shouldDirty: true });
                    }}
                    aria-pressed={accent?.toUpperCase() === preset.accent}
                    className="flex items-center gap-2 rounded-full border border-line px-2.5 py-1 text-xs hover:border-line-strong aria-pressed:border-ink"
                  >
                    <span className="flex">
                      <span className="size-3 rounded-full" style={{ background: preset.accent }} />
                      <span className="-ml-1 size-3 rounded-full" style={{ background: preset.alt }} />
                    </span>
                    {preset.name}
                  </button>
                ))}
              </div>

              {(["accent", "accent_alt"] as const).map((name) => (
                <Field
                  key={name}
                  label={name === "accent" ? "Primary accent" : "Secondary accent"}
                  htmlFor={name}
                  error={errors[name]?.message}
                >
                  <div className="flex gap-2">
                    <input
                      type="color"
                      aria-label={`${name === "accent" ? "Primary" : "Secondary"} accent picker`}
                      value={/^#[0-9A-Fa-f]{6}$/.test((name === "accent" ? accent : accentAlt) ?? "") ? (name === "accent" ? accent : accentAlt) : "#000000"}
                      onChange={(event) => setValue(name, event.target.value.toUpperCase(), { shouldDirty: true, shouldValidate: true })}
                      className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
                    />
                    <input id={name} className="field-input font-mono uppercase" maxLength={7} aria-invalid={!!errors[name]} {...register(name)} />
                  </div>
                </Field>
              ))}

              <div
                className="rounded-lg border border-line bg-base p-4"
                style={{ ["--signal" as string]: accent, ["--signal-alt" as string]: accentAlt }}
              >
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-faint">Preview</p>
                <p className="mt-2 text-xl font-medium tracking-tight">
                  Systems that <span className="accent-serif">hold up.</span>
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex h-7 items-center rounded-full bg-signal px-3 text-xs font-medium text-background">Button</span>
                  <span className="size-2 rounded-full bg-signal-alt" />
                  <span className="text-xs text-ink-dim underline decoration-signal underline-offset-4">Link</span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Hero background" description="An image or a short muted video loop behind the hero. Without one, the animated topology canvas is shown.">
            <Controller
              control={control}
              name="hero_media_url"
              render={({ field }) => (
                <MediaField
                  label="Hero background"
                  accept={["image", "video"]}
                  value={field.value || null}
                  onChange={(url, asset) => {
                    field.onChange(url ?? "");
                    setValue(
                      "hero_media_type",
                      url ? (asset?.mime_type.startsWith("video/") || /\.(mp4|webm)$/i.test(url) ? "video" : "image") : null,
                      { shouldDirty: true },
                    );
                  }}
                />
              )}
            />
          </Panel>

          <Panel title="Search & sharing" description="Used for the browser tab, search results and link previews.">
            <div className="space-y-4">
              <Field label="Site title" htmlFor="seo_title" error={errors.seo_title?.message}>
                <input id="seo_title" className="field-input" {...register("seo_title")} />
              </Field>
              <Field label="Description" htmlFor="seo_description" error={errors.seo_description?.message}>
                <textarea id="seo_description" rows={3} className="field-input" {...register("seo_description")} />
              </Field>
            </div>
          </Panel>
        </div>
      </div>

      <SaveBar pending={pending} dirty={isDirty} />
    </form>
  );
}
