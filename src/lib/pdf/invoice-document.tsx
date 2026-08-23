import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { Tables } from "@/types/database";
import { taxTypeLabel, type TaxType } from "@/lib/calculations/invoice";

// Use PDF-safe built-in fonts (Helvetica) — @react-pdf/renderer's default,
// no network fetch required at render time. Helvetica's built-in encoding
// has no ₹ glyph, so amounts use the ISO currency code instead of the
// symbol (formatMoney below) rather than embedding a Unicode font.
Font.registerHyphenationCallback((word) => [word]);

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 2,
  }).format(amount);
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  orgName: { fontSize: 14, fontWeight: 700 },
  muted: { color: "#666666" },
  docTitle: { fontSize: 18, fontWeight: 700, textAlign: "right" },
  docNumber: { fontSize: 10, textAlign: "right", color: "#666666", marginTop: 2 },
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 20,
  },
  partyBlock: { flexGrow: 1, flexBasis: 0 },
  partyLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#888888",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 4 },
  sectionBody: { color: "#333333", lineHeight: 1.4 },
  table: { marginTop: 4, marginBottom: 12 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #dddddd",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #eeeeee",
    paddingVertical: 6,
  },
  colTitle: { flexGrow: 1, flexBasis: 0 },
  colQty: { width: 60, textAlign: "right" },
  colPrice: { width: 80, textAlign: "right" },
  colTax: { width: 70, textAlign: "right" },
  colAmount: { width: 80, textAlign: "right" },
  th: { fontSize: 8, textTransform: "uppercase", color: "#888888", letterSpacing: 0.5 },
  totals: { alignSelf: "flex-end", width: 220, marginTop: 4 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { color: "#666666" },
  paidRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  paidLabel: { color: "#1a7f4b" },
  paidValue: { color: "#1a7f4b" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1pt solid #dddddd",
    marginTop: 4,
    paddingTop: 6,
  },
  grandTotalLabel: { fontWeight: 700 },
  grandTotalValue: { fontWeight: 700 },
  bankBlock: { marginTop: 20, padding: 12, backgroundColor: "#f7f7f7", borderRadius: 4 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#aaaaaa",
  },
});

export type InvoicePdfOrg = Pick<
  Tables<"organizations">,
  | "name"
  | "email"
  | "phone"
  | "gstin"
  | "address_line_1"
  | "address_line_2"
  | "city"
  | "state"
  | "pincode"
  | "bank_account_name"
  | "bank_account_number"
  | "bank_ifsc"
  | "bank_name"
  | "upi_id"
>;

export type InvoicePdfClient = Pick<Tables<"clients">, "name" | "email">;

export type InvoicePdfData = {
  invoice: Pick<
    Tables<"invoices">,
    | "invoice_number"
    | "issue_date"
    | "due_date"
    | "po_number"
    | "currency"
    | "subtotal"
    | "discount_total"
    | "tax_total"
    | "grand_total"
    | "amount_paid"
    | "balance_due"
    | "notes"
    | "terms"
  >;
  items: Tables<"invoice_items">[];
  organization: InvoicePdfOrg | null;
  client: InvoicePdfClient | null;
};

function orgAddress(org: InvoicePdfOrg | null): string {
  if (!org) return "";
  return [org.address_line_1, org.address_line_2, [org.city, org.state, org.pincode].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join("\n");
}

export function InvoicePdfDocument({ invoice, items, organization, client }: InvoicePdfData) {
  const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order);
  const hasBankDetails = organization?.bank_account_number || organization?.upi_id;

  return (
    <Document title={`Invoice ${invoice.invoice_number}`} author={organization?.name ?? "Billflow"}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.orgName}>{organization?.name ?? ""}</Text>
            {orgAddress(organization)
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <Text key={i} style={styles.muted}>
                  {line}
                </Text>
              ))}
            {organization?.gstin && <Text style={styles.muted}>GSTIN: {organization.gstin}</Text>}
            {organization?.email && <Text style={styles.muted}>{organization.email}</Text>}
          </View>
          <View>
            <Text style={styles.docTitle}>INVOICE</Text>
            <Text style={styles.docNumber}>{invoice.invoice_number}</Text>
            <Text style={styles.docNumber}>Issued {invoice.issue_date}</Text>
            {invoice.due_date && <Text style={styles.docNumber}>Due {invoice.due_date}</Text>}
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Billed to</Text>
            <Text>{client?.name ?? ""}</Text>
            {client?.email && <Text style={styles.muted}>{client.email}</Text>}
          </View>
          {invoice.po_number && (
            <View style={styles.partyBlock}>
              <Text style={styles.partyLabel}>PO number</Text>
              <Text>{invoice.po_number}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colTitle, styles.th]}>Item</Text>
            <Text style={[styles.colQty, styles.th]}>Qty</Text>
            <Text style={[styles.colPrice, styles.th]}>Unit price</Text>
            <Text style={[styles.colTax, styles.th]}>Tax</Text>
            <Text style={[styles.colAmount, styles.th]}>Amount</Text>
          </View>
          {sortedItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colTitle}>{item.description}</Text>
              <Text style={styles.colQty}>
                {item.quantity} {item.unit ?? ""}
              </Text>
              <Text style={styles.colPrice}>{formatMoney(item.unit_price, invoice.currency)}</Text>
              <Text style={styles.colTax}>
                {item.tax_rate > 0
                  ? `${item.tax_rate}% ${taxTypeLabel((item.tax_type as TaxType) ?? "none")}`
                  : "—"}
              </Text>
              <Text style={styles.colAmount}>{formatMoney(item.line_total, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{formatMoney(invoice.subtotal, invoice.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount</Text>
            <Text>-{formatMoney(invoice.discount_total, invoice.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text>{formatMoney(invoice.tax_total, invoice.currency)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatMoney(invoice.grand_total, invoice.currency)}
            </Text>
          </View>
          {invoice.amount_paid > 0 && (
            <>
              <View style={styles.paidRow}>
                <Text style={styles.paidLabel}>Paid</Text>
                <Text style={styles.paidValue}>
                  -{formatMoney(invoice.amount_paid, invoice.currency)}
                </Text>
              </View>
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Balance due</Text>
                <Text style={styles.grandTotalValue}>
                  {formatMoney(invoice.balance_due, invoice.currency)}
                </Text>
              </View>
            </>
          )}
        </View>

        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.sectionBody}>{invoice.notes}</Text>
          </View>
        )}
        {invoice.terms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms</Text>
            <Text style={styles.sectionBody}>{invoice.terms}</Text>
          </View>
        )}

        {hasBankDetails && (
          <View style={styles.bankBlock}>
            <Text style={styles.sectionTitle}>Payment details</Text>
            {organization?.bank_account_number && (
              <>
                <Text style={styles.sectionBody}>{organization.bank_account_name}</Text>
                <Text style={styles.sectionBody}>{organization.bank_name}</Text>
                <Text style={styles.sectionBody}>A/C: {organization.bank_account_number}</Text>
                <Text style={styles.sectionBody}>IFSC: {organization.bank_ifsc}</Text>
              </>
            )}
            {organization?.upi_id && (
              <Text style={styles.sectionBody}>UPI: {organization.upi_id}</Text>
            )}
          </View>
        )}

        <Text style={styles.footer} fixed>
          Generated by Billflow
        </Text>
      </Page>
    </Document>
  );
}
