"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ActionState } from "@/actions/auth";
import { Field, FormMessage, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return <FormMessage success={state.message} />;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Email" htmlFor="email">
        <TextInput id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <FormMessage error={state.error} />
      <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
    </form>
  );
}
