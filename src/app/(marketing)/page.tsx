import Image from "next/image";
import Link from "next/link";

export default function MarketingHomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Image
        src="/brand/billflow-logo-primary.svg"
        alt="Billflow"
        width={180}
        height={45}
        className="mb-6"
        priority
      />
      <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
        Quote, bill and get paid.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-text-secondary">
        The easiest way for Indian software professionals to send quotations,
        manage project billing and collect payments — without the accounting
        jargon.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/sign-up"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover"
        >
          Get started free
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-border-default px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-subtle"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
