import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { Tables } from "@/types/database";

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
  sectionRow: {
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 4,
  },
  colTitle: { flexGrow: 1, flexBasis: 0 },
  colQty: { width: 60, textAlign: "right" },
  colPrice: { width: 80, textAlign: "right" },
  colAmount: { width: 80, textAlign: "right" },
  th: { fontSize: 8, textTransform: "uppercase", color: "#888888", letterSpacing: 0.5 },
  itemDescription: { fontSize: 8.5, color: "#777777", marginTop: 2 },
  totals: { alignSelf: "flex-end", width: 220, marginTop: 4 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { color: "#666666" },
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

export type QuotationPdfOrg = Pick<
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

export type QuotationPdfClient = Pick<Tables<"clients">, "name" | "email">;

export type QuotationPdfData = {
  quotation: Pick<
    Tables<"quotations">,
    | "quotation_number"
    | "issue_date"
    | "valid_until"
    | "currency"
    | "subtotal"
    | "discount_total"
    | "tax_total"
    | "grand_total"
    | "scope_of_work"
    | "deliverables"
    | "timeline"
    | "assumptions"
    | "exclusions"
    | "terms"
  >;
  items: Tables<"quotation_items">[];
  organization: QuotationPdfOrg | null;
  client: QuotationPdfClient | null;
};

function orgAddress(org: QuotationPdfOrg | null): string {
  if (!org) return "";
  return [org.address_line_1, org.address_line_2, [org.city, org.state, org.pincode].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join("\n");
}

export function QuotationPdfDocument({ quotation, items, organization, client }: QuotationPdfData) {
  const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order);
  const hasBankDetails = organization?.bank_account_number || organization?.upi_id;

  return (
    <Document
      title={`Quotation ${quotation.quotation_number}`}
      author={organization?.name ?? "Billflow"}
    >
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
            <Text style={styles.docTitle}>QUOTATION</Text>
            <Text style={styles.docNumber}>{quotation.quotation_number}</Text>
            <Text style={styles.docNumber}>Issued {quotation.issue_date}</Text>
            {quotation.valid_until && (
              <Text style={styles.docNumber}>Valid until {quotation.valid_until}</Text>
            )}
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Prepared for</Text>
            <Text>{client?.name ?? ""}</Text>
            {client?.email && <Text style={styles.muted}>{client.email}</Text>}
          </View>
        </View>

        {quotation.scope_of_work && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scope of work</Text>
            <Text style={styles.sectionBody}>{quotation.scope_of_work}</Text>
          </View>
        )}
        {quotation.deliverables && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deliverables</Text>
            <Text style={styles.sectionBody}>{quotation.deliverables}</Text>
          </View>
        )}
        {quotation.timeline && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <Text style={styles.sectionBody}>{quotation.timeline}</Text>
          </View>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colTitle, styles.th]}>Item</Text>
            <Text style={[styles.colQty, styles.th]}>Qty</Text>
            <Text style={[styles.colPrice, styles.th]}>Unit price</Text>
            <Text style={[styles.colAmount, styles.th]}>Amount</Text>
          </View>
          {sortedItems.map((item) =>
            item.type === "section" ? (
              <View key={item.id} style={styles.sectionRow}>
                <Text style={{ fontWeight: 700 }}>{item.title}</Text>
              </View>
            ) : (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.colTitle}>
                  <Text>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}
                </View>
                <Text style={styles.colQty}>
                  {item.quantity} {item.unit ?? ""}
                </Text>
                <Text style={styles.colPrice}>
                  {formatMoney(item.unit_price, quotation.currency)}
                </Text>
                <Text style={styles.colAmount}>
                  {formatMoney(item.line_total, quotation.currency)}
                </Text>
              </View>
            ),
          )}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{formatMoney(quotation.subtotal, quotation.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount</Text>
            <Text>-{formatMoney(quotation.discount_total, quotation.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text>{formatMoney(quotation.tax_total, quotation.currency)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatMoney(quotation.grand_total, quotation.currency)}
            </Text>
          </View>
        </View>

        {quotation.assumptions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assumptions</Text>
            <Text style={styles.sectionBody}>{quotation.assumptions}</Text>
          </View>
        )}
        {quotation.exclusions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exclusions</Text>
            <Text style={styles.sectionBody}>{quotation.exclusions}</Text>
          </View>
        )}
        {quotation.terms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms</Text>
            <Text style={styles.sectionBody}>{quotation.terms}</Text>
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
