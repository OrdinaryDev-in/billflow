"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { signOut } from "@/actions/auth";
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

export function MobileNav({ organizationName }: { organizationName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-text-primary/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-surface px-4 py-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between px-2">
              <span className="truncate text-sm font-semibold text-text-primary">
                {organizationName}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-border-default pt-4">
              <form action={signOut}>
                <SubmitButton
                  className="w-full justify-start bg-transparent px-2 py-2 text-left text-text-secondary shadow-none hover:bg-surface-subtle hover:text-text-primary"
                  pendingText="Signing out…"
                >
                  Sign out
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
