import { z } from "zod";

export const quotationItemSchema = z.object({
  id: z.string().uuid().optional(), // absent for new rows
  type: z.enum(["section", "item"]),
  title: z.string().trim().min(1, "Title is required").max(300),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  quantity: z.coerce.number().min(0).default(1),
  unit: z.string().trim().max(30).optional().or(z.literal("")),
  unitPrice: z.coerce.number().min(0).default(0),
  discountType: z.enum(["percentage", "fixed"]).nullable().default(null),
  discountValue: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

export type QuotationItemInput = z.infer<typeof quotationItemSchema>;

export const quotationDetailsSchema = z.object({
  clientId: z.string().uuid("Select a client"),
  issueDate: z.string().min(1, "Issue date is required"),
  validUntil: z.string().optional().or(z.literal("")),
  scopeOfWork: z.string().trim().max(5000).optional().or(z.literal("")),
  deliverables: z.string().trim().max(5000).optional().or(z.literal("")),
  timeline: z.string().trim().max(2000).optional().or(z.literal("")),
  assumptions: z.string().trim().max(2000).optional().or(z.literal("")),
  exclusions: z.string().trim().max(2000).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  terms: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type QuotationDetailsInput = z.infer<typeof quotationDetailsSchema>;

export const saveQuotationItemsSchema = z.object({
  items: z.array(quotationItemSchema),
});

export const quotationApprovalSchema = z.object({
  action: z.enum(["accepted", "rejected", "changes_requested"]),
  clientName: z.string().trim().min(1, "Your name is required").max(200),
  clientMessage: z.string().trim().max(2000).optional().or(z.literal("")),
});
