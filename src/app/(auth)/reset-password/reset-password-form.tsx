"use client";

import { useActionState } from "react";
import { resetPassword, type ActionState } from "@/actions/auth";
import { Field, FormMessage, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="New password" htmlFor="password">
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword">
        <TextInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <FormMessage error={state.error} />
      <SubmitButton pendingText="Updating…">Update password</SubmitButton>
    </form>
  );
}
