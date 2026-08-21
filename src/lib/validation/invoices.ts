import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().trim().min(1, "Description is required").max(300),
  quantity: z.coerce.number().min(0).default(1),
  unit: z.string().trim().max(30).optional().or(z.literal("")),
  unitPrice: z.coerce.number().min(0).default(0),
  discountType: z.enum(["percentage", "fixed"]).nullable().default(null),
  discountValue: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  taxType: z.enum(["cgst_sgst", "igst", "none"]).default("none"),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export const invoiceDetailsSchema = z.object({
  clientId: z.string().uuid("Select a client"),
  projectId: z.string().uuid().optional().or(z.literal("")),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().optional().or(z.literal("")),
  poNumber: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  terms: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type InvoiceDetailsInput = z.infer<typeof invoiceDetailsSchema>;

export const saveInvoiceItemsSchema = z.array(invoiceItemSchema);

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  paymentMethod: z.enum(["bank_transfer", "upi", "razorpay", "cash", "other"]),
  paymentReference: z.string().trim().max(200).optional().or(z.literal("")),
  paidAt: z.string().min(1, "Payment date is required"),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
