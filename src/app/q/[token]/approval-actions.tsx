"use client";

import { useState, useTransition } from "react";

type Mode = "idle" | "accept" | "reject" | "changes";

export function ApprovalActions({ token }: { token: string }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const actionForMode: Record<Exclude<Mode, "idle">, string> = {
    accept: "accepted",
    reject: "rejected",
    changes: "changes_requested",
  };

  function submit() {
    if (mode === "idle") return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/public/quotation/${token}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionForMode[mode],
          clientName: name,
          clientMessage: message,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong. Try again.");
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border-default bg-surface p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-text-primary">Thanks — your response was recorded.</p>
      </div>
    );
  }

  if (mode === "idle") {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border-default bg-surface p-6 shadow-sm sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => setMode("accept")}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-primary-hover"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => setMode("changes")}
          className="rounded-md border border-border-default px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-surface-subtle"
        >
          Request changes
        </button>
        <button
          type="button"
          onClick={() => setMode("reject")}
          className="rounded-md border border-border-default px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-surface-subtle"
        >
          Decline
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <p className="text-sm font-medium text-text-primary">
        {mode === "accept" && "Confirm acceptance"}
        {mode === "reject" && "Confirm decline"}
        {mode === "changes" && "Describe the changes you'd like"}
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={mode === "changes" ? "What would you like changed?" : "Optional message"}
        rows={3}
        className="rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !name.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Submitting…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setMode("idle")}
          className="rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
