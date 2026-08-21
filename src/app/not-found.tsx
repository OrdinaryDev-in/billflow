import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-page px-4 py-24 text-center">
      <p className="text-sm font-medium text-text-primary">Page not found</p>
      <p className="max-w-sm text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover"
      >
        Go home
      </Link>
    </div>
  );
}
