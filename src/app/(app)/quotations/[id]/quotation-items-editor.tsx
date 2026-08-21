"use client";

import { useMemo, useState, useTransition } from "react";
import { saveQuotationItems } from "@/actions/quotations";
import { calculateDocumentTotals, calculateLineItem, formatCurrency } from "@/lib/calculations/quotation";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database";

type EditableItem = {
  key: string;
  id?: string;
  type: "section" | "item";
  title: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountType: "percentage" | "fixed" | null;
  discountValue: number;
  taxRate: number;
};

let keySeq = 0;
function nextKey() {
  keySeq += 1;
  return `new-${keySeq}`;
}

function fromRow(row: Tables<"quotation_items">): EditableItem {
  return {
    key: row.id,
    id: row.id,
    type: row.type as "section" | "item",
    title: row.title,
    description: row.description ?? "",
    quantity: Number(row.quantity),
    unit: row.unit ?? "",
    unitPrice: Number(row.unit_price),
    discountType: (row.discount_type as "percentage" | "fixed" | null) ?? null,
    discountValue: Number(row.discount_value),
    taxRate: Number(row.tax_rate),
  };
}

function blankItem(type: "section" | "item"): EditableItem {
  return {
    key: nextKey(),
    type,
    title: "",
    description: "",
    quantity: 1,
    unit: "",
    unitPrice: 0,
    discountType: null,
    discountValue: 0,
    taxRate: 0,
  };
}

export function QuotationItemsEditor({
  quotationId,
  currency,
  initialItems,
  readOnly,
}: {
  quotationId: string;
  currency: string;
  initialItems: Tables<"quotation_items">[];
  readOnly: boolean;
}) {
  const [items, setItems] = useState<EditableItem[]>(() =>
    initialItems.length > 0 ? initialItems.map(fromRow) : [blankItem("item")],
  );
  const [isPending, startTransition] = useTransition();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const totals = useMemo(() => calculateDocumentTotals(items), [items]);

  function update(key: string, patch: Partial<EditableItem>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function move(key: string, direction: -1 | 1) {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.key === key);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function save() {
    setSavedMessage(null);
    startTransition(async () => {
      try {
        await saveQuotationItems(
          quotationId,
          items.map((i) => ({
            id: i.id,
            type: i.type,
            title: i.title || (i.type === "section" ? "Section" : "Untitled item"),
            description: i.description,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
            discountType: i.discountType,
            discountValue: i.discountValue,
            taxRate: i.taxRate,
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, blankItem("section")])}
              className="rounded-md border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-subtle"
            >
              Add section
            </button>
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, blankItem("item")])}
              className="rounded-md border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-subtle"
            >
              Add item
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 px-6">
        {items.map((item, index) => {
          const calc = calculateLineItem(item);
          return (
            <div
              key={item.key}
              className={cn(
                "rounded-md border border-border-default p-4",
                item.type === "section" && "bg-surface-subtle",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    value={item.title}
                    onChange={(e) => update(item.key, { title: e.target.value })}
                    placeholder={item.type === "section" ? "Section title" : "Item title"}
                    disabled={readOnly}
                    className={cn(
                      "w-full rounded-md border border-border-default bg-surface px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                      item.type === "section" && "font-semibold",
                    )}
                  />
                  {item.type === "item" && (
                    <textarea
                      value={item.description}
                      onChange={(e) => update(item.key, { description: e.target.value })}
                      placeholder="Description (optional)"
                      rows={1}
                      disabled={readOnly}
                      className="w-full rounded-md border border-border-default bg-surface px-2.5 py-1.5 text-xs text-text-secondary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(item.key, -1)}
                      disabled={index === 0}
                      className="rounded px-1.5 py-1 text-xs text-text-tertiary hover:bg-surface-subtle disabled:opacity-30"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(item.key, 1)}
                      disabled={index === items.length - 1}
                      className="rounded px-1.5 py-1 text-xs text-text-tertiary hover:bg-surface-subtle disabled:opacity-30"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.key)}
                      className="rounded px-1.5 py-1 text-xs text-danger hover:bg-danger/10"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {item.type === "item" && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
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
                </div>
              )}

              {item.type === "item" && (
                <p className="mt-2 text-right text-sm font-medium tabular-nums text-text-primary">
                  {formatCurrency(calc.lineTotal, currency)}
                  {calc.taxAmount > 0 && (
                    <span className="ml-1 text-xs font-normal text-text-tertiary">
                      + {formatCurrency(calc.taxAmount, currency)} tax
                    </span>
                  )}
                </p>
              )}
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
          <span className="tabular-nums">
            -{formatCurrency(totals.discountTotal, currency)}
          </span>
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
