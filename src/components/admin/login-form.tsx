"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/admin/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/schemas";

export function LoginForm() {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: LoginInput) {
    setError("");
    // On success the action redirects to /admin and never returns.
    const result = await signIn(values);
    if (result && !result.ok) setError(result.error);
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <Field label="Email" htmlFor="login-email" error={errors.email?.message}>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          aria-invalid={!!errors.email}
          className="field-input"
          {...register("email")}
        />
      </Field>
      <Field label="Password" htmlFor="login-password" error={errors.password?.message}>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          className="field-input"
          {...register("password")}
        />
      </Field>

      <p role="alert" aria-live="assertive" className="min-h-5 text-xs text-destructive">
        {error}
      </p>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  );
}
