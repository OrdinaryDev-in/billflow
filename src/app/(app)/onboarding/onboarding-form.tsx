"use client";

import { useActionState } from "react";
import { createOrganization } from "@/actions/organizations";
import type { ActionState } from "@/actions/auth";
import { Field, FormMessage, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function OnboardingForm() {
  const [state, formAction] = useActionState(createOrganization, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Business name" htmlFor="name">
        <TextInput
          id="name"
          name="name"
          placeholder="Acme Software Studio"
          autoFocus
          required
        />
      </Field>
      <FormMessage error={state.error} />
      <SubmitButton pendingText="Creating…">Continue</SubmitButton>
    </form>
  );
}
