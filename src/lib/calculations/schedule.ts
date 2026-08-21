export type ScheduleFrequency = "weekly" | "monthly" | "quarterly" | "yearly";

/** Advances a schedule's next-run date forward by one interval. Always
 * derived from the previous next_run_at (not "now"), so repeated calls in
 * the same window are idempotent-safe — see actions/recurring.ts. */
export function advanceScheduleDate(
  from: Date,
  frequency: ScheduleFrequency,
  intervalCount: number,
): Date {
  const next = new Date(from);
  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7 * intervalCount);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + intervalCount);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3 * intervalCount);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + intervalCount);
      break;
  }
  return next;
}

export const FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};
