"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/auth";
import { Field, FormMessage, Select, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Tables } from "@/types/database";

const initialState: ActionState = {};

export function WorkItemForm({
  action,
  workItem,
  submitLabel,
  onCancel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  workItem?: Tables<"work_items">;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field label="Title" htmlFor="title">
        <TextInput
          id="title"
          name="title"
          defaultValue={workItem?.title ?? ""}
          placeholder="Build homepage"
          required
          autoFocus
        />
      </Field>
      <Field label="Description" htmlFor="description">
        <TextArea
          id="description"
          name="description"
          rows={2}
          defaultValue={workItem?.description ?? ""}
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={workItem?.status ?? "todo"}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </Select>
        </Field>
        <Field label="Priority" htmlFor="priority">
          <Select id="priority" name="priority" defaultValue={workItem?.priority ?? "medium"}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>
        <Field label="Due date" htmlFor="dueDate">
          <TextInput id="dueDate" name="dueDate" type="date" defaultValue={workItem?.due_date ?? ""} />
        </Field>
      </div>

      <FormMessage error={state.error} success={state.message} />
      <div className="flex items-center gap-2">
        <SubmitButton className="w-auto px-4" pendingText="Saving…">
          {submitLabel}
        </SubmitButton>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
