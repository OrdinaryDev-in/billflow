import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Business name is required").max(200),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const businessSettingsSchema = z.object({
  name: z.string().trim().min(1, "Business name is required").max(200),
  legalName: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  addressLine1: z.string().trim().max(200).optional().or(z.literal("")),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  pincode: z.string().trim().max(12).optional().or(z.literal("")),
  gstEnabled: z.coerce.boolean().default(false),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || gstinPattern.test(v), "Enter a valid 15-character GSTIN"),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || panPattern.test(v), "Enter a valid 10-character PAN"),
  bankAccountName: z.string().trim().max(200).optional().or(z.literal("")),
  bankAccountNumber: z.string().trim().max(40).optional().or(z.literal("")),
  bankIfsc: z.string().trim().toUpperCase().max(20).optional().or(z.literal("")),
  bankName: z.string().trim().max(200).optional().or(z.literal("")),
  upiId: z.string().trim().max(100).optional().or(z.literal("")),
  defaultPaymentTerms: z.string().trim().max(2000).optional().or(z.literal("")),
  invoicePrefix: z.string().trim().min(1).max(10).default("INV"),
  quotationPrefix: z.string().trim().min(1).max(10).default("QTN"),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;
