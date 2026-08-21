"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  pendingText,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? (pendingText ?? "Please wait…") : children}
    </button>
  );
}
