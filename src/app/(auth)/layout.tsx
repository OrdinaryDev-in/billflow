import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Image src="/brand/billflow-app-icon.svg" alt="" width={28} height={28} />
        <span className="text-lg font-semibold text-text-primary">Billflow</span>
      </Link>
      <div className="w-full max-w-sm rounded-lg border border-border-default bg-surface p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
