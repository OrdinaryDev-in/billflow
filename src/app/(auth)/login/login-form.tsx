"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, signInWithGoogle, type ActionState } from "@/actions/auth";
import { Field, FormMessage, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function LoginForm({ oauthError }: { oauthError?: string }) {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <div className="flex flex-col gap-4">
      <form action={signInWithGoogle}>
        <SubmitButton className="border border-border-default bg-surface text-text-primary hover:bg-surface-subtle">
          Continue with Google
        </SubmitButton>
      </form>

      <div className="flex items-center gap-3 text-xs text-text-tertiary">
        <div className="h-px flex-1 bg-border-default" />
        or
        <div className="h-px flex-1 bg-border-default" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="email">
          <TextInput id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <TextInput
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <div className="-mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>
        <FormMessage error={state.error ?? oauthError} />
        <SubmitButton pendingText="Logging in…">Log in</SubmitButton>
      </form>
    </div>
  );
}
