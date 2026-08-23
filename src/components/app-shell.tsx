import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import { MobileNav } from "@/components/mobile-nav";
import { NavLink } from "@/components/nav-link";
import { SubmitButton } from "@/components/ui/submit-button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/quotations", label: "Quotations" },
  { href: "/projects", label: "Projects" },
  { href: "/invoices", label: "Invoices" },
  { href: "/payments", label: "Payments" },
  { href: "/recurring", label: "Recurring" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppShell({
  organizationName,
  children,
}: {
  organizationName: string | null;
  children: React.ReactNode;
}) {
  // No organization yet (onboarding flow): skip the nav chrome entirely.
  if (!organizationName) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 flex-col overflow-y-auto border-r border-border-default bg-surface px-4 py-6 sm:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <Image src="/brand/billflow-app-icon.svg" alt="" width={24} height={24} />
          <span className="text-base font-semibold text-text-primary">Billflow</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border-default pt-4">
          <p className="truncate px-2 text-xs font-medium text-text-tertiary">
            {organizationName}
          </p>
          <form action={signOut}>
            <SubmitButton
              className="mt-1 w-full justify-start bg-transparent px-2 py-2 text-left text-text-secondary shadow-none hover:bg-surface-subtle hover:text-text-primary"
              pendingText="Signing out…"
            >
              Sign out
            </SubmitButton>
          </form>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border-default bg-surface px-4 py-3 sm:hidden">
          <MobileNav organizationName={organizationName} />
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/brand/billflow-app-icon.svg" alt="" width={24} height={24} />
            <span className="text-sm font-semibold text-text-primary">Billflow</span>
          </Link>
          <div className="w-9" aria-hidden="true" />
        </header>
        <main className="flex-1 bg-page px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
