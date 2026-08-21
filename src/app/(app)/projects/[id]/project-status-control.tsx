"use client";

import { useTransition } from "react";
import { setProjectStatus } from "@/actions/projects";
import { Select } from "@/components/ui/field";

const STATUSES = ["active", "completed", "on_hold", "cancelled"] as const;

export function ProjectStatusControl({
  projectId,
  status,
}: {
  projectId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() =>
          setProjectStatus(projectId, e.target.value as (typeof STATUSES)[number]),
        )
      }
      className="w-auto capitalize"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s.replace("_", " ")}
        </option>
      ))}
    </Select>
  );
}
