import { z } from "zod";

export const projectSchema = z.object({
  clientId: z.string().uuid("Select a client"),
  name: z.string().trim().min(1, "Project name is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  contractValue: z.coerce.number().min(0).default(0),
  billingType: z.enum(["full", "advance_balance", "milestone", "recurring"]).default("full"),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const milestoneSchema = z.object({
  name: z.string().trim().min(1, "Milestone name is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  amount: z.coerce.number().min(0),
  dueDate: z.string().optional().or(z.literal("")),
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;
