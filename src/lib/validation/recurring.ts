import { z } from "zod";
import { invoiceItemSchema } from "@/lib/validation/invoices";

export const recurringScheduleDetailsSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  clientId: z.string().uuid("Select a client"),
  projectId: z.string().uuid().optional().or(z.literal("")),
  frequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
  intervalCount: z.coerce.number().int().min(1).default(1),
  nextRunAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().optional().or(z.literal("")),
  dueDays: z.coerce.number().int().min(0).default(7),
});

export type RecurringScheduleDetailsInput = z.infer<typeof recurringScheduleDetailsSchema>;

export const recurringTemplateSchema = z.object({
  items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  terms: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type RecurringTemplateInput = z.infer<typeof recurringTemplateSchema>;
