"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function PendingDot() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-0",
        pending && "animate-pulse opacity-60",
      )}
      style={pending ? undefined : { visibility: "hidden" }}
    />
  );
}

export function NavLink({
  href,
  children,
  onClick,
  className,
  activeClassName = "bg-primary-soft text-primary",
  inactiveClassName = "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? activeClassName : inactiveClassName,
        className,
      )}
    >
      {children}
      <PendingDot />
    </Link>
  );
}
