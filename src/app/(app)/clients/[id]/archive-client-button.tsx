"use client";

import { useTransition } from "react";
import { setClientStatus } from "@/actions/clients";

export function ArchiveClientButton({
  clientId,
  status,
}: {
  clientId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isActive = status === "active";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(() => setClientStatus(clientId, isActive ? "archived" : "active"))
      }
      className="rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-subtle disabled:opacity-60"
    >
      {isPending ? "Please wait…" : isActive ? "Archive client" : "Reactivate client"}
    </button>
  );
}
