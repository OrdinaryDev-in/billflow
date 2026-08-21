import { Skeleton } from "@/components/ui/skeleton";

export default function PublicInvoiceLoading() {
  return (
    <div className="min-h-screen bg-page px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
