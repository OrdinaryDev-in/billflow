/**
 * Shared line-item calculation engine for quotations and invoices.
 *
 * Convention:
 * - subtotal        = sum(quantity * unit_price) across billable items
 * - discount_total   = sum(per-line discount amount)
 * - taxable amount   = (quantity * unit_price) - discount, per line
 * - tax_total        = sum(taxable * tax_rate / 100), per line
 * - grand_total      = (subtotal - discount_total) + tax_total
 * - a line's stored `line_total` is its taxable amount (post-discount, pre-tax)
 */

export type LineItemType = "section" | "item";
export type DiscountType = "percentage" | "fixed" | null;

export interface LineItemCalcInput {
  type: LineItemType;
  quantity: number;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
}

export interface LineItemCalcResult {
  base: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  lineTotal: number;
}

export function calculateLineItem(item: LineItemCalcInput): LineItemCalcResult {
  if (item.type === "section") {
    return { base: 0, discountAmount: 0, taxableAmount: 0, taxAmount: 0, lineTotal: 0 };
  }

  const base = round2(item.quantity * item.unitPrice);
  const discountAmount = round2(
    item.discountType === "percentage"
      ? (base * (item.discountValue || 0)) / 100
      : Math.min(item.discountValue || 0, base),
  );
  const taxableAmount = round2(base - discountAmount);
  const taxAmount = round2((taxableAmount * (item.taxRate || 0)) / 100);

  return { base, discountAmount, taxableAmount, taxAmount, lineTotal: taxableAmount };
}

export interface DocumentTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export function calculateDocumentTotals(items: LineItemCalcInput[]): DocumentTotals {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const item of items) {
    const result = calculateLineItem(item);
    subtotal += result.base;
    discountTotal += result.discountAmount;
    taxTotal += result.taxAmount;
  }

  subtotal = round2(subtotal);
  discountTotal = round2(discountTotal);
  taxTotal = round2(taxTotal);
  const grandTotal = round2(subtotal - discountTotal + taxTotal);

  return { subtotal, discountTotal, taxTotal, grandTotal };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
