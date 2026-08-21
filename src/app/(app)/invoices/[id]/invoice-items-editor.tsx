"use client";

import { useMemo, useState, useTransition } from "react";
import { saveInvoiceItems } from "@/actions/invoices";
import {
  calculateDocumentTotals,
  calculateLineItem,
  formatCurrency,
} from "@/lib/calculations/quotation";
import type { TaxType } from "@/lib/calculations/invoice";
import type { Tables } from "@/types/database";

type EditableItem = {
  key: string;
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountType: "percentage" | "fixed" | null;
  discountValue: number;
  taxRate: number;
  taxType: TaxType;
};

let keySeq = 0;
function nextKey() {
  keySeq += 1;
  return `new-${keySeq}`;
}

function fromRow(row: Tables<"invoice_items">, defaultTaxType: TaxType): EditableItem {
  return {
    key: row.id,
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity),
    unit: row.unit ?? "",
    unitPrice: Number(row.unit_price),
    discountType: (row.discount_type as "percentage" | "fixed" | null) ?? null,
    discountValue: Number(row.discount_value),
    taxRate: Number(row.tax_rate),
    taxType: (row.tax_type as TaxType) ?? defaultTaxType,
  };
}

function blankItem(defaultTaxType: TaxType): EditableItem {
  return {
    key: nextKey(),
    description: "",
    quantity: 1,
    unit: "",
    unitPrice: 0,
    discountType: null,
    discountValue: 0,
    taxRate: 0,
    taxType: defaultTaxType,
  };
}

export function InvoiceItemsEditor({
  invoiceId,
  currency,
  initialItems,
  defaultTaxType,
  readOnly,
}: {
  invoiceId: string;
  currency: string;
  initialItems: Tables<"invoice_items">[];
  defaultTaxType: TaxType;
  readOnly: boolean;
}) {
  const [items, setItems] = useState<EditableItem[]>(() =>
    initialItems.length > 0
      ? initialItems.map((r) => fromRow(r, defaultTaxType))
      : [blankItem(defaultTaxType)],
  );
  const [isPending, startTransition] = useTransition();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const totals = useMemo(
    () => calculateDocumentTotals(items.map((i) => ({ ...i, type: "item" as const }))),
    [items],
  );

  function update(key: string, patch: Partial<EditableItem>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function save() {
    setSavedMessage(null);
    startTransition(async () => {
      try {
        await saveInvoiceItems(
          invoiceId,
          items.map((i) => ({
            id: i.id,
            description: i.description || "Untitled item",
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
            discountType: i.discountType,
            discountValue: i.discountValue,
            taxRate: i.taxRate,
            taxType: i.taxType,
          })),
        );
        setSavedMessage("Line items saved.");
      } catch (err) {
        setSavedMessage(err instanceof Error ? err.message : "Could not save line items.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <h2 className="text-sm font-semibold text-text-primary">Line items</h2>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, blankItem(defaultTaxType)])}
            className="rounded-md border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-subtle"
          >
            Add item
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 px-6">
        {items.map((item) => {
          const calc = calculateLineItem({ ...item, type: "item" });
          return (
            <div key={item.key} className="rounded-md border border-border-default p-4">
              <div className="flex items-start gap-3">
                <input
                  value={item.description}
                  onChange={(e) => update(item.key, { description: e.target.value })}
                  placeholder="Item description"
                  disabled={readOnly}
                  className="flex-1 rounded-md border border-border-default bg-surface px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => remove(item.key)}
                    className="rounded px-1.5 py-1 text-xs text-danger hover:bg-danger/10"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-7">
                <NumberField
                  label="Qty"
                  value={item.quantity}
                  onChange={(v) => update(item.key, { quantity: v })}
                  disabled={readOnly}
                />
                <TextField
                  label="Unit"
                  value={item.unit}
                  onChange={(v) => update(item.key, { unit: v })}
                  disabled={readOnly}
                />
                <NumberField
                  label="Unit price"
                  value={item.unitPrice}
                  onChange={(v) => update(item.key, { unitPrice: v })}
                  disabled={readOnly}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-secondary">Discount</label>
                  <select
                    value={item.discountType ?? ""}
                    onChange={(e) =>
                      update(item.key, {
                        discountType: (e.target.value || null) as "percentage" | "fixed" | null,
                      })
                    }
                    disabled={readOnly}
                    className="rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">None</option>
                    <option value="percentage">%</option>
                    <option value="fixed">₹</option>
                  </select>
                </div>
                <NumberField
                  label="Discount val."
                  value={item.discountValue}
                  onChange={(v) => update(item.key, { discountValue: v })}
                  disabled={readOnly || !item.discountType}
                />
                <NumberField
                  label="Tax %"
                  value={item.taxRate}
                  onChange={(v) => update(item.key, { taxRate: v })}
                  disabled={readOnly}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-secondary">Tax type</label>
                  <select
                    value={item.taxType}
                    onChange={(e) => update(item.key, { taxType: e.target.value as TaxType })}
                    disabled={readOnly}
                    className="rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="none">None</option>
                    <option value="cgst_sgst">CGST+SGST</option>
                    <option value="igst">IGST</option>
                  </select>
                </div>
              </div>

              <p className="mt-2 text-right text-sm font-medium tabular-nums text-text-primary">
                {formatCurrency(calc.lineTotal, currency)}
                {calc.taxAmount > 0 && (
                  <span className="ml-1 text-xs font-normal text-text-tertiary">
                    + {formatCurrency(calc.taxAmount, currency)} tax
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 border-t border-border-default px-6 py-4">
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCurrency(totals.subtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Discount</span>
          <span className="tabular-nums">-{formatCurrency(totals.discountTotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Tax</span>
          <span className="tabular-nums">{formatCurrency(totals.taxTotal, currency)}</span>
        </div>
        <div className="flex justify-between border-t border-border-default pt-2 text-base font-semibold text-text-primary">
          <span>Total</span>
          <span className="tabular-nums">{formatCurrency(totals.grandTotal, currency)}</span>
        </div>
      </div>

      {!readOnly && (
        <div className="flex items-center gap-3 border-t border-border-default px-6 py-4">
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save line items"}
          </button>
          {savedMessage && <span className="text-sm text-text-secondary">{savedMessage}</span>}
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.valueAsNumber || 0)}
        disabled={disabled}
        className="rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary tabular-nums focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
