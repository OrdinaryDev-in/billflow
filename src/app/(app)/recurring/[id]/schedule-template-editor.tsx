"use client";

import { useMemo, useState, useTransition } from "react";
import { saveScheduleTemplate } from "@/actions/recurring";
import { calculateDocumentTotals, calculateLineItem, formatCurrency } from "@/lib/calculations/quotation";
import type { RecurringTemplateInput } from "@/lib/validation/recurring";

type EditableItem = {
  key: string;
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
  return `item-${keySeq}`;
}

function blankItem(): EditableItem {
  return {
    key: nextKey(),
    description: "",
    quantity: 1,
    unit: "",
    unitPrice: 0,
    discountType: null,
    discountValue: 0,
    taxRate: 0,
  };
}

export function ScheduleTemplateEditor({
  scheduleId,
  currency,
  template,
  readOnly,
}: {
  scheduleId: string;
  currency: string;
  template: RecurringTemplateInput;
  readOnly: boolean;
}) {
  const [items, setItems] = useState<EditableItem[]>(() =>
    template.items.length > 0
      ? template.items.map((i) => ({ key: nextKey(), ...i, unit: i.unit || "" }))
      : [blankItem()],
  );
  const [notes, setNotes] = useState(template.notes ?? "");
  const [terms, setTerms] = useState(template.terms ?? "");
  const [isPending, startTransition] = useTransition();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const totals = useMemo(
    () => calculateDocumentTotals(items.map((i) => ({ ...i, type: "item" as const }))),
    [items],
  );

  function update(key: string, patch: Partial<EditableItem>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function save() {
    setSavedMessage(null);
    startTransition(async () => {
      try {
        await saveScheduleTemplate(scheduleId, {
          items: items.map((i) => ({
            description: i.description || "Untitled item",
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
            discountType: i.discountType,
            discountValue: i.discountValue,
            taxRate: i.taxRate,
            taxType: "none",
          })),
          notes,
          terms,
        });
        setSavedMessage("Template saved.");
      } catch (err) {
        setSavedMessage(err instanceof Error ? err.message : "Could not save template.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <h2 className="text-sm font-semibold text-text-primary">Invoice template</h2>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, blankItem()])}
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
                    onClick={() => setItems((prev) => prev.filter((i) => i.key !== item.key))}
                    className="rounded px-1.5 py-1 text-xs text-danger hover:bg-danger/10"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                <NumberField label="Qty" value={item.quantity} onChange={(v) => update(item.key, { quantity: v })} disabled={readOnly} />
                <TextField label="Unit" value={item.unit} onChange={(v) => update(item.key, { unit: v })} disabled={readOnly} />
                <NumberField label="Unit price" value={item.unitPrice} onChange={(v) => update(item.key, { unitPrice: v })} disabled={readOnly} />
                <NumberField label="Tax %" value={item.taxRate} onChange={(v) => update(item.key, { taxRate: v })} disabled={readOnly} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-secondary">Amount</label>
                  <p className="rounded-md px-2 py-1.5 text-sm font-medium tabular-nums text-text-primary">
                    {formatCurrency(calc.lineTotal, currency)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 border-t border-border-default px-6 py-4">
        <div className="flex justify-between text-base font-semibold text-text-primary">
          <span>Total per invoice</span>
          <span className="tabular-nums">{formatCurrency(totals.grandTotal, currency)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border-default px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={readOnly}
            rows={2}
            className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Terms</label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            disabled={readOnly}
            rows={2}
            className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
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
            {isPending ? "Saving…" : "Save template"}
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
