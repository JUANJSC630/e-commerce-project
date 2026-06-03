export default function StoreLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-[60vh] bg-brand-surface-alt" />
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="h-6 w-40 bg-brand-muted/20 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-brand-muted/20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
