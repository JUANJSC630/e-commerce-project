/** Skeleton shown while the (possibly cold) media scan runs on the server. */
export default function MediaLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-100 animate-pulse" />
      </div>

      <div className="h-12 rounded-xl border border-slate-200 bg-white" />

      <div className="flex gap-1">
        {[64, 72, 96].map((w) => (
          <div key={w} className="h-8 rounded-lg bg-slate-100 animate-pulse" style={{ width: w }} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="aspect-square bg-slate-100 animate-pulse" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-3/4 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
