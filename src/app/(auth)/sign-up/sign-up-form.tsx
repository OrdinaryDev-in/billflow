"use client";

import { useActionState } from "react";
import { signUp, signInWithGoogle, type ActionState } from "@/actions/auth";
import { Field, FormMessage, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, initialState);

  if (state.success) {
    return <FormMessage success={state.message} />;
  }

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
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" htmlFor="firstName">
            <TextInput id="firstName" name="firstName" autoComplete="given-name" required />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <TextInput id="lastName" name="lastName" autoComplete="family-name" />
          </Field>
        </div>
        <Field label="Email" htmlFor="email">
          <TextInput id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <TextInput
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        <FormMessage error={state.error} />
        <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
      </form>
    </div>
  );
}
