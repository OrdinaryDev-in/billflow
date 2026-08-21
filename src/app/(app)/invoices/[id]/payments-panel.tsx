"use client";

import { useActionState, useTransition } from "react";
import { recordPayment, deletePayment } from "@/actions/payments";
import type { ActionState } from "@/actions/auth";
import { Field, FormMessage, Select, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatCurrency } from "@/lib/calculations/quotation";
import type { Tables } from "@/types/database";

const initialState: ActionState = {};

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank transfer",
  upi: "UPI",
  razorpay: "Razorpay",
  cash: "Cash",
  other: "Other",
};

export function PaymentsPanel({
  invoiceId,
  organizationId,
  currency,
  balanceDue,
  payments,
  disabled,
}: {
  invoiceId: string;
  organizationId: string;
  currency: string;
  balanceDue: number;
  payments: Tables<"payments">[];
  disabled: boolean;
}) {
  const action = recordPayment.bind(null, invoiceId, organizationId);
  const [state, formAction] = useActionState(action, initialState);
  const [isPending, startTransition] = useTransition();

  const sorted = [...payments].sort(
    (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime(),
  );

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-text-primary">Payments</h2>

      {sorted.length > 0 && (
        <ul className="flex flex-col gap-2">
          {sorted.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-md border border-border-default px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium tabular-nums text-text-primary">
                  {formatCurrency(p.amount, currency)}
                </p>
                <p className="text-xs text-text-tertiary">
                  {METHOD_LABELS[p.payment_method] ?? p.payment_method} ·{" "}
                  {new Date(p.paid_at).toLocaleDateString("en-IN")}
                  {p.payment_reference && <> · Ref: {p.payment_reference}</>}
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => deletePayment(invoiceId, p.id))}
                className="rounded px-1.5 py-1 text-xs text-danger hover:bg-danger/10"
                aria-label="Delete payment"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {!disabled && balanceDue > 0 && (
        <form
          action={formAction}
          className="grid grid-cols-1 gap-3 border-t border-border-default pt-4 sm:grid-cols-4"
        >
          <Field label="Amount (₹)" htmlFor="amount">
            <TextInput
              id="amount"
              name="amount"
              type="number"
              step="any"
              min={0}
              defaultValue={balanceDue}
              required
            />
          </Field>
          <Field label="Method" htmlFor="paymentMethod">
            <Select id="paymentMethod" name="paymentMethod" defaultValue="bank_transfer">
              <option value="bank_transfer">Bank transfer</option>
              <option value="upi">UPI</option>
              <option value="razorpay">Razorpay</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Reference" htmlFor="paymentReference">
            <TextInput id="paymentReference" name="paymentReference" placeholder="UTR / txn ID" />
          </Field>
          <Field label="Paid on" htmlFor="paidAt">
            <TextInput
              id="paidAt"
              name="paidAt"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </Field>
          <div className="sm:col-span-4">
            <FormMessage error={state.error} success={state.message} />
          </div>
          <div className="sm:col-span-4">
            <SubmitButton className="w-auto px-4" pendingText="Recording…">
              Record payment
            </SubmitButton>
          </div>
        </form>
      )}
      {!disabled && balanceDue <= 0 && (
        <p className="border-t border-border-default pt-4 text-sm text-success">
          This invoice is fully paid.
        </p>
      )}
    </div>
  );
}
