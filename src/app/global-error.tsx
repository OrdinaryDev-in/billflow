"use client";

import { useEffect } from "react";

/**
 * Catches errors thrown by the root layout itself (rare — most errors are
 * caught by the nearer error.tsx boundaries). Must render its own <html>
 * and <body> since it replaces the root layout entirely.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#F8FAFC", color: "#0F172A" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "6rem 1rem",
            textAlign: "center",
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>Something went wrong.</p>
          <p style={{ fontSize: "0.875rem", color: "#475569", maxWidth: "24rem" }}>
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: "0.375rem",
              background: "#2563EB",
              color: "#F8FAFC",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
