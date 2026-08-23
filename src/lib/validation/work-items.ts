import { z } from "zod";

export const workItemStatuses = ["todo", "in_progress", "blocked", "completed"] as const;
export const workItemPriorities = ["low", "medium", "high", "urgent"] as const;

export type WorkItemStatus = (typeof workItemStatuses)[number];
export type WorkItemPriority = (typeof workItemPriorities)[number];

export const workItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  status: z.enum(workItemStatuses).default("todo"),
  priority: z.enum(workItemPriorities).default("medium"),
  dueDate: z.string().optional().or(z.literal("")),
});

export type WorkItemInput = z.infer<typeof workItemSchema>;
