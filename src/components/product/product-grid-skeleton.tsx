import { Skeleton } from "@/components/ui/skeleton"

interface ProductGridSkeletonProps {
  /** Number of placeholder cards to render. */
  count?: number
}

/** Loading placeholder that mirrors the product grid layout. */
export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border overflow-hidden">
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-9 w-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  )
}
