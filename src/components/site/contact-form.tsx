"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { submitContact } from "@/app/(site)/contact/actions";
import { contactSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type FormInput = z.input<typeof contactSchema>;
type FormOutput = z.output<typeof contactSchema>;

export function ContactForm() {
  const mountedAt = useRef(0);
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", company_website: "", elapsed_ms: 0 },
  });

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  async function onSubmit(values: FormOutput) {
    setServerError("");
    const result = await submitContact({
      ...values,
      elapsed_ms: Math.round(performance.now() - mountedAt.current),
    });

    if (result.ok) {
      setStatus("sent");
      reset();
      return;
    }

    setServerError(result.error);
    for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
      if (messages?.[0]) setError(field as keyof FormInput, { message: messages[0] });
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-[26rem] flex-col items-start justify-center rounded-2xl border border-line bg-surface/60 p-8 md:p-12"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal text-background">
              <Check className="size-5" aria-hidden />
            </span>
            <h2 className="headline mt-8 !text-[clamp(1.75rem,3vw,2.75rem)]">Message sent.</h2>
            <p className="lede mt-4">Thank you for reaching out. I will reply as soon as I can.</p>
            <button type="button" className="btn btn-ghost mt-10" onClick={() => setStatus("idle")}>
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="grid gap-8 sm:grid-cols-2">
              <Field label="Name" error={errors.name?.message} id="contact-name">
                <input
                  id="contact-name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className={inputClass}
                  placeholder="Your name"
                  {...register("name")}
                />
              </Field>
              <Field label="Email" error={errors.email?.message} id="contact-email">
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className={inputClass}
                  placeholder="you@company.com"
                  {...register("email")}
                />
              </Field>
            </div>

            <Field label="Subject" optional error={errors.subject?.message} id="contact-subject">
              <input
                id="contact-subject"
                aria-invalid={!!errors.subject}
                className={inputClass}
                placeholder="What is this about?"
                {...register("subject")}
              />
            </Field>

            <Field label="Message" error={errors.message?.message} id="contact-message">
              <textarea
                id="contact-message"
                rows={6}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                className={cn(inputClass, "resize-y py-3 leading-relaxed")}
                placeholder="A few lines about the role, project or problem."
                {...register("message")}
              />
            </Field>

            {/* Honeypot: hidden from people and assistive tech, tempting for bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Company website
                <input type="text" tabIndex={-1} autoComplete="off" {...register("company_website")} />
              </label>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-60">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Sending
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowUpRight className="arrow size-4" aria-hidden />
                  </>
                )}
              </button>
              <p role="alert" aria-live="assertive" className="text-sm text-destructive">
                {serverError}
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  "w-full border-0 border-b border-line-strong bg-transparent px-0 py-2 text-lg text-ink placeholder:text-ink-faint transition-colors focus:border-signal focus:outline-none focus:ring-0 aria-[invalid=true]:border-destructive";

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label mb-3 flex items-center justify-between">
        {label}
        {optional ? <span className="normal-case tracking-normal">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
