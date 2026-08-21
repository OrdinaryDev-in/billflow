"use client";

import { useEffect } from "react";

export default function RootError({
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
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-page px-4 py-24 text-center">
      <p className="text-sm font-medium text-text-primary">Something went wrong.</p>
      <p className="max-w-sm text-sm text-text-secondary">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover"
      >
        Try again
      </button>
    </div>
  );
}
