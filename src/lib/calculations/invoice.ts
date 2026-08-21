/**
 * GST place-of-supply helper for invoices.
 *
 * Simplified rule for the MVP: if the client's state matches the
 * organization's state, the supply is intra-state (CGST+SGST, split evenly);
 * otherwise it's inter-state (IGST, full rate). Falls back to "none" when
 * either state is unknown or the organization isn't GST-registered.
 */
export type TaxType = "cgst_sgst" | "igst" | "none";

export function determineTaxType(params: {
  gstEnabled: boolean;
  organizationState?: string | null;
  clientState?: string | null;
}): TaxType {
  if (!params.gstEnabled) return "none";
  if (!params.organizationState || !params.clientState) return "none";
  return params.organizationState.trim().toLowerCase() ===
    params.clientState.trim().toLowerCase()
    ? "cgst_sgst"
    : "igst";
}

export function taxTypeLabel(type: TaxType): string {
  switch (type) {
    case "cgst_sgst":
      return "CGST + SGST";
    case "igst":
      return "IGST";
    default:
      return "No tax";
  }
}
