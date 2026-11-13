"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { Field, PageHeader, PairList, Panel, SaveBar, useAction } from "@/components/admin/kit";
import { MediaField } from "@/components/admin/media-library";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { saveProfile } from "@/lib/admin/actions/content";
import { profileSchema } from "@/lib/schemas";
import type { Profile } from "@/lib/types";

type FormInput = z.input<typeof profileSchema>;
type FormOutput = z.output<typeof profileSchema>;

export function ProfileForm({ profile }: { profile: Profile }) {
  const { run, pending } = useAction();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { ...profile, avatar_url: profile.avatar_url ?? "", resume_url: profile.resume_url ?? "" },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        run(() => saveProfile(values), {
          onSuccess: () => reset({ ...values, avatar_url: values.avatar_url ?? "", resume_url: values.resume_url ?? "" }),
        }),
      )}
    >
      <PageHeader title="Profile" description="Who you are. Used in the hero, About and Contact pages, the footer and page metadata." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="name" error={errors.name?.message}>
                <input id="name" className="field-input" aria-invalid={!!errors.name} {...register("name")} />
              </Field>
              <Field label="Professional title" htmlFor="title" error={errors.title?.message}>
                <input id="title" className="field-input" aria-invalid={!!errors.title} {...register("title")} />
              </Field>
              <Field label="Location" htmlFor="location" error={errors.location?.message}>
                <input id="location" className="field-input" placeholder="City, Country" {...register("location")} />
              </Field>
              <Field label="Timezone" htmlFor="timezone" error={errors.timezone?.message} hint="IANA name, e.g. Europe/Berlin. Drives the live clock.">
                <input id="timezone" className="field-input font-mono" {...register("timezone")} />
              </Field>
              <Field label="Availability line" htmlFor="availability" error={errors.availability?.message} hint="Small status chip in the hero. Leave empty to hide." className="sm:col-span-2">
                <input id="availability" className="field-input" {...register("availability")} />
              </Field>
            </div>
          </Panel>

          <Panel title="Hero">
            <div className="space-y-4">
              <Field
                label="Headline"
                htmlFor="hero_headline"
                error={errors.hero_headline?.message}
                hint="Wrap words in *asterisks* to set them in the italic accent style."
              >
                <textarea id="hero_headline" rows={2} className="field-input" aria-invalid={!!errors.hero_headline} {...register("hero_headline")} />
              </Field>
              <Field label="Description" htmlFor="hero_description" error={errors.hero_description?.message}>
                <textarea id="hero_description" rows={3} className="field-input" {...register("hero_description")} />
              </Field>
            </div>
          </Panel>

          <Panel title="About">
            <div className="space-y-4">
              <Field label="Introduction" htmlFor="about_intro" error={errors.about_intro?.message} hint="Large opening statement on the About page.">
                <textarea id="about_intro" rows={3} className="field-input" {...register("about_intro")} />
              </Field>
              <Field label="About text">
                <Controller
                  control={control}
                  name="about_body"
                  render={({ field }) => <RichTextEditor value={field.value ?? ""} onChange={field.onChange} ariaLabel="About text" />}
                />
              </Field>
              <Field label="Career journey">
                <Controller
                  control={control}
                  name="journey"
                  render={({ field }) => <RichTextEditor value={field.value ?? ""} onChange={field.onChange} ariaLabel="Career journey" />}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Areas of interest" description="Shown as a grid on the About page.">
            <Controller
              control={control}
              name="interests"
              render={({ field }) => (
                <PairList
                  value={field.value ?? []}
                  onChange={field.onChange}
                  blank={{ title: "", body: "" }}
                  addLabel="Add interest"
                  fields={[
                    { key: "title", label: "Title" },
                    { key: "body", label: "Description", multiline: true },
                  ]}
                />
              )}
            />
            {errors.interests ? <p className="mt-2 text-xs text-destructive">Each interest needs a title.</p> : null}
          </Panel>

          <Panel title="Technical philosophy" description="Shown in the horizontal rail on the homepage and as a list on the About page.">
            <Controller
              control={control}
              name="philosophy"
              render={({ field }) => (
                <PairList
                  value={field.value ?? []}
                  onChange={field.onChange}
                  blank={{ title: "", body: "" }}
                  addLabel="Add principle"
                  fields={[
                    { key: "title", label: "Principle" },
                    { key: "body", label: "Explanation", multiline: true },
                  ]}
                />
              )}
            />
            {errors.philosophy ? <p className="mt-2 text-xs text-destructive">Each principle needs a title.</p> : null}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Profile picture">
            <Controller
              control={control}
              name="avatar_url"
              render={({ field }) => (
                <MediaField label="Profile picture" value={field.value || null} onChange={(url) => field.onChange(url ?? "")} />
              )}
            />
          </Panel>

          <Panel title="Résumé" description="PDF offered as a download on the About and Contact pages.">
            <Controller
              control={control}
              name="resume_url"
              render={({ field }) => (
                <MediaField label="Résumé PDF" accept={["document"]} value={field.value || null} onChange={(url) => field.onChange(url ?? "")} />
              )}
            />
          </Panel>

          <Panel title="Contact">
            <div className="space-y-4">
              <Field label="Email" htmlFor="email" error={errors.email?.message}>
                <input id="email" type="email" className="field-input" aria-invalid={!!errors.email} {...register("email")} />
              </Field>
              <Field label="Contact page introduction" htmlFor="contact_intro" error={errors.contact_intro?.message}>
                <textarea id="contact_intro" rows={3} className="field-input" {...register("contact_intro")} />
              </Field>
            </div>
          </Panel>

          <Panel title="Social profiles">
            <Controller
              control={control}
              name="socials"
              render={({ field }) => (
                <PairList
                  value={field.value ?? []}
                  onChange={field.onChange}
                  blank={{ label: "", url: "" }}
                  addLabel="Add profile"
                  fields={[
                    { key: "label", label: "Label", placeholder: "GitHub" },
                    { key: "url", label: "URL", placeholder: "https://github.com/you" },
                  ]}
                />
              )}
            />
            {errors.socials ? <p className="mt-2 text-xs text-destructive">Each profile needs a label and a full URL.</p> : null}
          </Panel>
        </div>
      </div>

      <SaveBar pending={pending} dirty={isDirty} />
    </form>
  );
}
