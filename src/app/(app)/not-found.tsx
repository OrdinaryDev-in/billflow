import Link from "next/link";

export default function AppNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm font-medium text-text-primary">Not found</p>
      <p className="max-w-sm text-sm text-text-secondary">
        This record doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Link
        href="/dashboard"
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
